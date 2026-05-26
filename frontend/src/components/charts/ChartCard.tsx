import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  wide?: boolean
  height?: number | 'auto'
  empty?: boolean
  emptyMessage?: string
  children: ReactNode
}

export function ChartCard({
  title,
  wide = false,
  height = 240,
  empty = false,
  emptyMessage = 'No data to chart.',
  children,
}: ChartCardProps) {
  return (
    <div className={`chart-card ${wide ? 'chart-card--wide' : ''}`}>
      <h4 className="chart-card__title">{title}</h4>
      {empty ? (
        <p className="chart-card__empty">{emptyMessage}</p>
      ) : (
        <div
          className="chart-card__body"
          style={height === 'auto' ? undefined : { height }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
