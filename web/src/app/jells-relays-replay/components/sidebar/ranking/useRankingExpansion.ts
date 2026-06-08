import { useEffect, useMemo, useState } from 'react'
import type { TeamCurrentLeg } from '../../../getTeamCurrentLegs'

export function useRankingExpansion(rows: TeamCurrentLeg[]) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)

  const itemKeys = useMemo(() => rows.map((row) => row.teamName), [rows])

  // Reset expansion when the event team set changes, not when rank order changes.
  const teamSetKey = useMemo(
    () =>
      rows
        .map((row) => row.teamName)
        .sort()
        .join('\u0001'),
    [rows]
  )

  useEffect(() => {
    setExpandedTeam(null)
  }, [teamSetKey])

  function toggleTeam(teamName: string) {
    setExpandedTeam((current) => (current === teamName ? null : teamName))
  }

  return { expandedTeam, itemKeys, toggleTeam }
}
