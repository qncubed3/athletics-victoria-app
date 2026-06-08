'use client'

import type { ParsedMeet } from '@/types/events'

const tableWrapClass = 'overflow-x-auto rounded-[14px] border border-[var(--border)]'
const thClass =
  'border-b border-[var(--border)] px-4 py-3 text-left font-semibold whitespace-nowrap text-[var(--text-secondary)]'
const tdClass =
  'border-b border-[var(--border-subtle)] px-4 py-3 text-[var(--text-primary)]'

const MEET_COLUMNS = ['Date', 'Series', 'Round', 'Event', 'Venue', 'Status']

// coloured badge for final / scheduled / provisional
function MeetStatusBadge({ stat }: { stat: string }) {
  const key = stat.toLowerCase()
  let badgeClass = 'inline-block rounded-md px-2 py-0.5 text-[0.8rem] font-semibold'

  if (key === 'final') {
    badgeClass += ' bg-[var(--bg-muted)] text-[var(--text-muted)]'
  } else if (key === 'scheduled') {
    badgeClass += ' bg-[var(--accent-soft)] text-[var(--accent)]'
  } else if (key === 'provisional') {
    badgeClass += ' bg-[rgba(234,179,8,0.15)] text-[#ca8a04] [[data-theme=dark]_&]:text-[#fbbf24]'
  }

  return <span className={badgeClass}>{stat}</span>
}

// column titles at the top of the meets table
function MeetHead() {
  return (
    <thead className="bg-[var(--bg-subtle)]">
      <tr>
        {MEET_COLUMNS.map((label) => (
          <th key={label} className={thClass}>
            {label}
          </th>
        ))}
      </tr>
    </thead>
  )
}

// one row in the meets table
function MeetRow({ meet }: { meet: ParsedMeet }) {
  return (
    <tr className="hover:bg-[var(--bg-subtle)] last:[&_td]:border-b-0">
      <td className={tdClass}>{meet.dateLabel}</td>
      <td className={tdClass}>{meet.seriesLabel}</td>
      <td className={tdClass}>{meet.round}</td>
      <td className={tdClass}>
        <span className="block">{meet.desc}</span>
      </td>
      <td className={tdClass}>{meet.venue}</td>
      <td className={tdClass}>
        <MeetStatusBadge stat={meet.stat} />
      </td>
    </tr>
  )
}

// table list of meets for the list view mode
export function CalendarListView({ meets }: { meets: ParsedMeet[] }) {
  if (meets.length === 0) {
    return (
      <p className="rounded-xl bg-[var(--bg-subtle)] px-5 py-4 text-[0.95rem] text-[var(--text-muted)]">
        No meets match these filters.
      </p>
    )
  }

  return (
    <div className={tableWrapClass}>
      <table className="w-full border-collapse text-[0.9rem]">
        <MeetHead />
        <tbody>
          {meets.map((meet) => (
            <MeetRow
              key={`${meet.date}-${meet.series}-${meet.round}-${meet.desc}`}
              meet={meet}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
