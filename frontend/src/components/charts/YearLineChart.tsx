import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from './ChartCard'
import { chartTooltipStyle, useChartTheme } from './chartTheme'

interface YearLineChartProps {
  title: string
  data: { year: string; count: number }[]
}

export function YearLineChart({ title, data }: YearLineChartProps) {
  const colors = useChartTheme()
  const tooltip = chartTooltipStyle(colors)

  return (
    <ChartCard title={title} wide empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: colors.axis, fontSize: 12 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={false}
            dy={8}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: colors.axis, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            {...tooltip}
            formatter={(value) => [value, 'Results']}
            labelFormatter={(label) => `Year ${label}`}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke={colors.accent}
            strokeWidth={2.5}
            dot={{ r: 4, fill: colors.accent, stroke: colors.panel, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: colors.accent, stroke: colors.panel, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
