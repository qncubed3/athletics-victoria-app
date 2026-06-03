'use client'

import type { ParsedMeet } from '@/types/events'

export interface CalendarListViewProps {
  meets: ParsedMeet[]
}

export function CalendarListView({ meets }: CalendarListViewProps) {
  // filters can hide every meet for the season
  if (meets.length === 0) {
    return <p className="athletes-status">No meets match these filters.</p>
  }

  return (
    <div className="athletes-table-wrap">
      <table className="athletes-table athletes-table--calendar">
        <thead>
          <tr>
            <th>Date</th>
            <th>Series</th>
            <th>Round</th>
            <th>Event</th>
            <th>Venue</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {meets.map((meet) => (
            <tr key={`${meet.date}-${meet.series}-${meet.round}-${meet.desc}`}>
              <td>{meet.dateLabel}</td>
              <td>{meet.seriesLabel}</td>
              <td>{meet.round}</td>
              <td>
                <span className="athletes-table__primary">{meet.desc}</span>
              </td>
              <td>{meet.venue}</td>
              <td>
                <span className={`calendar-status calendar-status--${meet.stat.toLowerCase()}`}>
                  {meet.stat}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
