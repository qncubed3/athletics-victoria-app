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

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

// "12:30:00 PM" → seconds since midnight
function parseTimeOfDayToSeconds(value) {
  if (!value) {
    return null
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) {
    return null
  }

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  const meridiem = match[4].toUpperCase()

  if (meridiem === 'PM' && hours !== 12) {
    hours += 12
  }
  if (meridiem === 'AM' && hours === 12) {
    hours = 0
  }

  return hours * 3600 + minutes * 60 + seconds
}

function formatTimeOfDay(totalSeconds) {
  const normalized = ((totalSeconds % 86400) + 86400) % 86400
  const hours24 = Math.floor(normalized / 3600)
  const minutes = Math.floor((normalized % 3600) / 60)
  const seconds = Math.floor(normalized % 60)
  const meridiem = hours24 >= 12 ? 'PM' : 'AM'
  let hours12 = hours24 % 12
  if (hours12 === 0) {
    hours12 = 12
  }

  return `${hours12}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${meridiem}`
}

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

function buildSessionLookup(tables) {
  const lookup = {}
  for (const tableName of Object.keys(tables)) {
    if (!tableName.startsWith('sessions_')) {
      continue
    }
    const rows = tables[tableName]
    if (!Array.isArray(rows)) {
      continue
    }
    for (const session of rows) {
      if (session?.SessPtr) {
        lookup[session.SessPtr] = session
      }
    }
  }
  return lookup
}

function getLegDistanceM(event, session) {
  if (event?.SessPtr === '2') {
    return 3000
  }
  if (event?.SessPtr === '1') {
    return 6000
  }

  const distanceKm = toNumber(event?.Distance)
  const relaySize = toNumber(event?.RelaySize)
  if (distanceKm != null && relaySize) {
    return Math.round((distanceKm * 1000) / relaySize)
  }

  const sessName = session?.SessName || ''
  const kmMatch = sessName.match(/(\d+(?:\.\d+)?)\s*km/i)
  if (kmMatch) {
    return Math.round(Number(kmMatch[1]) * 1000)
  }

  return null
}

function buildRelayLegs(row, eventStartSeconds, legDistanceM) {
  const members = parseRelayMembers(row.RelayMembers)
  const splits = parseRelaySplits(row.RelaySplits)
  const legs = []
  const count = Math.max(members.length, splits.length)
  let cumulativeSeconds = 0

  for (let i = 0; i < count; i++) {
    const member = members[i] || {}
    const split = splits[i] || {}
    const first = member.first_name || ''
    const last = member.last_name || ''
    const athleteName = `${first} ${last}`.trim()
    const legNumber = i + 1
    const splitSeconds = toNumber(split.split_seconds) ?? 0
    const cumulativeStartSeconds = Math.round(cumulativeSeconds * 1000) / 1000
    cumulativeSeconds += splitSeconds
    const cumulativeEndSeconds = Math.round(cumulativeSeconds * 1000) / 1000

    legs.push({
      leg_number: legNumber,
      athlete_id: member.athlete_id,
      bib: member.bib,
      athlete: athleteName || null,
      split: split.split,
      split_seconds: split.split_seconds,
      cumulative_start_seconds: cumulativeStartSeconds,
      cumulative_end_seconds: cumulativeEndSeconds,
      start_time:
        eventStartSeconds != null
          ? formatTimeOfDay(eventStartSeconds + cumulativeStartSeconds)
          : null,
      end_time:
        eventStartSeconds != null
          ? formatTimeOfDay(eventStartSeconds + cumulativeEndSeconds)
          : null,
      start_distance_m: legDistanceM != null ? (legNumber - 1) * legDistanceM : null,
      end_distance_m: legDistanceM != null ? legNumber * legDistanceM : null,
    })
  }

  return legs
}

