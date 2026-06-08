'use client'

import { useEffect, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

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
    <div
      className={cn(
        'relative inline-flex min-h-10 rounded-full border border-[var(--border)] bg-[var(--bg-panel)] p-0 shadow-[var(--shadow-pill)] transition-[border-color,box-shadow]',
        open
          ? 'border-[var(--accent)] shadow-[0_0_0_3px_var(--accent-soft)]'
          : 'hover:border-[var(--text-faint)] hover:shadow-[var(--shadow-dropdown)]'
      )}
      ref={rootRef}
    >
      <button
        type="button"
        className="inline-flex min-w-0 cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent py-2 pr-3 pl-3.5 font-inherit text-inherit"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon
          size={15}
          strokeWidth={2.25}
          className="pointer-events-none shrink-0 text-[var(--accent)]"
          aria-hidden
        />
        <span className="max-w-40 truncate text-sm font-semibold text-[var(--text-primary)] max-sm:max-w-none">
          {selected?.label}
        </span>
        <ChevronDown
          size={15}
          strokeWidth={2}
          className={cn(
            'pointer-events-none shrink-0 text-[var(--text-faint)] transition-transform',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          className="absolute top-[calc(100%+6px)] left-0 z-20 m-0 max-h-60 min-w-full max-w-[min(280px,80vw)] list-none overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-1.5 shadow-[var(--shadow-dropdown)]"
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border-0 px-3 py-2.25 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]',
                    isSelected && 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]'
                  )}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  <span className="min-w-0 truncate">{opt.label}</span>
                  {isSelected && (
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      className="shrink-0 text-[var(--accent)]"
                      aria-hidden
                    />
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
