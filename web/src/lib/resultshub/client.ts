import { parseJsArrays } from './parsers'

const BASE_URL = 'https://athsvic.resultshub.com.au/php'

// Decide if we verify SSL when calling ResultsHub
function shouldVerifySsl() {
  const override = process.env.RESULTSHUB_SSL_VERIFY
  if (override !== undefined) {
    const off = ['0', 'false', 'no'].includes(override.toLowerCase())
    return !off
  }
  if (process.env.VERCEL) {
    return true
  }
  if (process.platform === 'win32') {
    return false
  }
  return true
}

// Build query string from a params object
function buildQuery(params) {
  if (!params || Object.keys(params).length === 0) {
    return ''
  }
  const search = new URLSearchParams(params)
  return `?${search.toString()}`
}

// GET request to ResultsHub, returns source_url and raw text body
export async function fetchResultshubData(path, params) {
  const query = buildQuery(params)
  const url = `${BASE_URL}/${path}${query}`

  // On Windows dev we may need to skip SSL verify, same as Django
  if (!shouldVerifySsl()) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`ResultsHub HTTP ${response.status}`)
  }

  const rawText = await response.text()

  return {
    source_url: response.url,
    raw_text: rawText,
  }
}

// Fetch full event results file for a round
export async function fetchEventResults(
  season = '2026',
  series = 'xcr',
  roundNumber = '1',
  venue = 'all'
) {
  const raw = await fetchResultshubData('resultsFileFetch.php', {
    season: season,
    series: series,
    round: roundNumber,
    venue: venue,
  })

  const tables = parseJsArrays(raw.raw_text)

  return {
    source_url: raw.source_url,
    season: season,
    series: series,
    round: roundNumber,
    venue: venue,
    table_count: Object.keys(tables).length,
    tables: tables,
  }
}
