'use client'

import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ParsedMeet } from '@/types/events'
import { buildMonthGrid, type CalendarDay } from '@/utils/eventCalendar'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// tailwind classes for month view pieces
const navBtnClass =
  'flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text-secondary)] transition-[background,border-color] hover:border-[var(--text-faint)] hover:bg-[var(--bg-subtle)]'
const monthTitleClass =
  'm-0 min-w-[180px] text-center text-[1.1rem] font-bold text-[var(--text-primary)]'
const gridClass =
  'grid grid-cols-7 overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--bg-panel)] [&>*:nth-child(7n)]:border-r-0'
const weekdayClass =
  'border-b border-[var(--border)] bg-[var(--bg-subtle)] px-2 py-2.5 text-center text-xs font-semibold text-[var(--text-muted)]'
const cellBaseClass =
  'min-h-[100px] border-r border-b border-[var(--border-subtle)] p-2 max-sm:min-h-[72px] max-sm:p-1'
const dayNumClass =
  'inline-flex h-[26px] w-[26px] items-center justify-center text-[0.8rem] font-semibold text-[var(--text-secondary)]'
const meetListClass =
  'm-0 mt-1.5 flex list-none flex-col gap-1 p-0'

// stable key for each meet in lists
function meetKey(meet: ParsedMeet) {
  return `${meet.date}-${meet.series}-${meet.round}-${meet.desc}`
}

// left border colour for each meet status in the grid
function meetBorderClass(stat: string) {
  const key = stat.toLowerCase()
  if (key === 'final') return 'border-l-[var(--text-faint)] opacity-85'
  if (key === 'scheduled') return 'border-l-[var(--accent)]'
  if (key === 'provisional') return 'border-l-[#ca8a04]'
  return 'border-l-[var(--accent)]'
}

// one meet chip inside a day cell
function MonthMeetItem({ meet }: { meet: ParsedMeet }) {
  const borderClass = meetBorderClass(meet.stat)

  return (
    <li
      className={`rounded-md border-l-[3px] bg-[var(--bg-subtle)] px-1.5 py-1 text-[0.7rem] leading-[1.3] ${borderClass}`}
      title={`${meet.desc} · ${meet.venue} · ${meet.stat}`}
    >
      <span className="block font-bold tracking-wide text-[var(--accent)] uppercase">
        {meet.seriesLabel}
      </span>
      <span className="block truncate text-[var(--text-primary)] max-sm:line-clamp-2 max-sm:whitespace-normal">
        {meet.desc}
      </span>
    </li>
  )
}

// all meets stacked in one day cell
function MonthMeetList({ meets }: { meets: ParsedMeet[] }) {
  if (meets.length === 0) {
    return null
  }

  return (
    <ul className={meetListClass}>
      {meets.map((meet) => (
        <MonthMeetItem key={meetKey(meet)} meet={meet} />
      ))}
    </ul>
  )
}

// one square in the grid (a day number plus any meets)
function MonthDayCell({ cell }: { cell: CalendarDay }) {
  let cellClass = cellBaseClass
  if (cell.isCurrentMonth) {
    cellClass += ' bg-[var(--bg-panel)]'
  } else {
    cellClass += ' bg-[var(--bg-subtle)]'
  }

  return (
    <div className={cellClass}>
      {cell.day != null && <span className={dayNumClass}>{cell.day}</span>}
      <MonthMeetList meets={cell.meets} />
    </div>
  )
}

// Sun Mon Tue row at the top of the grid
function WeekdayHead() {
  return (
    <>
      {WEEKDAYS.map((day) => (
        <div key={day} className={weekdayClass}>
          {day}
        </div>
      ))}
    </>
  )
}

// 7 column grid with weekday labels and day cells
function MonthGrid({
  year,
  month,
  meets,
}: {
  year: number
  month: number
  meets: ParsedMeet[]
}) {
  const grid = buildMonthGrid(year, month, meets)

  return (
    <div className={gridClass}>
      <WeekdayHead />
      {grid.map((cell, i) => (
        <MonthDayCell key={cell.date ?? `pad-${i}`} cell={cell} />
      ))}
    </div>
  )
}

// arrow button for changing month
function MonthNavButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button type="button" className={navBtnClass} onClick={onClick} aria-label={label}>
      {children}
    </button>
  )
}

// prev month, title, next month bar
function MonthNav({
  label,
  onPrev,
  onNext,
}: {
  label: string
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <MonthNavButton label="Previous month" onClick={onPrev}>
        <ChevronLeft size={18} strokeWidth={2} />
      </MonthNavButton>
      <h3 className={monthTitleClass}>{label}</h3>
      <MonthNavButton label="Next month" onClick={onNext}>
        <ChevronRight size={18} strokeWidth={2} />
      </MonthNavButton>
    </div>
  )
}

// month calendar grid with prev/next buttons
export function CalendarMonthView({
  year,
  month,
  meets,
  onPrevMonth,
  onNextMonth,
}: {
  year: number
  month: number
  meets: ParsedMeet[]
  onPrevMonth: () => void
  onNextMonth: () => void
}) {
  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-3">
      <MonthNav label={monthLabel} onPrev={onPrevMonth} onNext={onNextMonth} />
      <MonthGrid year={year} month={month} meets={meets} />
    </div>
  )
}
