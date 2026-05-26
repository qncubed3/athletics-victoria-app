import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatRaceTime } from '../utils/relayAnalytics'

interface Row {
  leg: string
  avg: number
  min: number
  max: number
  count: number
}

export function AvgLegChart({ data }: { data: Row[] }) {
  if (!data.length) return <p className="empty-chart">No data.</p>

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="leg" />
          <YAxis tickFormatter={(v) => formatRaceTime(v)} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null
              const row = payload[0].payload as Row
              return (
                <div className="custom-tooltip">
                  <strong>{row.leg}</strong>
                  <div>Avg: {formatRaceTime(row.avg)}</div>
                  <div>Range: {formatRaceTime(row.min)} – {formatRaceTime(row.max)}</div>
                  <div>{row.count} teams</div>
                </div>
              )
            }}
          />
          <Bar dataKey="avg" fill="#4f46e5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="chart-hint">Average split per leg with min–max range (error bars).</p>
    </div>
  )
}
