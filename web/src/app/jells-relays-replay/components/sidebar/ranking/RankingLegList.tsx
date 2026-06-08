import { cn } from '@/lib/cn'
import type { RelayLegTiming } from '../../../getTeamCurrentLegs'
import { legTimeLabel } from './rankingLabels'

export function RankingLegList({
  legs,
  currentLegNumber,
}: {
  legs: RelayLegTiming[]
  currentLegNumber: number | null
}) {
  if (legs.length === 0) {
    return null
  }

  return (
    <div className="border-t border-[var(--border)] px-2 pb-2 pt-1.5">
      <ul className="m-0 list-none space-y-1 p-0">
        {legs.map((leg) => {
          const isCurrentLeg = currentLegNumber === leg.leg_number

          return (
            <li
              key={leg.leg_number}
              className={cn(
                'flex items-center justify-between gap-2 rounded-md px-1.5 py-1 text-[0.75rem] leading-[1.2]',
                isCurrentLeg && 'bg-[var(--bg-panel)]'
              )}
            >
              <span className="min-w-0 truncate text-[var(--text-primary)]">
                <span className="font-medium tabular-nums text-[var(--text-muted)]">
                  {leg.leg_number}.
                </span>{' '}
                {leg.athlete ?? '—'}
              </span>
              <span className="shrink-0 tabular-nums text-[var(--text-secondary)]">
                {legTimeLabel(leg)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
