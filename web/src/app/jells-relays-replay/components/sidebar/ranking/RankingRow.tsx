import { ChevronDown } from 'lucide-react'
import { getClubDisplayName, getClubLogoUrl } from '@/lib/clubs'
import { cn } from '@/lib/cn'
import type { TeamCurrentLeg } from '../../../getTeamCurrentLegs'
import { RankingLegList } from './RankingLegList'
import { runnerLabel } from './rankingLabels'

export function RankingRow({
  row,
  rank,
  expanded,
  onToggle,
}: {
  row: TeamCurrentLeg
  rank: number
  expanded: boolean
  onToggle: () => void
}) {
  const clubCode = row.clubCode ?? ''
  const clubName = getClubDisplayName(row.clubCode)
  const logoUrl = getClubLogoUrl(row.clubCode)

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]',
        expanded && 'border-[var(--accent)] bg-[var(--accent-soft)]'
      )}
    >
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-1.5 px-2 py-1.5 text-left text-[0.8125rem] leading-tight text-[var(--text-primary)]"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={clubCode}
            className="h-7 w-7 shrink-0 rounded-md bg-[var(--bg-muted)] object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--bg-muted)] text-[0.65rem] font-semibold text-[var(--text-muted)]">
            {clubCode.slice(0, 2) || '—'}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="m-0 truncate font-semibold leading-[1.2]">
            {clubCode}
            {clubName && clubName !== clubCode ? (
              <span className="font-normal text-[var(--text-secondary)]">
                {' '}
                · {clubName}
              </span>
            ) : null}
          </p>
          <p className="m-0 truncate text-[0.75rem] leading-[1.2] text-[var(--text-muted)]">
            {runnerLabel(row)}
          </p>
        </div>

        <span className="shrink-0 text-[0.8125rem] font-semibold tabular-nums text-[var(--accent)]">
          {rank}
        </span>

        <ChevronDown
          size={16}
          strokeWidth={2.25}
          className={cn(
            'shrink-0 text-[var(--text-muted)] transition-transform duration-200',
            expanded ? 'rotate-0' : 'rotate-90'
          )}
          aria-hidden
        />
      </button>

      {expanded && <RankingLegList legs={row.legs} currentLegNumber={row.legNumber} />}
    </div>
  )
}
