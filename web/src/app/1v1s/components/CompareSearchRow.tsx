import type { AthleteSuggestion } from '@/types/athlete'
import { AthleteSearchPicker } from '@/app/components/AthleteSearchPicker'

type CompareSearchRowProps = {
  athlete1: AthleteSuggestion | null
  athlete2: AthleteSuggestion | null
  onSelectAthlete1: (athlete: AthleteSuggestion) => void
  onSelectAthlete2: (athlete: AthleteSuggestion) => void
  onClearAthlete1: () => void
  onClearAthlete2: () => void
}

export function CompareSearchRow({
  athlete1,
  athlete2,
  onSelectAthlete1,
  onSelectAthlete2,
  onClearAthlete1,
  onClearAthlete2,
}: CompareSearchRowProps) {
  return (
    <div className="compare-search-row">
      <AthleteSearchPicker
        id="compare-athlete-1"
        label="Athlete 1"
        selected={athlete1}
        onSelect={onSelectAthlete1}
        onClear={onClearAthlete1}
        excludeApiName={athlete2?.apiName}
      />
      <span className="compare-search-row__vs" aria-hidden>
        vs
      </span>
      <AthleteSearchPicker
        id="compare-athlete-2"
        label="Athlete 2"
        selected={athlete2}
        onSelect={onSelectAthlete2}
        onClear={onClearAthlete2}
        excludeApiName={athlete1?.apiName}
      />
    </div>
  )
}
