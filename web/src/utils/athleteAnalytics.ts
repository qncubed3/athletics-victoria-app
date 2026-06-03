import type { AthleteResultRow } from '../types/athlete'

export interface CountEntry {
  label: string
  count: number
}

export interface YearCount {
  year: string
  count: number
}

export interface PersonalRecord {
  event: string
  performance: string
  numericValue: number
  meetDate: string
  venue: string
  wind: string | null
  isDistanceEvent: boolean
  windAided: boolean
  resultCount: number
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

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function isDistanceEvent(event: string) {
  const lower = event.toLowerCase()
  return DISTANCE_EVENTS.some((d) => lower.includes(d))
}

/** Format seconds as athletics time for chart axis (11.50 · 1:23.45 · 1:05:23.45). */
export function formatTimeAxis(seconds: number): string {
  if (!Number.isFinite(seconds)) return ''

  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${String(minutes).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`
  }

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds - minutes * 60
    return `${minutes}:${secs.toFixed(2).padStart(5, '0')}`
  }

  return seconds.toFixed(2)
}

export function formatPerformanceAxis(value: number, event: string): string {
  if (isDistanceEvent(event)) {
    return `${value.toFixed(2)}m`
  }
  return formatTimeAxis(value)
}

export function performanceToNumber(performance: string | null): number | null {
  if (!performance) return null

  const normalized = performance.trim().toLowerCase().replace('h', '')
  if (['dnf', 'dns', 'dq', 'nm', '—', '-'].includes(normalized)) return null

  if (normalized.endsWith('m')) {
    const n = parseFloat(normalized.slice(0, -1))
    return Number.isFinite(n) ? n : null
  }

  if (normalized.includes(':')) {
    const parts = normalized.split(':').map(parseFloat)
    if (parts.some((p) => !Number.isFinite(p))) return null
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    }
  }

  const n = parseFloat(normalized)
  return Number.isFinite(n) ? n : null
}

function parseWind(wind: string | null): number | null {
  if (!wind) return null
  const n = parseFloat(wind.replace(/[^0-9.+-]/g, ''))
  return Number.isFinite(n) ? n : null
}

export function isWindAided(wind: string | null, event: string) {
  if (isDistanceEvent(event)) return false
  const w = parseWind(wind)
  return w !== null && w > 2.0
}

function countBy(rows: AthleteResultRow[], key: keyof AthleteResultRow) {
  const map = new Map<string, number>()
  for (const row of rows) {
    const raw = row[key]
    if (raw == null || raw === '') continue
    const label = String(raw)
    map.set(label, (map.get(label) ?? 0) + 1)
  }
  return map
}

export function countsByYear(rows: AthleteResultRow[]): YearCount[] {
  const years = new Map<string, number>()

  for (const row of rows) {
    const year = row.meet_date.slice(0, 4)
    if (/^\d{4}$/.test(year)) {
      years.set(year, (years.get(year) ?? 0) + 1)
    }
  }

  return [...years.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year))
}

export function topCounts(
  rows: AthleteResultRow[],
  key: keyof AthleteResultRow,
  limit = 8
): CountEntry[] {
  const map = countBy(rows, key)
  const sorted = [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

  if (sorted.length <= limit) return sorted

  const top = sorted.slice(0, limit)
  const rest = sorted.slice(limit).reduce((sum, e) => sum + e.count, 0)
  if (rest > 0) top.push({ label: 'Other', count: rest })
  return top
}

export function countsByMonth(rows: AthleteResultRow[]): CountEntry[] {
  const counts = new Array(12).fill(0)

  for (const row of rows) {
    const parts = row.meet_date.split('-')
    if (parts.length < 2) continue
    const month = parseInt(parts[1], 10)
    if (month >= 1 && month <= 12) counts[month - 1] += 1
  }

  return MONTH_LABELS.map((label, i) => ({ label, count: counts[i] }))
}

export function computePersonalRecords(rows: AthleteResultRow[]): PersonalRecord[] {
  const byEvent = new Map<string, AthleteResultRow[]>()

  for (const row of rows) {
    const list = byEvent.get(row.event) ?? []
    list.push(row)
    byEvent.set(row.event, list)
  }

  const records: PersonalRecord[] = []

  for (const [event, eventRows] of byEvent) {
    const distance = isDistanceEvent(event)
    let best: PersonalRecord | null = null

    for (const row of eventRows) {
      const numericValue = performanceToNumber(row.performance)
      if (numericValue === null) continue

      if (!best) {
        best = {
          event,
          performance: row.performance!,
          numericValue,
          meetDate: row.meet_date,
          venue: row.venue,
          wind: row.wind,
          isDistanceEvent: distance,
          windAided: isWindAided(row.wind, event),
          resultCount: eventRows.length,
        }
        continue
      }

      const isBetter = distance
        ? numericValue > best.numericValue
        : numericValue < best.numericValue

      if (isBetter) {
        best = {
          event,
          performance: row.performance!,
          numericValue,
          meetDate: row.meet_date,
          venue: row.venue,
          wind: row.wind,
          isDistanceEvent: distance,
          windAided: isWindAided(row.wind, event),
          resultCount: eventRows.length,
        }
      }
    }

    if (best) records.push(best)
  }

  return records.sort((a, b) => {
    if (b.resultCount !== a.resultCount) return b.resultCount - a.resultCount
    return a.event.localeCompare(b.event)
  })
}

export interface ProgressionPoint {
  date: string
  timestamp: number
  dateLabel: string
  performance: string
  value: number
  venue: string
  wind: string | null
}

function formatChartDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' })
}

export function eventProgressionSeries(
  rows: AthleteResultRow[],
  event: string
): ProgressionPoint[] {
  return rows
    .filter((row) => row.event === event)
    .map((row) => {
      const value = performanceToNumber(row.performance)
      if (value === null || !row.performance) return null
      return {
        date: row.meet_date,
        timestamp: new Date(`${row.meet_date}T00:00:00`).getTime(),
        dateLabel: formatChartDate(row.meet_date),
        performance: row.performance,
        value,
        venue: row.venue,
        wind: row.wind,
      }
    })
    .filter((p): p is ProgressionPoint => p !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function activitySummary(rows: AthleteResultRow[]) {
  const years = countsByYear(rows)
  const events = new Set(rows.map((r) => r.event))
  const venues = new Set(rows.map((r) => r.venue))
  const dates = rows.map((r) => r.meet_date).sort()

  return {
    totalResults: rows.length,
    yearsActive: years.length,
    uniqueEvents: events.size,
    uniqueVenues: venues.size,
    firstMeet: dates[0] ?? null,
    lastMeet: dates[dates.length - 1] ?? null,
    busiestYear: years.reduce(
      (best, y) => (y.count > best.count ? y : best),
      years[0] ?? { year: '—', count: 0 }
    ),
  }
}
