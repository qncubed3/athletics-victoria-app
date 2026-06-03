'use client'

import { useState } from 'react'
import type { AthleteSuggestion } from '@/types/athlete'
import { CompareResults } from './CompareResults'
import { CompareSearchRow } from './CompareSearchRow'
import { useAthleteCompare } from './useAthleteCompare'

export function ComparePage() {
  const [athlete1, setAthlete1] = useState<AthleteSuggestion | null>(null)
  const [athlete2, setAthlete2] = useState<AthleteSuggestion | null>(null)

  const { compare, loading, error } = useAthleteCompare(athlete1, athlete2)

  const bothSelected = athlete1 !== null && athlete2 !== null
  const athlete1Label = athlete1?.displayName ?? ''
  const athlete2Label = athlete2?.displayName ?? ''

  return (
    <div className="compare-page">
      <CompareSearchRow
        athlete1={athlete1}
        athlete2={athlete2}
        onSelectAthlete1={setAthlete1}
        onSelectAthlete2={setAthlete2}
        onClearAthlete1={() => setAthlete1(null)}
        onClearAthlete2={() => setAthlete2(null)}
      />

      {!bothSelected && (
        <p className="athletes-status">
          Select two athletes to compare overlapping results (same date, event, and venue).
        </p>
      )}

      {loading && <div className="athletes-status">Comparing athletes…</div>}

      {error && <div className="athletes-status athletes-status--error">{error}</div>}

      {compare && !loading && !error && (
        <CompareResults
          compare={compare}
          athlete1Label={athlete1Label}
          athlete2Label={athlete2Label}
        />
      )}
    </div>
  )
}
