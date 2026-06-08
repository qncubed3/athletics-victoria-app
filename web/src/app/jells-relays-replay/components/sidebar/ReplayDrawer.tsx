'use client'

import type { TeamCurrentLeg } from '../../getTeamCurrentLegs'
import { RankingList } from './ranking/RankingList'
import { ReplayDrawerHeader } from './ranking/ReplayDrawerHeader'
import { useRankingExpansion } from './ranking/useRankingExpansion'

export function ReplayDrawer({
  rows,
  onClose,
}: {
  rows: TeamCurrentLeg[]
  onClose: () => void
}) {
  const { expandedTeam, itemKeys, toggleTeam } = useRankingExpansion(rows)

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <ReplayDrawerHeader teamCount={rows.length} onClose={onClose} />
      <RankingList
        rows={rows}
        itemKeys={itemKeys}
        expandedTeam={expandedTeam}
        onToggleTeam={toggleTeam}
      />
    </div>
  )
}
