'use client'

import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Check, ChevronDown } from 'lucide-react'

export interface FilterOption {
  value: string
  label: string
}

interface FilterPillProps {
  icon: LucideIcon
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
  ariaLabel: string
}

export function FilterPill({
  icon: Icon,
  value,
  options,
  onChange,
  ariaLabel,
}: FilterPillProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return

    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className={`filter-pill ${open ? 'filter-pill--open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="filter-pill__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon size={15} strokeWidth={2.25} className="filter-pill__icon" aria-hidden />
        <span className="filter-pill__value">{selected?.label}</span>
        <ChevronDown size={15} strokeWidth={2} className="filter-pill__chevron" aria-hidden />
      </button>

      {open && (
        <ul className="filter-pill__menu" role="listbox" aria-label={ariaLabel}>
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`filter-pill__option ${isSelected ? 'filter-pill__option--selected' : ''}`}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  <span className="filter-pill__option-label">{opt.label}</span>
                  {isSelected && (
                    <Check size={14} strokeWidth={2.5} className="filter-pill__option-check" aria-hidden />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
