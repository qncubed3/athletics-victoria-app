'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAthletesRegistry } from '@/context/AthletesRegistryContext'
import type { AthleteSuggestion } from '@/types/athlete'
import { filterIndex } from '@/utils/athleteSearch'

interface AthleteSearchPickerProps {
  id: string
  label: string
  selected: AthleteSuggestion | null
  onSelect: (athlete: AthleteSuggestion) => void
  onClear: () => void
  excludeApiName?: string | null
}

export function AthleteSearchPicker({
  id,
  label,
  selected,
  onSelect,
  onClear,
  excludeApiName,
}: AthleteSearchPickerProps) {
  const { index, ready, loading } = useAthletesRegistry()
  const [query, setQuery] = useState(selected?.displayName ?? '')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected) {
      setQuery(selected.displayName)
    }
  }, [selected])

  const suggestions = useMemo(() => {
    if (!ready) return []
    const list = filterIndex(index, query)
    if (!excludeApiName) return list
    return list.filter((s) => s.apiName !== excludeApiName)
  }, [index, query, ready, excludeApiName])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function pick(athlete: AthleteSuggestion) {
    onSelect(athlete)
    setQuery(athlete.displayName)
    setOpen(false)
  }

  function onInputChange(value: string) {
    setQuery(value)
    setOpen(true)
    if (selected && value !== selected.displayName) {
      onClear()
    }
  }

  return (
    <div className="athletes-search" ref={rootRef}>
      <label className="athletes-search__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="search"
        className="athletes-search__input"
        placeholder={ready ? 'Search by first or last name' : 'Registry loading…'}
        value={query}
        onChange={(e) => onInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        disabled={!ready && loading}
      />

      {open && !ready && query.trim().length >= 2 && (
        <p className="athletes-suggestions__empty">Registry still loading…</p>
      )}

      {open && ready && suggestions.length > 0 && (
        <ul className="athletes-suggestions" role="listbox">
          {suggestions.map((s) => (
            <li key={s.id} role="option">
              <button
                type="button"
                className="athletes-suggestions__item"
                onClick={() => pick(s)}
              >
                <span className="athletes-suggestions__name">{s.displayName}</span>
                <span className="athletes-suggestions__club">{s.club}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && ready && query.trim().length >= 2 && suggestions.length === 0 && (
        <p className="athletes-suggestions__empty">No matching athletes</p>
      )}
    </div>
  )
}
