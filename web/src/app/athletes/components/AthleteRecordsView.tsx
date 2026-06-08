'use client'

import { useMemo } from 'react'
import type { AthleteResultRow } from '@/types/athlete'
import { computePersonalRecords } from '@/utils/athleteAnalytics'

interface AthleteRecordsViewProps {
  rows: AthleteResultRow[]
}

export function AthleteRecordsView({ rows }: AthleteRecordsViewProps) {
  const records = useMemo(() => computePersonalRecords(rows), [rows])

  if (records.length === 0) {
    return (
      <p className="rounded-xl bg-[var(--bg-subtle)] px-5 py-4 text-[0.95rem] text-[var(--text-muted)]">
        No valid performances to show personal records.
      </p>
    )
  }

  const trackRecords = records.filter((r) => !r.isDistanceEvent)
  const fieldRecords = records.filter((r) => r.isDistanceEvent)

  return (
    <div className="flex flex-col gap-6">
      <p className="m-0 text-[0.9rem] text-[var(--text-muted)]">
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
    <div>
      <h4 className="m-0 mb-3 text-[0.95rem] font-semibold text-[var(--text-secondary)]">
        {title}
      </h4>
      <div className="overflow-x-auto rounded-[14px] border border-[var(--border)]">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-[var(--bg-subtle)]">
            <tr>
              <th className="border-b border-[var(--border)] px-4 py-3 text-left font-semibold whitespace-nowrap text-[var(--text-secondary)]">
                Event
              </th>
              <th className="border-b border-[var(--border)] px-4 py-3 text-left font-semibold whitespace-nowrap text-[var(--text-secondary)]">
                Personal best
              </th>
              <th className="border-b border-[var(--border)] px-4 py-3 text-left font-semibold whitespace-nowrap text-[var(--text-secondary)]">
                Date
              </th>
              <th className="border-b border-[var(--border)] px-4 py-3 text-left font-semibold whitespace-nowrap text-[var(--text-secondary)]">
                Venue
              </th>
              <th className="border-b border-[var(--border)] px-4 py-3 text-left font-semibold whitespace-nowrap text-[var(--text-secondary)]">
                Entries
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.event} className="hover:bg-[var(--bg-subtle)] last:[&_td]:border-b-0">
                <td className="border-b border-[var(--border-subtle)] px-4 py-3 text-[var(--text-primary)]">
                  <span className="block">{rec.event}</span>
                </td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-3 text-[var(--text-primary)]">
                  <span className="block font-semibold tabular-nums text-[var(--accent)]">
                    {rec.performance}
                  </span>
                  {rec.wind && (
                    <span className="mt-0.5 block text-[0.8rem] font-normal text-[var(--text-faint)]">
                      Wind {rec.wind}
                      {rec.windAided ? ' · wind-aided' : ''}
                    </span>
                  )}
                </td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-3 text-[var(--text-primary)]">
                  {rec.meetDate}
                </td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-3 text-[var(--text-primary)]">
                  {rec.venue}
                </td>
                <td className="border-b border-[var(--border-subtle)] px-4 py-3 tabular-nums text-[var(--text-muted)]">
                  {rec.resultCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
