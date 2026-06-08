import type { AthleteCompareResponse } from '@/types/athlete'

type CompareSummaryBarProps = {
  athlete1Label: string
  athlete2Label: string
  data: AthleteCompareResponse
}

// win counts shown above the head to head table
export function CompareSummaryBar({
  athlete1Label,
  athlete2Label,
  data,
}: CompareSummaryBarProps) {
  const { summary, overlap_count } = data

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[14px] border border-[var(--border)] bg-[var(--bg-subtle)] px-6 py-5 max-[720px]:grid-cols-1 max-[720px]:text-center">
      <div className="flex flex-col gap-1 max-[720px]:items-center">
        <span className="text-[1.1rem] font-bold text-[var(--text-primary)]">{athlete1Label}</span>
        <span className="text-[2rem] leading-none font-extrabold tabular-nums text-[var(--win-text)]">
          {summary.athlete1_wins}
        </span>
        <span className="text-[0.8rem] font-semibold tracking-wide text-[var(--text-muted)] uppercase">
          wins
        </span>
      </div>

      <div className="flex flex-col items-center gap-1 px-2 text-center max-[720px]:order-first">
        <span className="text-[0.9rem] font-semibold text-[var(--text-secondary)]">
          {overlap_count} head-to-head
        </span>
        {(summary.ties > 0 || summary.unknown > 0) && (
          <span className="text-[0.8rem] text-[var(--text-faint)]">
            {summary.ties > 0 && `${summary.ties} tie${summary.ties === 1 ? '' : 's'}`}
            {summary.ties > 0 && summary.unknown > 0 && ' · '}
            {summary.unknown > 0 && `${summary.unknown} uncomparable`}
          </span>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 text-right max-[720px]:items-center max-[720px]:text-center">
        <span className="text-[1.1rem] font-bold text-[var(--text-primary)]">{athlete2Label}</span>
        <span className="text-[2rem] leading-none font-extrabold tabular-nums text-[var(--win-text)]">
          {summary.athlete2_wins}
        </span>
        <span className="text-[0.8rem] font-semibold tracking-wide text-[var(--text-muted)] uppercase">
          wins
        </span>
      </div>
    </div>
  )
}
