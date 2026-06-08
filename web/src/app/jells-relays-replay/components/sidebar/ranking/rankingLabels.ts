import type { RelayLegTiming, TeamCurrentLeg } from '../../../getTeamCurrentLegs'

export function runnerLabel(row: TeamCurrentLeg): string {
  if (row.currentAthlete) {
    return row.currentAthlete
  }

  if (row.legNumber == null && row.cumulativeDistanceM == null) {
    return 'Not started'
  }

  return 'Finished'
}

export function legTimeLabel(leg: RelayLegTiming): string {
  if (leg.split) {
    return leg.split
  }

  if (leg.start_time && leg.end_time) {
    return `${leg.start_time} – ${leg.end_time}`
  }

  return '—'
}
