'use client'

import type { ReactNode } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import type { CalendarViewMode } from '@/types/events'

const btnBaseClass =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 px-3.5 py-2 text-sm font-medium text-[var(--text-muted)] transition-[background,color] hover:text-[var(--text-primary)]'
const btnActiveClass =
  'bg-[var(--bg-panel)] font-semibold text-[var(--accent)] shadow-[var(--shadow-pill)]'

// one button in the list / calendar toggle
function ToggleButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: ReactNode
  active: boolean
  onClick: () => void
}) {
  let btnClass = btnBaseClass
  if (active) {
    btnClass += ` ${btnActiveClass}`
  }

  return (
    <button
      type="button"
      className={btnClass}
      onClick={onClick}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  )
}

// switch between list table and month grid
export function CalendarViewToggle({
  mode,
  onChange,
}: {
  mode: CalendarViewMode
  onChange: (mode: CalendarViewMode) => void
}) {
  return (
    <div
      className="inline-flex gap-1 self-start rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] p-1"
      role="group"
      aria-label="Calendar view mode"
    >
      <ToggleButton
        label="List"
        icon={<List size={15} strokeWidth={2} aria-hidden />}
        active={mode === 'list'}
        onClick={() => onChange('list')}
      />
      <ToggleButton
        label="Calendar"
        icon={<LayoutGrid size={15} strokeWidth={2} aria-hidden />}
        active={mode === 'calendar'}
        onClick={() => onChange('calendar')}
      />
    </div>
  )
}
