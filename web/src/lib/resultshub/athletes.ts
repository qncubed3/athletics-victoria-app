import { getCached, setCached } from '../api/cache'
import { fetchResultshubData } from './client'
import { parseAthleteResultsHtml, parseJsArrays } from './parsers'

const ATHLETES_CACHE_KEY = 'athletes-registry'

// Full athlete list used by search registry
export async function fetchAthletes() {
  const cached = getCached(ATHLETES_CACHE_KEY)
  if (cached) {
    return cached
  }

  const raw = await fetchResultshubData('db/select_athletes.php', {})
  const tables = parseJsArrays(raw.raw_text)
  const athletes = tables.athletes || []

  const result = {
    source_url: raw.source_url,
    athlete_count: athletes.length,
    athletes: athletes,
  }

  setCached(ATHLETES_CACHE_KEY, result)
  return result
}

// Results for one athlete, name format Last,First
export async function fetchAthleteResults(name) {
  const raw = await fetchResultshubData('db/fetch_athResults.php', {
    athleteName: name,
  })

  const parsed = parseAthleteResultsHtml(raw.raw_text)

  return {
    source_url: raw.source_url,
    athlete_name: name,
    data: parsed,
  }
}

const DISTANCE_EVENTS = [
  'shot put',
  'discus',
  'javelin',
  'hammer',
  'long jump',
  'triple jump',
  'high jump',
  'pole vault',
]

// Convert performance string to number for compare logic
function performanceToNumber(performance) {
  if (!performance) {
    return null
  }
  let text = performance.trim().toLowerCase().replace('h', '')
  if (['dnf', 'dns', 'dq', 'nm'].includes(text)) {
    return null
  }
  if (text.endsWith('m')) {
    const num = parseFloat(text.slice(0, -1))
    return Number.isFinite(num) ? num : null
  }
  if (text.includes(':')) {
    const parts = text.split(':').map((p) => parseFloat(p))
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    }
  }
  const plain = parseFloat(text)
  return Number.isFinite(plain) ? plain : null
}

// Return 0 tie, 1 first athlete wins, 2 second wins, -1 unknown
// DNF/DNS/DQ/NM loses to a valid mark on the other side
function determineWinner(event, perf1, perf2) {
  const val1 = performanceToNumber(perf1)
  const val2 = performanceToNumber(perf2)
  if (val1 === null && val2 === null) {
    return -1
  }
  if (val1 === null) {
    return 2
  }
  if (val2 === null) {
    return 1
  }
  if (val1 === val2) {
    return 0
  }
  const eventLower = event.toLowerCase()
  let isDistance = false
  for (const label of DISTANCE_EVENTS) {
    if (eventLower.includes(label)) {
      isDistance = true
      break
    }
  }
  if (isDistance) {
    return val1 > val2 ? 1 : 2
  }
  return val1 < val2 ? 1 : 2
}

// Compare two athletes on meets they both ran
export async function compareAthletes(name1, name2) {
  const athlete1 = await fetchAthleteResults(name1)
  const athlete2 = await fetchAthleteResults(name2)

  const results1 = athlete1.data.results
  const results2 = athlete2.data.results

  const index2 = {}
  for (const result of results2) {
    const key = `${result.meet_date}|${result.event}|${result.venue}`
    index2[key] = result
  }

  const comparisons = []
  let athlete1Wins = 0
  let athlete2Wins = 0
  let ties = 0
  let unknown = 0

  for (const result1 of results1) {
    const key = `${result1.meet_date}|${result1.event}|${result1.venue}`
    const result2 = index2[key]
    if (!result2) {
      continue
    }

    const winner = determineWinner(
      result1.event,
      result1.performance,
      result2.performance
    )

    if (winner === 1) {
      athlete1Wins += 1
    } else if (winner === 2) {
      athlete2Wins += 1
    } else if (winner === 0) {
      ties += 1
    } else {
      unknown += 1
    }

    comparisons.push({
      meet_date: result1.meet_date,
      event: result1.event,
      venue: result1.venue,
      athlete1_performance: result1.performance,
      athlete2_performance: result2.performance,
      winner: winner,
    })
  }

  return {
    athlete1: name1,
    athlete2: name2,
    overlap_count: comparisons.length,
    summary: {
      athlete1_wins: athlete1Wins,
      athlete2_wins: athlete2Wins,
      ties: ties,
      unknown: unknown,
    },
    comparisons: comparisons,
  }
}
