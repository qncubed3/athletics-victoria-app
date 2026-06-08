import type { CourseTrack } from './courseTrack'
import { interpolatePositionAtDistance } from './courseTrack'
import { parseTimeOfDayToSeconds } from './replayTime'

// API leg distances are based on a 6 km lap; the GeoJSON track is slightly longer.
const NOMINAL_LAP_M = 6000
export interface RelayLegTiming {
  leg_number: number
  cumulative_start_seconds: number
  cumulative_end_seconds: number
  start_distance_m?: number | null
  end_distance_m?: number | null
  athlete?: string | null
  split?: string | null
  split_seconds?: string | number | null
  start_time?: string | null
  end_time?: string | null
}

export interface RelayTeamWithLegs {
  team_name?: string
  affiliation?: string
  legs?: RelayLegTiming[]
}

export interface TeamCurrentLeg {
  teamName: string
  clubCode: string | null
  legNumber: number | null
  currentAthlete: string | null
  legs: RelayLegTiming[]
  distanceM: number | null
  cumulativeDistanceM: number | null
  lng: number | null
  lat: number | null
}

function getEventSeconds(timeOfDaySeconds: number, eventStartTime: string | null): number {
  const eventStart = parseTimeOfDayToSeconds(eventStartTime)
  if (eventStart == null) {
    return timeOfDaySeconds
  }

  return timeOfDaySeconds - eventStart
}
function findActiveLeg(legs: RelayLegTiming[], eventSeconds: number): RelayLegTiming | null {
  if (eventSeconds < 0) {
    return null
  }

  for (const leg of legs) {
    if (
      eventSeconds >= leg.cumulative_start_seconds &&
      eventSeconds < leg.cumulative_end_seconds
    ) {
      return leg
    }
  }

  return null
}

function getLegDistanceSpan(
  leg: RelayLegTiming,
  fallbackLegDistanceM: number | null
): number | null {
  if (leg.start_distance_m != null && leg.end_distance_m != null) {
    return leg.end_distance_m - leg.start_distance_m
  }

  return fallbackLegDistanceM
}

function getCourseLegEndM(legSpanM: number, course: CourseTrack): number {
  return course.total_distance_m * (legSpanM / NOMINAL_LAP_M)
}

function scaleLegProgressToCourse(
  distanceOnLegM: number,
  legSpanM: number,
  course: CourseTrack
): number {
  return distanceOnLegM * (getCourseLegEndM(legSpanM, course) / legSpanM)
}

function getLegDistanceTravelled(
  leg: RelayLegTiming,
  eventSeconds: number,
  fallbackLegDistanceM: number | null
): number | null {
  const legSpanM = getLegDistanceSpan(leg, fallbackLegDistanceM)
  if (legSpanM == null || legSpanM <= 0) {
    return null
  }

  const legDurationSeconds = leg.cumulative_end_seconds - leg.cumulative_start_seconds
  if (legDurationSeconds <= 0) {
    return 0
  }

  const avgSpeedMps = legSpanM / legDurationSeconds
  const elapsedSeconds = eventSeconds - leg.cumulative_start_seconds
  return avgSpeedMps * elapsedSeconds
}

function getTeamCumulativeDistanceM(
  leg: RelayLegTiming | null,
  distanceOnLegM: number | null,
  fallbackLegDistanceM: number | null
): number | null {
  if (leg == null || distanceOnLegM == null) {
    return null
  }

  if (leg.start_distance_m != null) {
    return leg.start_distance_m + distanceOnLegM
  }

  if (fallbackLegDistanceM != null) {
    return fallbackLegDistanceM * (leg.leg_number - 1) + distanceOnLegM
  }

  return distanceOnLegM
}

function findFinishedLeg(legs: RelayLegTiming[], eventSeconds: number): RelayLegTiming | null {
  if (legs.length === 0) {
    return null
  }

  const lastLeg = legs[legs.length - 1]
  if (eventSeconds >= lastLeg.cumulative_end_seconds) {
    return lastLeg
  }

  return null
}

export function getReplaySliderRange(
  eventStartTime: string | null,
  teams: RelayTeamWithLegs[],
  durationSeconds?: number | null
): { min: number; max: number } {
  const eventStart = parseTimeOfDayToSeconds(eventStartTime)
  const min = eventStart ?? 0

  let duration = durationSeconds ?? 0
  if (duration <= 0) {
    duration = teams.reduce((maxDuration, team) => {
      const legs = team.legs ?? []
      const lastLeg = legs[legs.length - 1]
      return Math.max(maxDuration, lastLeg?.cumulative_end_seconds ?? 0)
    }, 0)
  }

  return {
    min,
    max: duration > 0 ? min + duration : min + 7200,
  }
}

export function getTeamCurrentLegs(
  timeOfDaySeconds: number,
  teams: RelayTeamWithLegs[],
  eventStartTime: string | null,
  course: CourseTrack,
  fallbackLegDistanceM: number | null = null
): TeamCurrentLeg[] {
  const eventSeconds = getEventSeconds(timeOfDaySeconds, eventStartTime)
  return teams
    .map((team) => {
      const legs = team.legs ?? []
      const activeLeg = findActiveLeg(legs, eventSeconds)
      const finishedLeg = activeLeg ? null : findFinishedLeg(legs, eventSeconds)
      const leg = activeLeg ?? finishedLeg
      const legSpanM = leg ? getLegDistanceSpan(leg, fallbackLegDistanceM) : null
      const distanceOnLegM = activeLeg
        ? getLegDistanceTravelled(activeLeg, eventSeconds, fallbackLegDistanceM)
        : finishedLeg
          ? getLegDistanceSpan(finishedLeg, fallbackLegDistanceM)
          : null
      const legNumber = leg?.leg_number ?? null
      const cumulativeDistanceM = activeLeg
        ? getTeamCumulativeDistanceM(activeLeg, distanceOnLegM, fallbackLegDistanceM)
        : finishedLeg?.end_distance_m ?? null
      const courseDistanceM =
        distanceOnLegM != null && legSpanM
          ? scaleLegProgressToCourse(distanceOnLegM, legSpanM, course)
          : null
      const position =
        courseDistanceM != null
          ? interpolatePositionAtDistance(course, courseDistanceM)
          : null

      return {
        teamName: team.team_name || team.affiliation || 'Unknown',
        clubCode: team.affiliation ?? null,
        legNumber,
        currentAthlete: activeLeg?.athlete ?? null,
        legs,
        distanceM: distanceOnLegM,
        cumulativeDistanceM,
        lng: position?.lng ?? null,
        lat: position?.lat ?? null,
      }
    })
    .sort((a, b) => (b.cumulativeDistanceM ?? -1) - (a.cumulativeDistanceM ?? -1))
}
