'use client'

import type { AthleteResultRow } from '@/types/athlete'
import {
  activitySummary,
  countsByMonth,
  countsByYear,
  topCounts,
} from '@/utils/athleteAnalytics'
import { CountBarChart } from './charts/CountBarChart'
import { YearLineChart } from './charts/YearLineChart'

// small card for one stat at the top of the page
function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex min-w-[100px] flex-col gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 max-sm:min-w-[calc(50%-6px)]">
      <span className="text-xl font-bold tabular-nums text-[var(--accent)]">{value}</span>
      <span className="text-[0.8rem] text-[var(--text-muted)]">{label}</span>
    </div>
  )
}

// activity tab on the athletes page
// rows is every result row for the selected athlete (from AthletesPage)
export function AthleteActivityView({ rows }: { rows: AthleteResultRow[] }) {
  // headline numbers shown in the stat cards
  const summary = activitySummary(rows)

  // data passed into the charts below
  const yearData = countsByYear(rows)
  const eventData = topCounts(rows, 'event')
  const venueData = topCounts(rows, 'venue')
  const monthData = countsByMonth(rows)

  return (
    <div className="flex flex-col gap-5">
      {/* top row of summary cards */}
      <div className="flex flex-wrap gap-3">
        <StatBox value={summary.totalResults} label="Total results" />
        <StatBox value={summary.yearsActive} label="Years active" />
        <StatBox value={summary.uniqueEvents} label="Events" />
        <StatBox value={summary.uniqueVenues} label="Venues" />
        {/* only show busiest year when we have at least one result in that year */}
        {summary.busiestYear.count > 0 && (
          <StatBox
            value={summary.busiestYear.year}
            label={`Busiest year (${summary.busiestYear.count})`}
          />
        )}
      </div>

      {/* line chart showing how many results per calendar year */}
      <YearLineChart title="Results per year" data={yearData} />

      {/* three bar charts side by side (stacked on mobile) */}
      <div className="grid grid-cols-3 items-start gap-4 max-sm:grid-cols-1">
        <CountBarChart title="Events competed" data={eventData} />
        <CountBarChart title="Venues visited" data={venueData} />
        <CountBarChart title="Seasonality (by month)" data={monthData} />
      </div>
    </div>
  )
}
