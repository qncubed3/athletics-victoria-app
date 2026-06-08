'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, LineChart, MapPin, Timer } from 'lucide-react'
import type { AthleteResultRow } from '@/types/athlete'
import { eventProgressionSeries, isDistanceEvent } from '@/utils/athleteAnalytics'
import { EventProgressionChart } from './charts/EventProgressionChart'
import { FilterPill } from '@/app/components/FilterPill'
import { cn } from '@/lib/cn'

// filter values. AthletesPage owns the state and passes it down
export type ResultFilters = {
  year: string
  event: string
  venue: string
}

// shared tailwind for the filter row and table
const filterRowClass =
  'mb-2 flex flex-wrap items-center gap-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-3'
const countTextClass = 'mb-3 text-[0.85rem] text-[var(--text-faint)]'
const tableWrapClass = 'overflow-x-auto rounded-[14px] border border-[var(--border)]'
const thClass =
  'border-b border-[var(--border)] px-4 py-3 text-left font-semibold whitespace-nowrap text-[var(--text-secondary)]'
const tdClass =
  'border-b border-[var(--border-subtle)] px-4 py-3 text-[var(--text-primary)]'

const progressionBtnClass =
  'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3.5 py-2 text-[0.875rem] font-semibold text-white shadow-[var(--shadow-pill)] transition-[background,border-color,box-shadow,opacity] duration-150 hover:opacity-90 hover:shadow-[var(--shadow-dropdown)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--bg-muted)] disabled:text-[var(--text-faint)] disabled:opacity-100 disabled:shadow-none disabled:hover:opacity-100 disabled:hover:shadow-none'

// turn a string list into FilterPill options with an "all" choice at the top
function buildPillOptions(allLabel: string, values: string[]) {
  const allOption = { value: 'all', label: allLabel }
  const rest = values.map((value) => ({ value, label: value }))
  return [allOption, ...rest]
}

// single row in the results table
function ResultRow({ row }: { row: AthleteResultRow }) {
  return (
    <tr className="hover:bg-[var(--bg-subtle)] last:[&_td]:border-b-0">
      <td className={tdClass}>{row.meet_date}</td>
      <td className={tdClass}>
        <span className="block">{row.event}</span>
        {row.event_specification && (
          <span className="mt-0.5 block text-[0.8rem] font-normal text-[var(--text-faint)]">
            {row.event_specification}
          </span>
        )}
      </td>
      <td className={tdClass}>
        <span className="block font-semibold tabular-nums text-[var(--accent)]">
          {row.performance ?? '—'}
        </span>
        {row.wind && (
          <span className="mt-0.5 block text-[0.8rem] font-normal text-[var(--text-faint)]">
            Wind {row.wind}
          </span>
        )}
      </td>
      <td className={tdClass}>{row.venue}</td>
    </tr>
  )
}

// results tab. filters, optional progression chart, then the table
export function AthleteResultsView({
  filteredRows,
  totalCount,
  filters,
  filterOptions,
  onFiltersChange,
}: {
  filteredRows: AthleteResultRow[]
  totalCount: number
  filters: ResultFilters
  filterOptions: { years: string[]; events: string[]; venues: string[] }
  onFiltersChange: (filters: ResultFilters) => void
}) {
  const [showProgression, setShowProgression] = useState(false)

  const eventSelected = filters.event !== 'all'

  // hide the chart if user picks "all events" again
  useEffect(() => {
    if (filters.event === 'all') {
      setShowProgression(false)
    }
  }, [filters.event])

  // chart points for the selected event only
  let progressionData: ReturnType<typeof eventProgressionSeries> = []
  if (eventSelected) {
    progressionData = eventProgressionSeries(filteredRows, filters.event)
  }

  // track events flip the y axis so faster times go up
  let invertY = false
  if (eventSelected && !isDistanceEvent(filters.event)) {
    invertY = true
  }

  // label on the progression toggle button
  let progressionLabel = 'Select an event'
  if (eventSelected) {
    progressionLabel = showProgression ? 'Hide progression' : 'Show progression'
  }

  function updateFilter(key: keyof ResultFilters, value: string) {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <>
      <div className={filterRowClass}>
        <FilterPill
          icon={CalendarDays}
          ariaLabel="Filter by year"
          value={filters.year}
          onChange={(year) => updateFilter('year', year)}
          options={buildPillOptions('All years', filterOptions.years)}
        />
        <FilterPill
          icon={Timer}
          ariaLabel="Filter by event"
          value={filters.event}
          onChange={(event) => updateFilter('event', event)}
          options={buildPillOptions('All events', filterOptions.events)}
        />
        <FilterPill
          icon={MapPin}
          ariaLabel="Filter by venue"
          value={filters.venue}
          onChange={(venue) => updateFilter('venue', venue)}
          options={buildPillOptions('All venues', filterOptions.venues)}
        />

        <button
          type="button"
          className={cn(
            progressionBtnClass,
            showProgression &&
              eventSelected &&
              'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_0_3px_var(--accent-soft)]'
          )}
          onClick={() => setShowProgression(!showProgression)}
          disabled={!eventSelected}
          aria-pressed={eventSelected ? showProgression : undefined}
          title={!eventSelected ? 'Select an event to view progression' : undefined}
        >
          <LineChart size={15} strokeWidth={2.25} aria-hidden />
          {progressionLabel}
        </button>
      </div>

      <p className={countTextClass}>
        Showing {filteredRows.length} of {totalCount} results
      </p>

      {showProgression && eventSelected && (
        <div className="mb-4">
          <EventProgressionChart
            event={filters.event}
            data={progressionData}
            invertY={invertY}
          />
        </div>
      )}

      {filteredRows.length === 0 ? (
        <p className="rounded-xl bg-[var(--bg-subtle)] px-5 py-4 text-[0.95rem] text-[var(--text-muted)]">
          No results match these filters.
        </p>
      ) : (
        <div className={tableWrapClass}>
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[var(--bg-subtle)]">
              <tr>
                <th className={thClass}>Date</th>
                <th className={thClass}>Event</th>
                <th className={thClass}>Performance</th>
                <th className={thClass}>Venue</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <ResultRow key={`${row.meet_date}-${row.event}-${i}`} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
