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
    <div className="compare-summary">
      <div className="compare-summary__athlete compare-summary__athlete--left">
        <span className="compare-summary__name">{athlete1Label}</span>
        <span className="compare-summary__wins compare-summary__wins--win">
          {summary.athlete1_wins}
        </span>
        <span className="compare-summary__wins-label">wins</span>
      </div>

      <div className="compare-summary__center">
        <span className="compare-summary__overlap">{overlap_count} head-to-head</span>
        {(summary.ties > 0 || summary.unknown > 0) && (
          <span className="compare-summary__meta">
            {summary.ties > 0 && `${summary.ties} tie${summary.ties === 1 ? '' : 's'}`}
            {summary.ties > 0 && summary.unknown > 0 && ' · '}
            {summary.unknown > 0 && `${summary.unknown} uncomparable`}
          </span>
        )}
      </div>

      <div className="compare-summary__athlete compare-summary__athlete--right">
        <span className="compare-summary__name">{athlete2Label}</span>
        <span className="compare-summary__wins compare-summary__wins--win">
          {summary.athlete2_wins}
        </span>
        <span className="compare-summary__wins-label">wins</span>
      </div>
    </div>
  )
}
