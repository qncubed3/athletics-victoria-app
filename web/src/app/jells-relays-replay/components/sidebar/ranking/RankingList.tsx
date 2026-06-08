import type { TeamCurrentLeg } from '../../../getTeamCurrentLegs'
import { FlipList, FlipListItem } from '../FlipList'
import { RankingRow } from './RankingRow'

export function RankingList({
  rows,
  itemKeys,
  expandedTeam,
  onToggleTeam,
}: {
  rows: TeamCurrentLeg[]
  itemKeys: string[]
  expandedTeam: string | null
  onToggleTeam: (teamName: string) => void
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3">
      <FlipList itemKeys={itemKeys} className="m-0 list-none space-y-0.5 p-0">
        {rows.map((row, index) => (
          <FlipListItem key={row.teamName} flipKey={row.teamName}>
            <RankingRow
              row={row}
              rank={index + 1}
              expanded={expandedTeam === row.teamName}
              onToggle={() => onToggleTeam(row.teamName)}
            />
          </FlipListItem>
        ))}
      </FlipList>
    </div>
  )
}
