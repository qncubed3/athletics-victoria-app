import { fetchEventResults } from './client'

// Parse relay member string from results row
function parseRelayMembers(value) {
  if (!value) {
    return []
  }
  const members = []
  const parts = value.split('^^')
  for (const rawMember of parts) {
    const trimmed = rawMember.trim()
    if (!trimmed) {
      continue
    }
    const fields = trimmed.split('|')
    while (fields.length < 6) {
      fields.push(null)
    }
    members.push({
      athlete_id: fields[0],
      member_flag: fields[1],
      bib: fields[2],
      first_name: fields[3],
      last_name: fields[4],
      seq_id: fields[5],
    })
  }
  return members
}

// Parse relay split string from results row
function parseRelaySplits(value) {
  if (!value) {
    return []
  }
  const splits = []
  const parts = value.split('^^')
  for (const rawSplit of parts) {
    const trimmed = rawSplit.trim()
    if (!trimmed) {
      continue
    }
    const fields = trimmed.split('|')
    while (fields.length < 3) {
      fields.push(null)
    }
    splits.push({
      split_flag: fields[0],
      split: fields[1],
      split_seconds: fields[2],
    })
  }
  return splits
}

// Collect sessItems_* rows from all tables
function getEventRows(tables) {
  const eventRows = []
  for (const tableName of Object.keys(tables)) {
    if (tableName.startsWith('sessItems_')) {
      const rows = tables[tableName]
      if (Array.isArray(rows)) {
        eventRows.push(...rows)
      }
    }
  }
  return eventRows
}

// Find rows that have RelayMembers set
function getRelayResultRows(tables) {
  const relayRows = []
  for (const tableName of Object.keys(tables)) {
    const rows = tables[tableName]
    if (!Array.isArray(rows)) {
      continue
    }
    for (const row of rows) {
      if (row && row.RelayMembers) {
        relayRows.push(row)
      }
    }
  }
  return relayRows
}

// Map EventPtr to event metadata row
function buildEventLookup(eventRows) {
  const lookup = {}
  for (const event of eventRows) {
    if (event && event.EventPtr) {
      lookup[event.EventPtr] = event
    }
  }
  return lookup
}

// Build leg list for one relay team
function buildRelayLegs(row) {
  const members = parseRelayMembers(row.RelayMembers)
  const splits = parseRelaySplits(row.RelaySplits)
  const legs = []
  const count = Math.max(members.length, splits.length)

  for (let i = 0; i < count; i++) {
    const member = members[i] || {}
    const split = splits[i] || {}
    const first = member.first_name || ''
    const last = member.last_name || ''
    const athleteName = `${first} ${last}`.trim()

    legs.push({
      leg_number: i + 1,
      athlete_id: member.athlete_id,
      bib: member.bib,
      athlete: athleteName || null,
      split: split.split,
      split_seconds: split.split_seconds,
    })
  }

  return legs
}

// One relay team result object
function buildRelayResult(row, event) {
  const distance = event.Distance
  const uom = event.UOM
  let distanceLabel = null
  if (distance && uom) {
    distanceLabel = `${distance}${uom}`
  }

  return {
    team: `${row.Affiliation || ''} ${row.TeamLtr || ''}`.trim(),
    affiliation: row.Affiliation,
    team_id: row.TeamId,
    team_letter: row.TeamLtr,
    event_ptr: row.EventPtr,
    event_number: event.EventNbr,
    discipline: event.Discipline,
    event_type: event.EventType,
    sex: event.Sex,
    division: event.Division,
    division_label: event.DivAbbr,
    event_note: event.EventNote,
    distance: distanceLabel,
    relay_size: event.RelaySize,
    place: row.EventPlace,
    heat_place: row.HeatPlace,
    performance: row.PerfDsp,
    performance_seconds: row.Performance,
    points: row.Points,
    status: row.Status,
    legs: buildRelayLegs(row),
  }
}

// Relay results for a round, optional club filter
export async function getRelayResults(
  season = '2026',
  series = 'xcr',
  roundNumber = '2',
  venue = 'all',
  club
) {
  const data = await fetchEventResults(season, series, roundNumber, venue)
  const tables = data.tables

  const eventRows = getEventRows(tables)
  let relayRows = getRelayResultRows(tables)
  const eventsByPtr = buildEventLookup(eventRows)

  if (club) {
    const clubUpper = club.toUpperCase()
    relayRows = relayRows.filter((row) => row.Affiliation === clubUpper)
  }

  const relays = []
  for (const row of relayRows) {
    const event = eventsByPtr[row.EventPtr] || {}
    relays.push(buildRelayResult(row, event))
  }

  let message = null
  if (relays.length === 0) {
    message = 'No relay results found for this round or club.'
  }

  return {
    source_url: data.source_url,
    season: season,
    series: series,
    round: roundNumber,
    venue: venue,
    club: club || null,
    relay_count: relays.length,
    relays: relays,
    message: message,
  }
}
