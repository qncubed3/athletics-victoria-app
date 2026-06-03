'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchEvents } from '../api/client'
import type { EventsResponse, ParsedMeet } from '../types/events'
import { filterMeets, parseMeets, seriesLabelMap, uniqueSorted } from '../utils/eventCalendar'

export const DEFAULT_SEASON = '2026'

export function useSeasonEvents(season: string) {
  const [data, setData] = useState<EventsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchEvents(season)
        if (!cancelled) setData(response)
      } catch (e) {
        console.error('Error fetching events:', e)
        if (!cancelled) {
          setError('Error fetching events')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [season])

  const seriesMap = useMemo(
    () => seriesLabelMap(data?.tables.season_series ?? []),
    [data]
  )

  const allMeets = useMemo(
    () => parseMeets(data?.tables.season_meets ?? [], seriesMap),
    [data, seriesMap]
  )

  const seasonOptions = useMemo(() => {
    const seasons = data?.tables.seasons ?? []
    if (seasons.length === 0) {
      return [{ value: season, label: season }]
    }
    return [...seasons]
      .sort((a, b) => b.code.localeCompare(a.code))
      .map((s) => ({ value: s.code, label: s.desc || s.code }))
  }, [data, season])

  const seriesOptions = useMemo(() => {
    const series = data?.tables.season_series ?? []
    return [
      { value: 'all', label: 'All series' },
      ...series.map((s) => ({
        value: s.code,
        label: s.shortDesc || s.longDesc || s.code,
      })),
    ]
  }, [data])

  const statusOptions = useMemo(() => {
    const statuses = uniqueSorted(allMeets.map((m) => m.stat))
    return [
      { value: 'all', label: 'All statuses' },
      ...statuses.map((s) => ({ value: s, label: s })),
    ]
  }, [allMeets])

  const venueTypeOptions = useMemo(() => {
    const venues = data?.tables.season_venues ?? []
    const types = uniqueSorted(venues.map((v) => v.type))
    return [
      { value: 'all', label: 'All venue types' },
      ...types.map((t) => ({
        value: t,
        label: t === 'outOfStad' ? 'Out of stadium' : t.charAt(0).toUpperCase() + t.slice(1),
      })),
    ]
  }, [data])

  return {
    data,
    loading,
    error,
    allMeets,
    seasonOptions,
    seriesOptions,
    statusOptions,
    venueTypeOptions,
  }
}

export function useFilteredMeets(
  allMeets: ParsedMeet[],
  filters: { series: string; status: string }
) {
  return useMemo(() => filterMeets(allMeets, filters), [allMeets, filters])
}
