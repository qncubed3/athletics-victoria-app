import { useMemo } from 'react'
import type { AthleteResultRow } from '../types/athlete'
import {
  activitySummary,
  countsByMonth,
  countsByYear,
  topCounts,
} from '../utils/athleteAnalytics'
import { CountBarChart } from './charts/CountBarChart'
import { YearLineChart } from './charts/YearLineChart'

interface AthleteActivityViewProps {
  rows: AthleteResultRow[]
}

export function AthleteActivityView({ rows }: AthleteActivityViewProps) {
  const yearData = useMemo(() => countsByYear(rows), [rows])
  const eventData = useMemo(() => topCounts(rows, 'event'), [rows])
  const venueData = useMemo(() => topCounts(rows, 'venue'), [rows])
  const monthData = useMemo(() => countsByMonth(rows), [rows])
  const summary = useMemo(() => activitySummary(rows), [rows])

  return (
    <div className="athlete-activity">
      <div className="activity-summary">
        <div className="activity-summary__stat">
          <span className="activity-summary__value">{summary.totalResults}</span>
          <span className="activity-summary__label">Total results</span>
        </div>
        <div className="activity-summary__stat">
          <span className="activity-summary__value">{summary.yearsActive}</span>
          <span className="activity-summary__label">Years active</span>
        </div>
        <div className="activity-summary__stat">
          <span className="activity-summary__value">{summary.uniqueEvents}</span>
          <span className="activity-summary__label">Events</span>
        </div>
        <div className="activity-summary__stat">
          <span className="activity-summary__value">{summary.uniqueVenues}</span>
          <span className="activity-summary__label">Venues</span>
        </div>
        {summary.busiestYear.count > 0 && (
          <div className="activity-summary__stat">
            <span className="activity-summary__value">{summary.busiestYear.year}</span>
            <span className="activity-summary__label">
              Busiest year ({summary.busiestYear.count})
            </span>
          </div>
        )}
      </div>

      <YearLineChart title="Results per year" data={yearData} />

      <div className="chart-grid">
        <CountBarChart title="Events competed" data={eventData} />
        <CountBarChart title="Venues visited" data={venueData} />
        <CountBarChart title="Seasonality (by month)" data={monthData} />
      </div>
    </div>
  )
}
