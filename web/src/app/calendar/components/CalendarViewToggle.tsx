'use client'

import { LayoutGrid, List } from 'lucide-react'
import type { CalendarViewMode } from '@/types/events'

export interface CalendarViewToggleProps {
  mode: CalendarViewMode
  onChange: (mode: CalendarViewMode) => void
}

// switch between table list and month grid
export function CalendarViewToggle({ mode, onChange }: CalendarViewToggleProps) {
  return (
    <div className="calendar-view-toggle" role="group" aria-label="Calendar view mode">
      <button
        type="button"
        className={`calendar-view-toggle__btn ${mode === 'list' ? 'calendar-view-toggle__btn--active' : ''}`}
        onClick={() => onChange('list')}
        aria-pressed={mode === 'list'}
      >
        <List size={15} strokeWidth={2} aria-hidden />
        List
      </button>
      <button
        type="button"
        className={`calendar-view-toggle__btn ${mode === 'calendar' ? 'calendar-view-toggle__btn--active' : ''}`}
        onClick={() => onChange('calendar')}
        aria-pressed={mode === 'calendar'}
      >
        <LayoutGrid size={15} strokeWidth={2} aria-hidden />
        Calendar
      </button>
    </div>
  )
}
