'use client'

import { useEffect, useState } from 'react'
import { fetchAthleteCompare } from '@/api/client'
import type { AthleteCompareResponse, AthleteSuggestion } from '@/types/athlete'

// loads compare data when both athletes are picked
export function useAthleteCompare(
  athlete1: AthleteSuggestion | null,
  athlete2: AthleteSuggestion | null
) {
  const [compare, setCompare] = useState<AthleteCompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      .catch((err) => {
        console.error('Error comparing athletes:', err)
        if (!cancelled) setError('Error loading comparison')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [athlete1, athlete2])

  return { compare, loading, error }
}
