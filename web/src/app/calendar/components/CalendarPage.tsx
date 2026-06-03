'use client'

import { useCallback, useEffect, useState } from 'react'
import { Activity, CalendarDays, Layers } from 'lucide-react'
import type { CalendarFilters, CalendarViewMode } from '@/types/events'
import { defaultCalendarMonth } from '@/utils/eventCalendar'
import { DEFAULT_SEASON, useFilteredMeets, useSeasonEvents } from '@/hooks/useSeasonEvents'
import { CalendarListView, CalendarMonthView, CalendarViewToggle } from './index'
import { FilterPill } from '@/app/components/FilterPill'

const EMPTY_FILTERS: CalendarFilters = {
  season: DEFAULT_SEASON,
  series: 'all',
  status: 'all',
}

export function CalendarPage() {
  const [filters, setFilters] = useState<CalendarFilters>(EMPTY_FILTERS)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('list')
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
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

  useEffect(() => {
    if (filteredMeets.length > 0) {
      setCalendarMonth(defaultCalendarMonth(filteredMeets))
    }
  }, [filters.season, filters.series, filters.status, filteredMeets])

  const goPrevMonth = useCallback(() => {
    setCalendarMonth(({ year, month }) => {
      if (month === 0) return { year: year - 1, month: 11 }
      return { year, month: month - 1 }
    })
  }, [])

  const goNextMonth = useCallback(() => {
    setCalendarMonth(({ year, month }) => {
      if (month === 11) return { year: year + 1, month: 0 }
      return { year, month: month + 1 }
    })
  }, [])

  if (loading && allMeets.length === 0) {
    return <p className="athletes-status">Loading calendar…</p>
  }

  if (error && allMeets.length === 0) {
    return <div className="athletes-status athletes-status--error">{error}</div>
  }

  return (
    <div className="calendar-page">
      <div className="calendar-toolbar">
        <div className="athletes-filters">
          <FilterPill
            icon={CalendarDays}
            ariaLabel="Filter by season"
            value={filters.season}
            onChange={(season) => setFilters({ season, series: 'all', status: 'all' })}
            options={seasonOptions}
          />
          <FilterPill
            icon={Layers}
            ariaLabel="Filter by series"
            value={filters.series}
            onChange={(series) => setFilters((f) => ({ ...f, series }))}
            options={seriesOptions}
          />
          <FilterPill
            icon={Activity}
            ariaLabel="Filter by status"
            value={filters.status}
            onChange={(status) => setFilters((f) => ({ ...f, status }))}
            options={statusOptions}
          />
        </div>
        <CalendarViewToggle mode={viewMode} onChange={setViewMode} />
      </div>

      <p className="athletes-filters__count">
        Showing {filteredMeets.length} of {allMeets.length} meets
        {loading ? ' · refreshing…' : ''}
      </p>

      {viewMode === 'list' ? (
        <CalendarListView meets={filteredMeets} />
      ) : (
        <CalendarMonthView
          year={calendarMonth.year}
          month={calendarMonth.month}
          meets={filteredMeets}
          onPrevMonth={goPrevMonth}
          onNextMonth={goNextMonth}
        />
      )}
    </div>
  )
}
