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
    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-x-5 gap-y-4 max-[720px]:grid-cols-1 [&>div]:max-w-none">
      <AthleteSearchPicker
        id="compare-athlete-1"
        label="Athlete 1"
        selected={athlete1}
        onSelect={onSelectAthlete1}
        onClear={onClearAthlete1}
        excludeApiName={athlete2?.apiName}
      />
      <span
        className="pb-3.5 text-[0.95rem] font-bold tracking-wider text-[var(--text-muted)] uppercase max-[720px]:pb-0 max-[720px]:text-center"
        aria-hidden
      >
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
