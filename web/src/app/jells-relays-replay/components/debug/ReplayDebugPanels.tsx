// Temporary debug view — remove once replay UI is built.

import type { TeamCurrentLeg } from '../../getTeamCurrentLegs'
import { ReplayEventJsonDump } from './ReplayEventJsonDump'
import { ReplayTeamCurrentLegs } from './ReplayTeamCurrentLegs'

export function ReplayDebugPanels({
  teams,
  rows,
}: {
  teams: unknown[]
  rows: TeamCurrentLeg[]
}) {
  return (
    <div className="flex shrink-0 gap-3">
      <div className="min-w-0 flex-1">
        <ReplayEventJsonDump data={teams} />
      </div>
      <div className="min-w-0 flex-1">
        <ReplayTeamCurrentLegs rows={rows} />
      </div>
    </div>
  )
}
