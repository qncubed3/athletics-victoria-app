import type { CalendarFilters, ParsedMeet, SeasonMeet, SeasonSeries } from '../types/events'

const MEET_DATE_RE = /^(\d{4})(\d{2})(\d{2})$/

export function parseMeetDate(raw: string): string | null {
  const match = raw.match(MEET_DATE_RE)
  if (!match) return null
  return `${match[1]}-${match[2]}-${match[3]}`
}

export function formatMeetDateLabel(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function seriesLabelMap(series: SeasonSeries[]) {
  const map = new Map<string, string>()
  for (const s of series) {
    map.set(s.code, s.shortDesc || s.longDesc || s.code)
  }
  return map
}

export function parseMeets(meets: SeasonMeet[], seriesMap: Map<string, string>): ParsedMeet[] {
  return meets
    .map((meet) => {
      const date = parseMeetDate(meet.from)
      if (!date) return null
      return {
        ...meet,
        date,
        dateLabel: formatMeetDateLabel(date),
        seriesLabel: seriesMap.get(meet.series) ?? meet.series,
      }
    })
    .filter((m): m is ParsedMeet => m !== null)
    .sort((a, b) => a.date.localeCompare(b.date) || a.desc.localeCompare(b.desc))
}

export function filterMeets(meets: ParsedMeet[], filters: Pick<CalendarFilters, 'series' | 'status'>) {
  return meets.filter((meet) => {
    if (filters.series !== 'all' && meet.series !== filters.series) return false
    if (filters.status !== 'all' && meet.stat !== filters.status) return false
    return true
  })
}

export function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

export function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function parseMonthKey(key: string) {
  const [y, m] = key.split('-').map(Number)
  return { year: y, month: m - 1 }
}

export function meetsInMonth(meets: ParsedMeet[], year: number, month: number) {
  const prefix = monthKey(year, month)
  return meets.filter((m) => m.date.startsWith(prefix))
}

export interface CalendarDay {
  date: string | null
  day: number | null
  isCurrentMonth: boolean
  meets: ParsedMeet[]
}

export function buildMonthGrid(year: number, month: number, meets: ParsedMeet[]): CalendarDay[] {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prefix = monthKey(year, month)

  const meetsByDay = new Map<number, ParsedMeet[]>()
  for (const meet of meets) {
    if (!meet.date.startsWith(prefix)) continue
    const day = parseInt(meet.date.slice(8, 10), 10)
    const list = meetsByDay.get(day) ?? []
    list.push(meet)
    meetsByDay.set(day, list)
  }

  const cells: CalendarDay[] = []

  for (let i = 0; i < startOffset; i++) {
    cells.push({ date: null, day: null, isCurrentMonth: false, meets: [] })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${prefix}-${String(day).padStart(2, '0')}`
    cells.push({
      date,
      day,
      isCurrentMonth: true,
      meets: meetsByDay.get(day) ?? [],
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null, isCurrentMonth: false, meets: [] })
  }

  return cells
}

export function defaultCalendarMonth(meets: ParsedMeet[]) {
  if (meets.length === 0) {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  }

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const upcoming = meets.find((m) => m.date >= todayStr) ?? meets[meets.length - 1]
  const d = new Date(`${upcoming.date}T00:00:00`)
  return { year: d.getFullYear(), month: d.getMonth() }
}
