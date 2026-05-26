import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CountEntry } from '../../utils/athleteAnalytics'
import { ChartCard } from './ChartCard'
import { chartTooltipStyle, useChartTheme } from './chartTheme'

interface CountBarChartProps {
  title: string
  data: CountEntry[]
}

export function CountBarChart({ title, data }: CountBarChartProps) {
  const colors = useChartTheme()
  const tooltip = chartTooltipStyle(colors)
  const chartHeight = Math.max(200, data.length * 36 + 48)

  return (
    <ChartCard title={title} empty={data.length === 0} height={chartHeight}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
        >
          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: colors.axis, fontSize: 11 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={88}
            tick={{ fill: colors.axis, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip {...tooltip} formatter={(value) => [value, 'Count']} />
          <Bar dataKey="count" fill={colors.accent} radius={[0, 6, 6, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
