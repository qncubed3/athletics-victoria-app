'use client'

import { useCallback, useMemo, useState } from 'react'
import { fetchAthleteResults } from '@/api/client'
import type {
  AthleteResultRow,
  AthleteResultsResponse,
  AthleteSuggestion,
} from '@/types/athlete'
import { AthleteSearchPicker } from '@/app/components/AthleteSearchPicker'
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
    <div className="athletes-page">
      <AthleteSearchPicker
        id="athlete-search"
        label="Search athletes"
        selected={selected}
        onSelect={selectAthlete}
        onClear={clearSearch}
        showRegistryHints
      />

      {resultsLoading && <div className="athletes-status">Loading results…</div>}

      {resultsError && (
        <div className="athletes-status athletes-status--error">{resultsError}</div>
      )}

      {results && !resultsLoading && (
        <section className="athletes-results">
          <header className="athletes-results__header">
            <h3>{results.data.athlete_info.athlete ?? selected?.displayName}</h3>
            <div className="athletes-results__meta">
              {results.data.athlete_info.club && (
                <span>Club {results.data.athlete_info.club}</span>
              )}
              {results.data.athlete_info.bib && (
                <span>
                  Bib {results.data.athlete_info.bib}
                  {results.data.athlete_info.bib_year
                    ? ` (${results.data.athlete_info.bib_year})`
                    : ''}
                </span>
              )}
              {results.data.athlete_info.recent_result_age && (
                <span>Age {results.data.athlete_info.recent_result_age}</span>
              )}
            </div>

            {results.data.results.length > 0 && (
              <div className="athlete-tabs" role="tablist" aria-label="Athlete views">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`athlete-tab-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    aria-controls={`athlete-panel-${tab.id}`}
                    className={`athlete-tabs__tab ${activeTab === tab.id ? 'athlete-tabs__tab--active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </header>

          {results.data.results.length === 0 ? (
            <p className="athletes-status">No results found for this athlete.</p>
          ) : (
            <div
              className="athlete-tab-panel"
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
