'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchAthleteCompare } from '@/api/client'
import type {
  AthleteCompareResponse,
  AthleteSuggestion,
  CompareRow,
  CompareWinner,
} from '@/types/athlete'
import { AthleteSearchPicker } from './AthleteSearchPicker'

function formatApiName(apiName: string) {
  const comma = apiName.indexOf(',')
  if (comma < 0) return apiName
  return `${apiName.slice(comma + 1).trim()} ${apiName.slice(0, comma).trim()}`
}

function perfCellClass(side: 1 | 2, winner: CompareWinner) {
  if (winner === -1) return ''
  if (winner === 0) return 'compare-table__perf--tie'
  if (winner === side) return 'compare-table__perf--win'
  return 'compare-table__perf--loss'
}

function CompareSummaryBar({
  athlete1Label,
  athlete2Label,
  data,
}: {
  athlete1Label: string
  athlete2Label: string
  data: AthleteCompareResponse
}) {
  const { summary, overlap_count } = data

  return (
    <div className="compare-summary">
      <div className="compare-summary__athlete compare-summary__athlete--left">
        <span className="compare-summary__name">{athlete1Label}</span>
        <span className="compare-summary__wins compare-summary__wins--win">
          {summary.athlete1_wins}
        </span>
        <span className="compare-summary__wins-label">wins</span>
      </div>

      <div className="compare-summary__center">
        <span className="compare-summary__overlap">
          {overlap_count} head-to-head
        </span>
        {(summary.ties > 0 || summary.unknown > 0) && (
          <span className="compare-summary__meta">
            {summary.ties > 0 && `${summary.ties} tie${summary.ties === 1 ? '' : 's'}`}
            {summary.ties > 0 && summary.unknown > 0 && ' · '}
            {summary.unknown > 0 &&
              `${summary.unknown} uncomparable`}
          </span>
        )}
      </div>

      <div className="compare-summary__athlete compare-summary__athlete--right">
        <span className="compare-summary__name">{athlete2Label}</span>
        <span className="compare-summary__wins compare-summary__wins--win">
          {summary.athlete2_wins}
        </span>
        <span className="compare-summary__wins-label">wins</span>
      </div>
    </div>
  )
}

function CompareTable({
  rows,
  athlete1Label,
  athlete2Label,
}: {
  rows: CompareRow[]
  athlete1Label: string
  athlete2Label: string
}) {
  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => b.meet_date.localeCompare(a.meet_date)),
    [rows]
  )

  return (
    <div className="athletes-table-wrap">
      <table className="athletes-table compare-table">
        <colgroup>
          <col />
          <col />
          <col />
          <col className="compare-table__athlete-col" />
          <col className="compare-table__athlete-col" />
        </colgroup>
        <thead>
          <tr>
            <th>Date</th>
            <th>Event</th>
            <th>Venue</th>
            <th className="compare-table__athlete-col">{athlete1Label}</th>
            <th className="compare-table__athlete-col">{athlete2Label}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={`${row.meet_date}-${row.event}-${row.venue}`}>
              <td>{row.meet_date}</td>
              <td>{row.event}</td>
              <td>{row.venue}</td>
              <td
                className={`compare-table__athlete-col athletes-table__perf ${perfCellClass(1, row.winner)}`}
              >
                {row.athlete1_performance ?? '—'}
              </td>
              <td
                className={`compare-table__athlete-col athletes-table__perf ${perfCellClass(2, row.winner)}`}
              >
                {row.athlete2_performance ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ComparePage() {
  const [athlete1, setAthlete1] = useState<AthleteSuggestion | null>(null)
  const [athlete2, setAthlete2] = useState<AthleteSuggestion | null>(null)
  const [compare, setCompare] = useState<AthleteCompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const athlete1Label = athlete1?.displayName ?? ''
  const athlete2Label = athlete2?.displayName ?? ''
  const bothSelected = athlete1 !== null && athlete2 !== null

  useEffect(() => {
    if (!athlete1 || !athlete2) {
      setCompare(null)
      setError(null)
      return
    }
    if (athlete1.apiName === athlete2.apiName) {
      setCompare(null)
      setError('Choose two different athletes')
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setCompare(null)

    fetchAthleteCompare(athlete1.apiName, athlete2.apiName)
      .then((data) => {
        if (!cancelled) setCompare(data)
      })
      .catch((e) => {
        console.error('Error comparing athletes:', e)
        if (!cancelled) setError('Error loading comparison')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [athlete1, athlete2])

  return (
    <div className="compare-page">
      <div className="compare-search-row">
        <AthleteSearchPicker
          id="compare-athlete-1"
          label="Athlete 1"
          selected={athlete1}
          onSelect={setAthlete1}
          onClear={() => setAthlete1(null)}
          excludeApiName={athlete2?.apiName}
        />
        <span className="compare-search-row__vs" aria-hidden>
          vs
        </span>
        <AthleteSearchPicker
          id="compare-athlete-2"
          label="Athlete 2"
          selected={athlete2}
          onSelect={setAthlete2}
          onClear={() => setAthlete2(null)}
          excludeApiName={athlete1?.apiName}
        />
      </div>

      {!bothSelected && (
        <p className="athletes-status">
          Select two athletes to compare overlapping results (same date, event, and venue).
        </p>
      )}

      {loading && <div className="athletes-status">Comparing athletes…</div>}

      {error && (
        <div className="athletes-status athletes-status--error">{error}</div>
      )}

      {compare && !loading && !error && (
        <section className="compare-results">
          <CompareSummaryBar
            athlete1Label={athlete1Label || formatApiName(compare.athlete1)}
            athlete2Label={athlete2Label || formatApiName(compare.athlete2)}
            data={compare}
          />

          {compare.overlap_count === 0 ? (
            <p className="athletes-status">
              No overlapping results for these athletes.
            </p>
          ) : (
            <CompareTable
              rows={compare.comparisons}
              athlete1Label={athlete1Label || formatApiName(compare.athlete1)}
              athlete2Label={athlete2Label || formatApiName(compare.athlete2)}
            />
          )}
        </section>
      )}
    </div>
  )
}
