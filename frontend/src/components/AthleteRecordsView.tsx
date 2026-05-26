import { useMemo } from 'react'
import type { AthleteResultRow } from '../types/athlete'
import { computePersonalRecords } from '../utils/athleteAnalytics'

interface AthleteRecordsViewProps {
  rows: AthleteResultRow[]
}

export function AthleteRecordsView({ rows }: AthleteRecordsViewProps) {
  const records = useMemo(() => computePersonalRecords(rows), [rows])

  if (records.length === 0) {
    return <p className="athletes-status">No valid performances to show personal records.</p>
  }

  const trackRecords = records.filter((r) => !r.isDistanceEvent)
  const fieldRecords = records.filter((r) => r.isDistanceEvent)

  return (
    <div className="athlete-records">
      <p className="athlete-records__intro">
        Personal bests across {records.length} event{records.length === 1 ? '' : 's'} — sorted by
        how often each event was competed.
      </p>

      {trackRecords.length > 0 && (
        <RecordsTable title="Track & distance" records={trackRecords} />
      )}

      {fieldRecords.length > 0 && (
        <RecordsTable title="Field" records={fieldRecords} />
      )}
    </div>
  )
}

function RecordsTable({
  title,
  records,
}: {
  title: string
  records: ReturnType<typeof computePersonalRecords>
}) {
  return (
    <div className="records-section">
      <h4 className="records-section__title">{title}</h4>
      <div className="athletes-table-wrap">
        <table className="athletes-table athletes-table--records">
          <thead>
            <tr>
              <th>Event</th>
              <th>Personal best</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Entries</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.event}>
                <td>
                  <span className="athletes-table__primary">{rec.event}</span>
                </td>
                <td>
                  <span className="athletes-table__primary athletes-table__perf">
                    {rec.performance}
                  </span>
                  {rec.wind && (
                    <span className="athletes-table__sub">
                      Wind {rec.wind}
                      {rec.windAided ? ' · wind-aided' : ''}
                    </span>
                  )}
                </td>
                <td>{rec.meetDate}</td>
                <td>{rec.venue}</td>
                <td className="athletes-table__count">{rec.resultCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
