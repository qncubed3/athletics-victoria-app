import { useMemo } from 'react'
import type { CompareRow } from '@/types/athlete'
import { cn } from '@/lib/cn'
import { perfCellClass } from './compareUtils'

type CompareTableProps = {
  rows: CompareRow[]
  athlete1Label: string
  athlete2Label: string
}

const athleteColClass = 'w-44 whitespace-normal break-words'

export function CompareTable({ rows, athlete1Label, athlete2Label }: CompareTableProps) {
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.meet_date.localeCompare(a.meet_date)),
    [rows]
  )

  return (
    <div className="overflow-x-auto rounded-[14px] border border-[var(--border)]">
      <table className="w-full table-fixed border-collapse text-[0.9rem]">
        <colgroup>
          <col />
          <col />
          <col />
          <col className={athleteColClass} />
          <col className={athleteColClass} />
        </colgroup>
        <thead className="bg-[var(--bg-subtle)]">
          <tr>
            <th className="border-b border-[var(--border)] px-4 py-3 text-left font-semibold whitespace-nowrap text-[var(--text-secondary)]">
              Date
            </th>
            <th className="border-b border-[var(--border)] px-4 py-3 text-left font-semibold whitespace-nowrap text-[var(--text-secondary)]">
              Event
            </th>
            <th className="border-b border-[var(--border)] px-4 py-3 text-left font-semibold whitespace-nowrap text-[var(--text-secondary)]">
              Venue
            </th>
            <th
              className={cn(
                athleteColClass,
                'border-b border-[var(--border)] px-4 py-3 text-left font-semibold text-[var(--text-secondary)]'
              )}
            >
              {athlete1Label}
            </th>
            <th
              className={cn(
                athleteColClass,
                'border-b border-[var(--border)] px-4 py-3 text-left font-semibold text-[var(--text-secondary)]'
              )}
            >
              {athlete2Label}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={`${row.meet_date}-${row.event}-${row.venue}`} className="hover:bg-[var(--bg-subtle)] last:[&_td]:border-b-0">
              <td className="border-b border-[var(--border-subtle)] px-4 py-3 text-[var(--text-primary)]">
                {row.meet_date}
              </td>
              <td className="border-b border-[var(--border-subtle)] px-4 py-3 text-[var(--text-primary)]">
                {row.event}
              </td>
              <td className="border-b border-[var(--border-subtle)] px-4 py-3 text-[var(--text-primary)]">
                {row.venue}
              </td>
              <td
                className={cn(
                  athleteColClass,
                  'border-b border-[var(--border-subtle)] px-4 py-3 font-semibold tabular-nums text-[var(--accent)]',
                  perfCellClass(1, row.winner)
                )}
              >
                {row.athlete1_performance ?? '—'}
              </td>
              <td
                className={cn(
                  athleteColClass,
                  'border-b border-[var(--border-subtle)] px-4 py-3 font-semibold tabular-nums text-[var(--accent)]',
                  perfCellClass(2, row.winner)
                )}
              >
                {row.athlete2_performance ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
