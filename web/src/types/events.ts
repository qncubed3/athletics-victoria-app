export interface Season {
  code: string
  desc: string
  stat: string
  graphic: string | null
}

export interface SeasonSeries {
  code: string
  shortDesc: string
  longDesc: string
  graphic: string | null
  groupKey: string
  groupName: string
}

export interface SeasonMeet {
  series: string
  meetType: string | null
  round: string
  desc: string
  from: string
  to: string
  venue: string
  dataSource: string | null
  sourceId: string | null
  sponsor: string | null
  graphic: string | null
  stat: string
}

export interface SeasonVenue {
  type: string
  code: string
  name1: string
  name2: string | null
  address1: string | null
  address2: string | null
  mapRef: string | null
}

export interface EventsTables {
  seasons?: Season[]
  season_series?: SeasonSeries[]
  season_meets?: SeasonMeet[]
  season_venues?: SeasonVenue[]
  news?: unknown[]
  multiVenue_meets?: unknown[]
}

export interface EventsResponse {
  source_url: string
  tables: EventsTables
}

export interface ParsedMeet extends SeasonMeet {
  date: string
  dateLabel: string
  seriesLabel: string
}

export interface CalendarFilters {
  season: string
  series: string
  status: string
}

export interface VenueFilters extends CalendarFilters {
  venueType: string
}

export interface ParsedVenue {
  code: string
  type: string
  name: string
  address: string
  lat: number
  lng: number
  meetCount: number
  meets: ParsedMeet[]
}

export type CalendarViewMode = 'list' | 'calendar'
