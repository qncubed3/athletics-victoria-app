'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import type { ParsedMeet } from '@/types/events'
import { buildMonthGrid } from '@/utils/eventCalendar'

export interface CalendarMonthViewProps {
  year: number
  month: number
  meets: ParsedMeet[]
  onPrevMonth: () => void
  onNextMonth: () => void
}

// short labels for the column headers
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// css class for meet status pills in the month grid
function statusClass(stat: string) {
  const key = stat.toLowerCase()
  if (key === 'final') return 'calendar-event--final'
  if (key === 'scheduled') return 'calendar-event--scheduled'
  if (key === 'provisional') return 'calendar-event--provisional'
  return ''
}

export function CalendarMonthView({
  year,
  month,
  meets,
  onPrevMonth,
  onNextMonth,
}: CalendarMonthViewProps) {
  const monthLabel = useMemo(
    () =>
      new Date(year, month, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      }),
    [year, month]
  )

  // group meets into day cells for this month
  const grid = useMemo(() => buildMonthGrid(year, month, meets), [year, month, meets])

  return (
    <div className="calendar-month">
      <div className="calendar-month__header">
        <button
          type="button"
          className="calendar-month__nav"
          onClick={onPrevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
        <h3 className="calendar-month__title">{monthLabel}</h3>
        <button
          type="button"
          className="calendar-month__nav"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="calendar-month__grid">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-month__weekday">
            {day}
          </div>
        ))}

        {grid.map((cell, i) => (
          <div
            key={cell.date ?? `pad-${i}`}
            className={`calendar-month__cell ${cell.isCurrentMonth ? '' : 'calendar-month__cell--outside'}`}
          >
            {cell.day != null && <span className="calendar-month__day">{cell.day}</span>}
            {cell.meets.length > 0 && (
              <ul className="calendar-month__events">
                {cell.meets.map((meet) => (
                  <li
                    key={`${meet.date}-${meet.series}-${meet.round}-${meet.desc}`}
                    className={`calendar-event ${statusClass(meet.stat)}`}
                    title={`${meet.desc} · ${meet.venue} · ${meet.stat}`}
                  >
                    <span className="calendar-event__series">{meet.seriesLabel}</span>
                    <span className="calendar-event__desc">{meet.desc}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