function buildRelayTeam(row, event, eventStartSeconds, legDistanceM) {
  return {
    team_name: `${row.Affiliation || ''} ${row.TeamLtr || ''}`.trim(),
    affiliation: row.Affiliation,
    team_id: row.TeamId,
    team_letter: row.TeamLtr,
    place: row.EventPlace,
    heat_place: row.HeatPlace,
    performance: row.PerfDsp,
    performance_seconds: row.Performance,
    points: row.Points,
    status: row.Status,
    legs: buildRelayLegs(row, eventStartSeconds, legDistanceM),
  }
}

function buildRelayEvent(event, session, teamRows) {
  const distance = event.Distance
  const uom = event.UOM
  const totalDistanceM =
    distance && uom === 'km' ? Math.round(toNumber(distance) * 1000) : null
  const legDistanceM = getLegDistanceM(event, session)
  const eventStartTime = event.SessTime || null
  const eventStartSeconds = parseTimeOfDayToSeconds(eventStartTime)

  const teams = teamRows
    .map((row) => buildRelayTeam(row, event, eventStartSeconds, legDistanceM))
    .sort((a, b) => {
      const placeA = toNumber(a.place) ?? Number.MAX_SAFE_INTEGER
      const placeB = toNumber(b.place) ?? Number.MAX_SAFE_INTEGER
      return placeA - placeB
    })

  const durationSeconds = teams.reduce((max, team) => {
    const lastLeg = team.legs[team.legs.length - 1]
    const endSeconds = lastLeg?.cumulative_end_seconds ?? 0
    return Math.max(max, endSeconds)
  }, 0)

  return {
    sess_order: event.SessOrder,
    event_ptr: event.EventPtr,
    event_number: event.EventNbr,
    sess_ptr: event.SessPtr,
    sess_name: session?.SessName ?? null,
    event_start_time: eventStartTime,
    event_end_time:
      eventStartSeconds != null && durationSeconds > 0
        ? formatTimeOfDay(eventStartSeconds + durationSeconds)
        : null,
    duration_seconds: durationSeconds || null,
    discipline: event.Discipline,
    event_type: event.EventType,
    sex: event.Sex,
    division: event.Division,
    division_label: event.DivAbbr,
    event_note: event.EventNote,
    distance: distance && uom ? `${distance}${uom}` : null,
    total_distance_m: totalDistanceM,
    leg_distance_m: legDistanceM,
    relay_size: event.RelaySize,
    team_count: teams.length,
    teams,
  }
}

function groupRowsByEventPtr(relayRows) {
  const grouped = {}
  for (const row of relayRows) {
    const eventPtr = row.EventPtr
    if (!grouped[eventPtr]) {
      grouped[eventPtr] = []
    }
    grouped[eventPtr].push(row)
  }
  return grouped
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
  const relayRows = getRelayResultRows(tables)
  const sessionsByPtr = buildSessionLookup(tables)
  const teamsByEventPtr = groupRowsByEventPtr(relayRows)

  if (club) {
    const clubUpper = club.toUpperCase()
    for (const eventPtr of Object.keys(teamsByEventPtr)) {
      teamsByEventPtr[eventPtr] = teamsByEventPtr[eventPtr].filter(
        (row) => row.Affiliation === clubUpper
      )
      if (teamsByEventPtr[eventPtr].length === 0) {
        delete teamsByEventPtr[eventPtr]
      }
    }
  }

  const relayEvents = eventRows
    .filter((event) => event?.Discipline === 'Relay' && teamsByEventPtr[event.EventPtr]?.length)
    .sort((a, b) => toNumber(a.SessOrder) - toNumber(b.SessOrder))

  const relays = []
  let teamCount = 0

  for (const event of relayEvents) {
    const teamRows = teamsByEventPtr[event.EventPtr] || []
    if (teamRows.length === 0) {
      continue
    }

    const session = sessionsByPtr[event.SessPtr] || null
    relays.push(buildRelayEvent(event, session, teamRows))
    teamCount += teamRows.length
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
    relay_event_count: relays.length,
    team_count: teamCount,
    relays: relays,
    message: message,
  }
}
