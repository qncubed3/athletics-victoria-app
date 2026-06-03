'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Activity,
  ArrowLeft,
  Building2,
  CalendarDays,
  Layers,
  Menu,
  X,
} from 'lucide-react'
import { DEFAULT_SEASON, useFilteredMeets, useSeasonEvents } from '@/hooks/useSeasonEvents'
import type { VenueFilters } from '@/types/events'
import { buildVenueMap } from '@/utils/venueMap'
import { FilterPill } from '@/app/components/FilterPill'

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

export function VenuesPage() {
  const [filters, setFilters] = useState<VenueFilters>(EMPTY_FILTERS)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  // true = scrollable venue list, false = selected venue meets
  const [drawerListMode, setDrawerListMode] = useState(true)

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

  const { mapped: venues, unmappedMeets } = useMemo(
    () => buildVenueMap(data?.tables.season_venues ?? [], filteredMeets, filters.venueType),
    [data, filteredMeets, filters.venueType]
  )

  const selectedVenue = useMemo(
    () => venues.find((v) => v.code === selectedCode) ?? null,
    [venues, selectedCode]
  )

  useEffect(() => {
    if (selectedCode && !venues.some((v) => v.code === selectedCode)) {
      setSelectedCode(null)
      setDrawerListMode(true)
    }
  }, [venues, selectedCode])

  // Open drawer on map and show meets for that venue
  function selectVenue(code: string) {
    setSelectedCode(code)
    setDrawerOpen(true)
    setDrawerListMode(false)
  }

  // Hamburger opens the venue list
  function openVenueList() {
    setDrawerOpen(true)
    setDrawerListMode(true)
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
    setDrawerListMode(true)
  }

  if (loading && !data) {
    return <p className="athletes-status">Loading venues…</p>
  }

  if (error && !data) {
    return <div className="athletes-status athletes-status--error">{error}</div>
  }

  return (
    <div className="venues-page">
      <div className="venues-page__toolbar">
        <div className="athletes-filters">
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
            onChange={(series) => setFilters((f) => ({ ...f, series }))}
            options={seriesOptions}
          />
          <FilterPill
            icon={Activity}
            ariaLabel="Filter by status"
            value={filters.status}
            onChange={(status) => setFilters((f) => ({ ...f, status }))}
            options={statusOptions}
          />
          <FilterPill
            icon={Building2}
            ariaLabel="Filter by venue type"
            value={filters.venueType}
            onChange={(venueType) => setFilters((f) => ({ ...f, venueType }))}
            options={venueTypeOptions}
          />
        </div>
        <p className="athletes-filters__count venues-page__count">
          {venues.length} venues · {filteredMeets.length} meets
          {loading ? ' · refreshing…' : ''}
        </p>
      </div>

      <div className="venues-map-stage">
        <aside
          className={`venues-map-drawer ${drawerOpen ? 'venues-map-drawer--open' : ''}`}
          aria-hidden={!drawerOpen}
        >
          {drawerListMode ? (
            <div className="venues-map-drawer__inner">
              <header className="venues-map-drawer__header">
                <div className="venues-map-drawer__header-row">
                  <div>
                    <h3>Venues</h3>
                    <p>{venues.length} locations</p>
                  </div>
                  <button
                    type="button"
                    className="venues-map-drawer__close"
                    aria-label="Close venue list"
                    onClick={closeDrawer}
                  >
                    <X size={20} strokeWidth={2} />
                  </button>
                </div>
              </header>
              <div className="venues-map-drawer__body">
                <ul className="venues-map-drawer__list">
                  {venues.map((v) => (
                    <li key={v.code}>
                      <button
                        type="button"
                        className={
                          selectedCode === v.code
                            ? 'venues-map-drawer__list-btn venues-map-drawer__list-btn--active'
                            : 'venues-map-drawer__list-btn'
                        }
                        onClick={() => selectVenue(v.code)}
                      >
                        <span className="venues-map-drawer__list-name">{v.name}</span>
                        <span className="venues-map-drawer__list-count">{v.meetCount}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                {unmappedMeets.length > 0 && (
                  <div className="venues-panel__unmapped">
                    <h4>Meets without map coordinates</h4>
                    <ul>
                      {unmappedMeets.map((meet) => (
                        <li key={`${meet.date}-${meet.series}-${meet.desc}`}>
                          <strong>{meet.venue}</strong> — {meet.desc} ({meet.dateLabel})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : selectedVenue ? (
            <div className="venues-map-drawer__inner">
              <div className="venues-map-drawer__header venues-map-drawer__header--detail">
                <div className="venues-map-drawer__header-row">
                  <button
                    type="button"
                    className="venues-map-drawer__back"
                    onClick={backToVenueList}
                  >
                    <ArrowLeft size={18} strokeWidth={2} aria-hidden />
                    All venues
                  </button>
                  <button
                    type="button"
                    className="venues-map-drawer__close"
                    aria-label="Close"
                    onClick={closeDrawer}
                  >
                    <X size={20} strokeWidth={2} />
                  </button>
                </div>
                <div className="venues-panel__header">
                  <h3>{selectedVenue.name}</h3>
                  {selectedVenue.address && (
                    <p className="venues-panel__address">{selectedVenue.address}</p>
                  )}
                  <p className="venues-panel__meta">
                    {selectedVenue.meetCount} meet
                    {selectedVenue.meetCount === 1 ? '' : 's'} ·{' '}
                    {selectedVenue.type === 'outOfStad' ? 'Out of stadium' : 'Stadium'}
                  </p>
                </div>
              </div>
              <div className="venues-map-drawer__body">
                <ul className="venues-panel__meets">
                  {selectedVenue.meets.map((meet) => (
                    <li key={`${meet.date}-${meet.series}-${meet.round}-${meet.desc}`}>
                      <span className="venues-panel__meet-date">{meet.dateLabel}</span>
                      <span className="venues-panel__meet-title">{meet.desc}</span>
                      <span className="venues-panel__meet-meta">
                        {meet.seriesLabel} · Round {meet.round} · {meet.stat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="venues-map-drawer__inner">
              <div className="venues-map-drawer__body">
                <p className="venues-map-drawer__hint">Select a venue from the list or map</p>
              </div>
            </div>
          )}
        </aside>

        <div className="venues-map-pane">
          {!drawerOpen && (
            <button
              type="button"
              className="venues-map-menu"
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
