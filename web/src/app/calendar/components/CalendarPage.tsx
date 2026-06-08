'use client'

import { useEffect, useState } from 'react'
import { Activity, CalendarDays, Layers } from 'lucide-react'
import type { CalendarFilters, CalendarViewMode } from '@/types/events'
import { defaultCalendarMonth } from '@/utils/eventCalendar'
import { DEFAULT_SEASON, useFilteredMeets, useSeasonEvents } from '@/hooks/useSeasonEvents'
import { CalendarListView } from './CalendarListView'
import { CalendarMonthView } from './CalendarMonthView'
import { CalendarViewToggle } from './CalendarViewToggle'
import { FilterPill } from '@/app/components/FilterPill'

const EMPTY_FILTERS: CalendarFilters = {
  season: DEFAULT_SEASON,
  series: 'all',
  status: 'all',
}

const statusClass =
  'rounded-xl px-5 py-4 text-[0.95rem] text-[var(--text-muted)]'
const filterRowClass =
  'mb-2 flex flex-wrap items-center gap-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-3'
const countTextClass = 'm-0 mb-3 text-[0.85rem] text-[var(--text-faint)]'

// main calendar page with filters and list or month view
export function CalendarPage() {
  const [filters, setFilters] = useState<CalendarFilters>(EMPTY_FILTERS)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('list')

  const now = new Date()
  const [calendarMonth, setCalendarMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  })

  const {
    loading,
    error,
    allMeets,
    seasonOptions,
    seriesOptions,
    statusOptions,
  } = useSeasonEvents(filters.season)

  const filteredMeets = useFilteredMeets(allMeets, filters)

  // jump the month grid to a month that has meets when filters change
  useEffect(() => {
    if (filteredMeets.length > 0) {
      setCalendarMonth(defaultCalendarMonth(filteredMeets))
    }
  }, [filters.season, filters.series, filters.status, filteredMeets])

  function goPrevMonth() {
    setCalendarMonth(({ year, month }) => {
      if (month === 0) {
        return { year: year - 1, month: 11 }
      }
      return { year, month: month - 1 }
    })
  }

  function goNextMonth() {
    setCalendarMonth(({ year, month }) => {
      if (month === 11) {
        return { year: year + 1, month: 0 }
      }
      return { year, month: month + 1 }
    })
  }

  function onFiltersChange(key: keyof CalendarFilters, value: string) {
    if (key === 'season') {
      setFilters({ season: value, series: 'all', status: 'all' })
      return
    }
    setFilters({ ...filters, [key]: value })
  }

  if (loading && allMeets.length === 0) {
    return <p className={`${statusClass} bg-[var(--bg-subtle)]`}>Loading calendar…</p>
  }

  if (error && allMeets.length === 0) {
    return (
      <div className={`${statusClass} bg-[var(--error-bg)] text-[var(--error-text)]`}>
        {error}
      </div>
    )
  }

  // pick list table or month grid
  let calendarBody
  if (viewMode === 'list') {
    calendarBody = <CalendarListView meets={filteredMeets} />
  } else {
    calendarBody = (
      <CalendarMonthView
        year={calendarMonth.year}
        month={calendarMonth.month}
        meets={filteredMeets}
        onPrevMonth={goPrevMonth}
        onNextMonth={goNextMonth}
      />
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-start justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
        <div className={filterRowClass}>
          <FilterPill
            icon={CalendarDays}
            ariaLabel="Filter by season"
            value={filters.season}
            onChange={(season) => onFiltersChange('season', season)}
            options={seasonOptions}
          />
          <FilterPill
            icon={Layers}
            ariaLabel="Filter by series"
            value={filters.series}
            onChange={(series) => onFiltersChange('series', series)}
            options={seriesOptions}
          />
          <FilterPill
            icon={Activity}
            ariaLabel="Filter by status"
            value={filters.status}
            onChange={(status) => onFiltersChange('status', status)}
            options={statusOptions}
          />
        </div>
        <CalendarViewToggle mode={viewMode} onChange={setViewMode} />
      </div>

      <p className={countTextClass}>
        Showing {filteredMeets.length} of {allMeets.length} meets
        {loading ? ' · refreshing…' : ''}
      </p>

      {calendarBody}
    </div>
  )
}
