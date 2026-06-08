'use client'

import { useState } from 'react'
import type { AthleteSuggestion } from '@/types/athlete'
import { cn } from '@/lib/cn'
import { CompareResults } from './CompareResults'
import { CompareSearchRow } from './CompareSearchRow'
import { useAthleteCompare } from './useAthleteCompare'

const statusClass = 'rounded-xl px-5 py-4 text-[0.95rem] text-[var(--text-muted)]'

export function ComparePage() {
  const [athlete1, setAthlete1] = useState<AthleteSuggestion | null>(null)
  const [athlete2, setAthlete2] = useState<AthleteSuggestion | null>(null)

  const { compare, loading, error } = useAthleteCompare(athlete1, athlete2)

  const bothSelected = athlete1 !== null && athlete2 !== null
  const athlete1Label = athlete1?.displayName ?? ''
  const athlete2Label = athlete2?.displayName ?? ''

  return (
    <div className="flex flex-col gap-6">
      <CompareSearchRow
        athlete1={athlete1}
        athlete2={athlete2}
        onSelectAthlete1={setAthlete1}
        onSelectAthlete2={setAthlete2}
        onClearAthlete1={() => setAthlete1(null)}
        onClearAthlete2={() => setAthlete2(null)}
      />

      {!bothSelected && (
        <p className={cn(statusClass, 'bg-[var(--bg-subtle)]')}>
          Select two athletes to compare overlapping results (same date, event, and venue).
        </p>
      )}

      {loading && (
        <div className={cn(statusClass, 'bg-[var(--bg-subtle)]')}>Comparing athletes…</div>
      )}

      {error && (
        <div className={cn(statusClass, 'bg-[var(--error-bg)] text-[var(--error-text)]')}>
          {error}
        </div>
      )}

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
