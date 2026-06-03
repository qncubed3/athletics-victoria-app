import type { AthleteCompareResponse } from '@/types/athlete'
import { formatApiName } from './compareUtils'
import { CompareSummaryBar } from './CompareSummaryBar'
import { CompareTable } from './CompareTable'

type CompareResultsProps = {
  compare: AthleteCompareResponse
  athlete1Label: string
  athlete2Label: string
}

export function CompareResults({
  compare,
  athlete1Label,
  athlete2Label,
}: CompareResultsProps) {
  const name1 = athlete1Label || formatApiName(compare.athlete1)
  const name2 = athlete2Label || formatApiName(compare.athlete2)

  return (
    <section className="compare-results">
      <CompareSummaryBar athlete1Label={name1} athlete2Label={name2} data={compare} />

      {compare.overlap_count === 0 ? (
        <p className="athletes-status">No overlapping results for these athletes.</p>
      ) : (
        <CompareTable rows={compare.comparisons} athlete1Label={name1} athlete2Label={name2} />
      )}
    </section>
  )
}
