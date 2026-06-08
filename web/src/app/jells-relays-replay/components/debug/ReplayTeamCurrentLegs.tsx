// Temporary debug view — remove once replay UI is built.

import { Fragment } from 'react'
import type { TeamCurrentLeg } from '../../getTeamCurrentLegs'

export function ReplayTeamCurrentLegs({ rows }: { rows: TeamCurrentLeg[] }) {
  return (
    <div className="h-[25vh] w-full shrink-0 overflow-auto text-xs">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-0">
        <span className="font-medium">Team</span>
        <span className="font-medium tabular-nums">Leg</span>
        <span className="font-medium tabular-nums">Distance</span>
        <span className="font-medium tabular-nums">Lng, Lat</span>
        {rows.map((row) => (
          <Fragment key={row.teamName}>
            <span>{row.teamName}</span>
            <span className="tabular-nums">{row.legNumber ?? '—'}</span>
            <span className="tabular-nums">
              {row.distanceM != null ? `${Math.round(row.distanceM)}m` : '—'}
            </span>
            <span className="tabular-nums">
              {row.lng != null && row.lat != null
                ? `${row.lng.toFixed(6)}, ${row.lat.toFixed(6)}`
                : '—'}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
