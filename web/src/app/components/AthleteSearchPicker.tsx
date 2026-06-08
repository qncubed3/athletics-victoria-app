'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAthletesRegistry } from '@/context/AthletesRegistryContext'
import type { AthleteSuggestion } from '@/types/athlete'
import { cn } from '@/lib/cn'
import { filterIndex } from '@/utils/athleteSearch'

type AthleteSearchPickerProps = {
  id: string
  label: string
  selected: AthleteSuggestion | null
  onSelect: (athlete: AthleteSuggestion) => void
  onClear: () => void
  excludeApiName?: string | null
  showRegistryHints?: boolean
}

const dropdownClass =
  'absolute top-[calc(100%-4px)] right-0 left-0 z-10 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-[var(--shadow-dropdown)]'

export function AthleteSearchPicker({
  id,
  label,
  selected,
  onSelect,
  onClear,
  excludeApiName,
  showRegistryHints = false,
}: AthleteSearchPickerProps) {
  const { index, ready, loading, error: loadError } = useAthletesRegistry()
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
    <div className="relative max-w-[480px]" ref={rootRef}>
      <label
        className="mb-2 block text-[0.85rem] font-semibold text-[var(--text-secondary)]"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        id={id}
        type="search"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3 text-base text-[var(--text-primary)] transition-[border-color,box-shadow,background] focus:border-[var(--accent)] focus:bg-[var(--bg-panel)] focus:shadow-[0_0_0_3px_var(--accent-soft)] focus:outline-none disabled:cursor-wait disabled:opacity-60"
        placeholder={ready ? 'Search by first or last name' : 'Registry loading…'}
        value={query}
        onChange={(e) => onInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        disabled={!ready && loading}
      />

      {showRegistryHints && loading && !ready && (
        <p className="mt-2 text-[0.8rem] text-[var(--text-faint)]">
          Loading athlete registry in background…
        </p>
      )}
      {showRegistryHints && loadError && (
        <p className="mt-2 text-[0.85rem] text-[var(--error-text)]">{loadError}</p>
      )}
      {showRegistryHints && ready && (
        <p className="mt-2 text-[0.8rem] text-[var(--text-faint)]">
          {index.length.toLocaleString()} athletes ready
        </p>
      )}

      {open && !ready && query.trim().length >= 2 && (
        <p className={cn(`${dropdownClass} m-0 px-4 py-3 text-[0.9rem] text-[var(--text-faint)]`)}>
          Registry still loading…
        </p>
      )}

      {open && ready && suggestions.length > 0 && (
        <ul
          className={`${dropdownClass} m-0 max-h-80 list-none overflow-y-auto p-1.5`}
          role="listbox"
        >
          {suggestions.map((s) => (
            <li key={s.id} role="option">
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-hover)]"
                onClick={() => pick(s)}
              >
                <span className="font-medium text-[var(--text-primary)]">{s.displayName}</span>
                <span className="rounded-md bg-[var(--bg-muted)] px-2 py-0.5 text-[0.8rem] font-semibold text-[var(--text-muted)]">
                  {s.club}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && ready && query.trim().length >= 2 && suggestions.length === 0 && (
        <p className={cn(`${dropdownClass} m-0 px-4 py-3 text-[0.9rem] text-[var(--text-faint)]`)}>
          No matching athletes
        </p>
      )}
    </div>
  )
}
