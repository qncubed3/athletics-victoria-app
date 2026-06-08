'use client'

import { useEffect, useMemo, useState } from 'react'
import { getReplaySliderRange, getTeamCurrentLegs, type RelayTeamWithLegs } from '../getTeamCurrentLegs'
import type { CourseTrack } from '../courseTrack'
import { ReplayEventPicker, type RelayEvent } from './ReplayEventPicker'
import { ReplayDebugPanels } from './debug/ReplayDebugPanels'
import { CourseMap } from './map/CourseMap'
import { ReplaySidebar } from './sidebar/ReplaySidebar'
import { ReplaySlider } from './slider/ReplaySlider'

const RELAY_API = '/api/relays?season=2026&series=xcr&round=2'
const SHOW_DEBUG = false

export function ReplayPage({ course }: { course: CourseTrack }) {

  // state variables
  const [events, setEvents] = useState<RelayEvent[]>([])
  const [eventPtr, setEventPtr] = useState('')
  const [timeOfDaySeconds, setTimeOfDaySeconds] = useState(0)

  useEffect(() => {
    // fetch the relay events when the component mounts
    fetch(RELAY_API)
      .then((response) => response.json())
      .then((data) => {
        // gets the relays from the response, make sure it's an array
        const relays = (data.relays ?? []) as RelayEvent[]
        setEvents(relays)
        // set the event pointer to the first relay if available
        if (relays[0]?.event_ptr) {
          setEventPtr(relays[0].event_ptr)
        }
      })
      .catch(() => setEvents([])) // clear events if fetch fails
  }, [])

  // find the selected event based on the event pointer
  const selectedEvent = useMemo(
    () => events.find((item) => item.event_ptr === eventPtr),
    [events, eventPtr]
  )

  // get the selected teams from the selected event
  const selectedTeams = selectedEvent?.teams ?? []

  // get the slider range based on the selected event
  const sliderRange = useMemo(
    () =>
      getReplaySliderRange(
        selectedEvent?.event_start_time ?? null,
        selectedTeams as RelayTeamWithLegs[],
        selectedEvent?.duration_seconds
      ),
    [selectedEvent, selectedTeams]
  )

  // set the time of day seconds to the minimum value of the slider range
  useEffect(() => {
    setTimeOfDaySeconds(sliderRange.min)
  }, [eventPtr, sliderRange.min])

  // get the fallback leg distance from the selected event
  const fallbackLegDistanceM = selectedEvent?.leg_distance_m ?? null

  // get the team current legs
  const teamCurrentLegs = useMemo(
    () =>
      getTeamCurrentLegs(
        timeOfDaySeconds,
        selectedTeams as RelayTeamWithLegs[],
        selectedEvent?.event_start_time ?? null,
        course,
        fallbackLegDistanceM
      ),
    [timeOfDaySeconds, selectedTeams, selectedEvent, course, fallbackLegDistanceM]
  )

  // render the page layout and components
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">

      {/* event picker */}
      <ReplayEventPicker events={events} value={eventPtr} onChange={setEventPtr} />

      {/* debug panels */}
      {SHOW_DEBUG && (
        <ReplayDebugPanels teams={selectedTeams} rows={teamCurrentLegs} />
      )}

      {/* map and sidebar container */}
      <div
        className={`
          relative
          min-h-0
          flex-1
          overflow-hidden
          rounded-2xl
          border
          border-[var(--border)]
          bg-[var(--bg-subtle)]
        `}
      >
        <CourseMap course={course} teamMarkers={teamCurrentLegs} />
        <ReplaySidebar rows={teamCurrentLegs} />
      </div>

      {/* timeline slider for replay */}
      <ReplaySlider
        value={timeOfDaySeconds}
        onChange={setTimeOfDaySeconds}
        min={sliderRange.min}
        max={sliderRange.max}
      />
      
    </div>
  )
}
