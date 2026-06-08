'use client'

import { useCallback, useMemo, useState } from 'react'
import { fetchAthleteResults } from '@/api/client'
import type {
  AthleteResultRow,
  AthleteResultsResponse,
  AthleteSuggestion,
} from '@/types/athlete'
import { AthleteSearchPicker } from '@/app/components/AthleteSearchPicker'
import { cn } from '@/lib/cn'
import { AthleteActivityView } from './AthleteActivityView'
import { AthleteRecordsView } from './AthleteRecordsView'
import { AthleteResultsView, type ResultFilters } from './AthleteResultsView'

type AthleteTab = 'results' | 'activity' | 'records'

const TABS: { id: AthleteTab; label: string }[] = [
  { id: 'results', label: 'Results' },
  { id: 'activity', label: 'Activity' },
  { id: 'records', label: 'Records' },
]

const EMPTY_FILTERS: ResultFilters = {
  year: 'all',
  event: 'all',
  venue: 'all',
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function yearsFromResults(rows: AthleteResultRow[]) {
  return uniqueSorted(
    rows.map((r) => r.meet_date.slice(0, 4)).filter((y) => /^\d{4}$/.test(y))
  ).sort((a, b) => Number(b) - Number(a))
}

function filterResults(rows: AthleteResultRow[], filters: ResultFilters) {
  return rows.filter((row) => {
    if (filters.year !== 'all' && !row.meet_date.startsWith(filters.year)) {
      return false
    }
    if (filters.event !== 'all' && row.event !== filters.event) return false
    if (filters.venue !== 'all' && row.venue !== filters.venue) return false
    return true
  })
}

export function AthletesPage() {
  const [selected, setSelected] = useState<AthleteSuggestion | null>(null)
  const [results, setResults] = useState<AthleteResultsResponse | null>(null)
  const [resultsLoading, setResultsLoading] = useState(false)
  const [resultsError, setResultsError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ResultFilters>(EMPTY_FILTERS)
  const [activeTab, setActiveTab] = useState<AthleteTab>('results')

  const filterOptions = useMemo(() => {
    if (!results) return { years: [], events: [], venues: [] }
    const rows = results.data.results
    return {
      years: yearsFromResults(rows),
      events: uniqueSorted(rows.map((r) => r.event)),
      venues: uniqueSorted(rows.map((r) => r.venue)),
    }
  }, [results])

  const filteredRows = useMemo(() => {
    if (!results) return []
    return filterResults(results.data.results, filters)
  }, [results, filters])

  const selectAthlete = useCallback(async (athlete: AthleteSuggestion) => {
    setSelected(athlete)
    setResultsLoading(true)
    setResultsError(null)
    setResults(null)
    setFilters(EMPTY_FILTERS)
    setActiveTab('results')

    try {
      const data = await fetchAthleteResults(athlete.apiName)
      setResults(data)
    } catch (e) {
      console.error('Error fetching athlete results:', e)
      setResultsError('Error fetching results')
    } finally {
      setResultsLoading(false)
    }
  }, [])

  function clearSearch() {
    setSelected(null)
    setResults(null)
    setFilters(EMPTY_FILTERS)
    setActiveTab('results')
  }

  return (
    <div className="flex flex-col gap-6">
      <AthleteSearchPicker
        id="athlete-search"
        label="Search athletes"
        selected={selected}
        onSelect={selectAthlete}
        onClear={clearSearch}
        showRegistryHints
      />

      {resultsLoading && (
        <div className="rounded-xl bg-[var(--bg-subtle)] px-5 py-4 text-[0.95rem] text-[var(--text-muted)]">
          Loading results…
        </div>
      )}

      {resultsError && (
        <div className="rounded-xl bg-[var(--error-bg)] px-5 py-4 text-[0.95rem] text-[var(--error-text)]">
          {resultsError}
        </div>
      )}

      {results && !resultsLoading && (
        <section>
          <header className="mb-4">
            <h3 className="m-0 mb-2 text-[1.35rem] font-bold text-[var(--text-primary)]">
              {results.data.athlete_info.athlete ?? selected?.displayName}
            </h3>
            <div className="flex flex-wrap gap-3 text-[0.875rem] text-[var(--text-muted)]">
              {results.data.athlete_info.club && (
                <span className="rounded-lg bg-[var(--bg-muted)] px-2.5 py-1">
                  Club {results.data.athlete_info.club}
                </span>
              )}
              {results.data.athlete_info.bib && (
                <span className="rounded-lg bg-[var(--bg-muted)] px-2.5 py-1">
                  Bib {results.data.athlete_info.bib}
                  {results.data.athlete_info.bib_year
                    ? ` (${results.data.athlete_info.bib_year})`
                    : ''}
                </span>
              )}
              {results.data.athlete_info.recent_result_age && (
                <span className="rounded-lg bg-[var(--bg-muted)] px-2.5 py-1">
                  Age {results.data.athlete_info.recent_result_age}
                </span>
              )}
            </div>

            {results.data.results.length > 0 && (
              <div
                className="mt-5 flex flex-wrap gap-1.5 border-t border-[var(--border)] pt-4"
                role="tablist"
                aria-label="Athlete views"
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`athlete-tab-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    aria-controls={`athlete-panel-${tab.id}`}
                    className={cn(
                      'cursor-pointer rounded-full border border-[var(--border)] bg-[var(--bg-panel)] px-4 py-2 text-[0.875rem] font-medium text-[var(--text-muted)] transition-[background,color,border-color,box-shadow] duration-150 hover:border-[var(--text-faint)] hover:text-[var(--text-primary)]',
                      activeTab === tab.id &&
                        'border-[var(--accent)] bg-[var(--accent)] font-semibold text-white shadow-[var(--shadow-pill)]'
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </header>

          {results.data.results.length === 0 ? (
            <p className="rounded-xl bg-[var(--bg-subtle)] px-5 py-4 text-[0.95rem] text-[var(--text-muted)]">
              No results found for this athlete.
            </p>
          ) : (
            <div
              className="mt-1"
              role="tabpanel"
              id={`athlete-panel-${activeTab}`}
              aria-labelledby={`athlete-tab-${activeTab}`}
            >
              {activeTab === 'results' && (
                <AthleteResultsView
                  filteredRows={filteredRows}
                  totalCount={results.data.results.length}
                  filters={filters}
                  filterOptions={filterOptions}
                  onFiltersChange={setFilters}
                />
              )}
              {activeTab === 'activity' && (
                <AthleteActivityView rows={results.data.results} />
              )}
              {activeTab === 'records' && (
                <AthleteRecordsView rows={results.data.results} />
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
