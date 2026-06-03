import { useMemo } from 'react'
import { useTheme } from '@/context/ThemeContext'

export function useChartTheme() {
  const { theme } = useTheme()

  return useMemo(
    () =>
      theme === 'dark'
        ? {
            accent: '#3b82f6',
            accentSoft: 'rgba(59, 130, 246, 0.18)',
            grid: '#334155',
            axis: '#94a3b8',
            panel: '#1a2332',
            border: '#334155',
            text: '#f1f5f9',
            muted: '#94a3b8',
          }
        : {
            accent: '#1e3a5f',
            accentSoft: 'rgba(30, 58, 95, 0.12)',
            grid: '#e5e7eb',
            axis: '#6b7280',
            panel: '#ffffff',
            border: '#e5e7eb',
            text: '#111827',
            muted: '#6b7280',
          },
    [theme]
  )
}

export function chartTooltipStyle(colors: ReturnType<typeof useChartTheme>) {
  return {
    contentStyle: {
      background: colors.panel,
      border: `1px solid ${colors.border}`,
      borderRadius: 10,
      fontSize: 13,
      color: colors.text,
      boxShadow: 'var(--shadow-dropdown)',
    },
    labelStyle: { color: colors.muted, fontWeight: 600 },
    itemStyle: { color: colors.text },
  }
}
