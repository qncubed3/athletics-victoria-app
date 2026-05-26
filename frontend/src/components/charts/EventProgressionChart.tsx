import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProgressionPoint } from '../../utils/athleteAnalytics'
import { formatPerformanceAxis } from '../../utils/athleteAnalytics'
import { ChartCard } from './ChartCard'
import { chartTooltipStyle, useChartTheme } from './chartTheme'

interface EventProgressionChartProps {
  event: string
  data: ProgressionPoint[]
  invertY?: boolean
}

function formatAxisDate(timestamp: number) {
  const d = new Date(timestamp)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' })
}

export function EventProgressionChart({ event, data, invertY = false }: EventProgressionChartProps) {
  const colors = useChartTheme()
  const tooltip = chartTooltipStyle(colors)

  return (
    <ChartCard
      title={`${event} — performance over time`}
      wide
      empty={data.length === 0}
      emptyMessage="No chartable performances for this event."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tick={{ fill: colors.axis, fontSize: 11 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={false}
            dy={8}
            minTickGap={32}
            tickFormatter={formatAxisDate}
          />
          <YAxis
            domain={['auto', 'auto']}
            reversed={invertY}
            tick={{ fill: colors.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) =>
              typeof v === 'number' ? formatPerformanceAxis(v, event) : String(v)
            }
          />
          <Tooltip
            {...tooltip}
            labelFormatter={(_, payload) => {
              const row = payload?.[0]?.payload as ProgressionPoint | undefined
              return row?.date ?? ''
            }}
            formatter={(_, __, item) => {
              const row = item.payload as ProgressionPoint
              const parts = [row.performance]
              if (row.wind) parts.push(`wind ${row.wind}`)
              if (row.venue) parts.push(row.venue)
              return [parts.join(' · '), 'Performance']
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors.accent}
            strokeWidth={2.5}
            dot={{ r: 4, fill: colors.accent, stroke: colors.panel, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: colors.accent, stroke: colors.panel, strokeWidth: 2 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
