'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

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
    <div
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-5',
        wide && 'w-full'
      )}
    >
      <h4 className="m-0 mb-4 text-[0.9rem] font-semibold text-[var(--text-secondary)]">
        {title}
      </h4>
      {empty ? (
        <p className="m-0 text-[0.875rem] text-[var(--text-faint)]">{emptyMessage}</p>
      ) : (
        <div
          className="w-full"
          style={height === 'auto' ? undefined : { height }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
