import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, LineChart, MapPin, Timer } from 'lucide-react'
import type { AthleteResultRow } from '../types/athlete'
import { eventProgressionSeries, isDistanceEvent } from '../utils/athleteAnalytics'
import { EventProgressionChart } from './charts/EventProgressionChart'
import { FilterPill } from './FilterPill'

export interface ResultFilters {
  year: string
  event: string
  venue: string
}

interface FilterOptions {
  years: string[]
  events: string[]
  venues: string[]
}

interface AthleteResultsViewProps {
  filteredRows: AthleteResultRow[]
  totalCount: number
  filters: ResultFilters
  filterOptions: FilterOptions
  onFiltersChange: (filters: ResultFilters) => void
}

export function AthleteResultsView({
  filteredRows,
  totalCount,
  filters,
  filterOptions,
  onFiltersChange,
}: AthleteResultsViewProps) {
  const [showProgression, setShowProgression] = useState(false)
  const eventSelected = filters.event !== 'all'

  useEffect(() => {
    if (filters.event === 'all') {
      setShowProgression(false)
    }
  }, [filters.event])

  const progressionData = useMemo(() => {
    if (!eventSelected) return []
    return eventProgressionSeries(filteredRows, filters.event)
  }, [filteredRows, filters.event, eventSelected])

  const invertY = eventSelected && !isDistanceEvent(filters.event)

  return (
    <>
      <div className="athletes-filters">
        <FilterPill
          icon={CalendarDays}
          ariaLabel="Filter by year"
          value={filters.year}
          onChange={(year) => onFiltersChange({ ...filters, year })}
          options={[
            { value: 'all', label: 'All years' },
            ...filterOptions.years.map((y) => ({ value: y, label: y })),
          ]}
        />
        <FilterPill
          icon={Timer}
          ariaLabel="Filter by event"
          value={filters.event}
          onChange={(event) => onFiltersChange({ ...filters, event })}
          options={[
            { value: 'all', label: 'All events' },
            ...filterOptions.events.map((ev) => ({ value: ev, label: ev })),
          ]}
        />
        <FilterPill
          icon={MapPin}
          ariaLabel="Filter by venue"
          value={filters.venue}
          onChange={(venue) => onFiltersChange({ ...filters, venue })}
          options={[
            { value: 'all', label: 'All venues' },
            ...filterOptions.venues.map((v) => ({ value: v, label: v })),
          ]}
        />

        <button
          type="button"
          className={`filter-action ${showProgression && eventSelected ? 'filter-action--active' : ''}`}
          onClick={() => setShowProgression((v) => !v)}
          disabled={!eventSelected}
          aria-pressed={eventSelected ? showProgression : undefined}
          title={!eventSelected ? 'Select an event to view progression' : undefined}
        >
          <LineChart size={15} strokeWidth={2.25} aria-hidden />
          {!eventSelected
            ? 'Select an event'
            : showProgression
              ? 'Hide progression'
              : 'Show progression'}
        </button>
      </div>

      <p className="athletes-filters__count">
        Showing {filteredRows.length} of {totalCount} results
      </p>

      {showProgression && eventSelected && (
        <div className="results-progression">
          <EventProgressionChart
            event={filters.event}
            data={progressionData}
            invertY={invertY}
          />
        </div>
      )}

      {filteredRows.length === 0 ? (
        <p className="athletes-status">No results match these filters.</p>
      ) : (
        <div className="athletes-table-wrap">
          <table className="athletes-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Performance</th>
                <th>Venue</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => (
                <tr key={`${row.meet_date}-${row.event}-${i}`}>
                  <td>{row.meet_date}</td>
                  <td>
                    <span className="athletes-table__primary">{row.event}</span>
                    {row.event_specification && (
                      <span className="athletes-table__sub">{row.event_specification}</span>
                    )}
                  </td>
                  <td>
                    <span className="athletes-table__primary athletes-table__perf">
                      {row.performance ?? '—'}
                    </span>
                    {row.wind && (
                      <span className="athletes-table__sub">Wind {row.wind}</span>
                    )}
                  </td>
                  <td>{row.venue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
