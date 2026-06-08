'use client'

import { useMemo } from 'react'
import { Flag } from 'lucide-react'
import { FilterPill } from '@/app/components/FilterPill'

export interface RelayEvent {
  event_ptr: string | null
  sex: string | null
  event_note: string | null
  division: string | null
  event_start_time: string | null
  duration_seconds?: number | null
  total_distance_m?: number | null
  leg_distance_m?: number | null
  distance?: string | null
  teams: unknown[]
}

function eventLabel(event: RelayEvent) {
  const division = event.event_note || (event.division ? `Division ${event.division}` : 'Relay')
  const time = event.event_start_time ? ` · ${event.event_start_time}` : ''
  return `${event.sex} ${division}${time}`
}

export function ReplayEventPicker({
  events,
  value,
  onChange,
}: {
  events: RelayEvent[]
  value: string
  onChange: (eventPtr: string) => void
}) {
  const options = useMemo(
    () =>
      events
        .filter((event) => event.event_ptr)
        .map((event) => ({
          value: event.event_ptr as string,
          label: eventLabel(event),
        })),
    [events]
  )

  if (options.length === 0) {
    return null
  }

  return (
    <div className="relative z-[1003] w-fit">
      <FilterPill
        icon={Flag}
        value={value}
        options={options}
        onChange={onChange}
        ariaLabel="Relay event"
      />
    </div>
  )
}
