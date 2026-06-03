import { useMemo } from 'react'
import type { CompareRow } from '@/types/athlete'
import { perfCellClass } from './compareUtils'

type CompareTableProps = {
  rows: CompareRow[]
  athlete1Label: string
  athlete2Label: string
}

export function CompareTable({ rows, athlete1Label, athlete2Label }: CompareTableProps) {
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.meet_date.localeCompare(a.meet_date)),
    [rows]
  )

  return (
    <div className="athletes-table-wrap">
      <table className="athletes-table compare-table">
        <colgroup>
          <col />
          <col />
          <col />
          <col className="compare-table__athlete-col" />
          <col className="compare-table__athlete-col" />
        </colgroup>
        <thead>
          <tr>
            <th>Date</th>
            <th>Event</th>
            <th>Venue</th>
            <th className="compare-table__athlete-col">{athlete1Label}</th>
            <th className="compare-table__athlete-col">{athlete2Label}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={`${row.meet_date}-${row.event}-${row.venue}`}>
              <td>{row.meet_date}</td>
              <td>{row.event}</td>
              <td>{row.venue}</td>
              <td
                className={`compare-table__athlete-col athletes-table__perf ${perfCellClass(1, row.winner)}`}
              >
                {row.athlete1_performance ?? '—'}
              </td>
              <td
                className={`compare-table__athlete-col athletes-table__perf ${perfCellClass(2, row.winner)}`}
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
