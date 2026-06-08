'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Activity, Building2, CalendarDays, Layers, Menu } from 'lucide-react'
import { DEFAULT_SEASON, useFilteredMeets, useSeasonEvents } from '@/hooks/useSeasonEvents'
import type { ParsedVenue, VenueFilters } from '@/types/events'
import { buildVenueMap } from '@/utils/venueMap'
import { FilterPill } from '@/app/components/FilterPill'
import { cn } from '@/lib/cn'
import { VenueDrawerDetail } from './VenueDrawerDetail'
import { VenueDrawerList } from './VenueDrawerList'

// Leaflet needs the browser so load the map only on the client
const VenueMap = dynamic(
  () => import('./VenueMap').then((mod) => mod.VenueMap),
  { ssr: false }
)

const EMPTY_FILTERS: VenueFilters = {
  season: DEFAULT_SEASON,
  series: 'all',
  status: 'all',
  venueType: 'all',
}

type DrawerView = 'list' | 'detail'

export function VenuesPage() {
  const [filters, setFilters] = useState<VenueFilters>(EMPTY_FILTERS)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerView, setDrawerView] = useState<DrawerView>('list')

  const {
    data,
    loading,
    error,
    allMeets,
    seasonOptions,
    seriesOptions,
    statusOptions,
    venueTypeOptions,
  } = useSeasonEvents(filters.season)

  const filteredMeets = useFilteredMeets(allMeets, filters)

  const seasonVenues = data?.tables.season_venues ?? []
  const { mapped: venues, unmappedMeets } = buildVenueMap(
    seasonVenues,
    filteredMeets,
    filters.venueType
  )

  let selectedVenue: ParsedVenue | null = null
  if (selectedCode) {
    selectedVenue = venues.find((v) => v.code === selectedCode) ?? null
  }

  // if filters change and the selected venue drops off the map, clear selection
  useEffect(() => {
    if (!selectedCode) {
      return
    }
    const stillOnMap = venues.some((v) => v.code === selectedCode)
    if (!stillOnMap) {
      setSelectedCode(null)
      setDrawerView('list')
    }
  }, [venues, selectedCode])

  function selectVenue(code: string) {
    setSelectedCode(code)
    setDrawerOpen(true)
    setDrawerView('detail')
  }

  function openVenueList() {
    setDrawerOpen(true)
    setDrawerView('list')
  }

  function closeDrawer() {
    setDrawerOpen(false)
  }

  function toggleDrawer() {
    if (drawerOpen) {
      closeDrawer()
    } else {
      openVenueList()
    }
  }

  function backToVenueList() {
    setDrawerView('list')
  }

  // pick which drawer panel to show
  let drawerContent
  if (drawerView === 'list') {
    drawerContent = (
      <VenueDrawerList
        venues={venues}
        unmappedMeets={unmappedMeets}
        selectedCode={selectedCode}
        onSelectVenue={selectVenue}
        onClose={closeDrawer}
      />
    )
  } else if (selectedVenue) {
    drawerContent = (
      <VenueDrawerDetail
        venue={selectedVenue}
        onBack={backToVenueList}
        onClose={closeDrawer}
      />
    )
  } else {
    drawerContent = (
      <div className="flex h-full min-h-0 w-[min(340px,36vw)] flex-col max-sm:w-[min(300px,78vw)]">
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <p className="m-0 text-[0.9rem] text-[var(--text-muted)]">
            Select a venue from the list or map
          </p>
        </div>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <p className="rounded-xl bg-[var(--bg-subtle)] px-5 py-4 text-[0.95rem] text-[var(--text-muted)]">
        Loading venues…
      </p>
    )
  }

  if (error && !data) {
    return (
      <div className="rounded-xl bg-[var(--error-bg)] px-5 py-4 text-[0.95rem] text-[var(--error-text)]">
        {error}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0">
        <div className="mb-2 flex flex-wrap items-center gap-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-3">
          <FilterPill
            icon={CalendarDays}
            ariaLabel="Filter by season"
            value={filters.season}
            onChange={(season) =>
              setFilters({ season, series: 'all', status: 'all', venueType: 'all' })
            }
            options={seasonOptions}
          />
          <FilterPill
            icon={Layers}
            ariaLabel="Filter by series"
            value={filters.series}
            onChange={(series) => setFilters({ ...filters, series })}
            options={seriesOptions}
          />
          <FilterPill
            icon={Activity}
            ariaLabel="Filter by status"
            value={filters.status}
            onChange={(status) => setFilters({ ...filters, status })}
            options={statusOptions}
          />
          <FilterPill
            icon={Building2}
            ariaLabel="Filter by venue type"
            value={filters.venueType}
            onChange={(venueType) => setFilters({ ...filters, venueType })}
            options={venueTypeOptions}
          />
        </div>
        <p className="m-0 mt-1 text-[0.85rem] text-[var(--text-faint)]">
          {venues.length} venues · {filteredMeets.length} meets
          {loading ? ' · refreshing…' : ''}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)]">
        <aside
          className={cn(
            'pointer-events-none h-full shrink-0 overflow-hidden border-r-0 bg-[var(--bg-panel)] transition-[width] duration-[250ms] ease-in-out w-0',
            drawerOpen &&
              'pointer-events-auto w-[min(340px,36vw)] border-r border-[var(--border)] max-sm:w-[min(300px,78vw)]'
          )}
          aria-hidden={!drawerOpen}
        >
          {drawerContent}
        </aside>

        <div className="relative min-h-0 min-w-0 flex-1">
          {!drawerOpen && (
            <button
              type="button"
              className="absolute top-3 left-3 z-[1001] flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[var(--bg-panel)] text-[var(--text-primary)] shadow-[0_2px_10px_rgba(0,0,0,0.18)] transition-colors hover:bg-[var(--bg-subtle)]"
              aria-label="Open venue list"
              onClick={toggleDrawer}
            >
              <Menu size={22} strokeWidth={2} />
            </button>
          )}

          <VenueMap
            venues={venues}
            selectedCode={selectedCode}
            onSelect={selectVenue}
            drawerOpen={drawerOpen}
          />
        </div>
      </div>
    </div>
  )
}
