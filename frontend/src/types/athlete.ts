export interface AthleteSearchEntry {
  id: string
  displayName: string
  club: string
  apiName: string
  first: string
  last: string
  searchText: string
}

export interface RegistryAthlete {
  AthleteId: string
  SeqNbr: string
  BibNbr: string
  BibNbrYear: string
  FirstName: string
  LastName: string
  Affiliation: string
  AffileName: string | null
  Sex: string
  Class: string | null
}

export interface AthletesResponse {
  source_url: string
  athlete_count: number
  athletes: RegistryAthlete[]
}

export interface AthleteSuggestion {
  id: string
  displayName: string
  club: string
  apiName: string
}

export interface AthleteResultRow {
  meet_date: string
  event: string
  event_specification: string | null
  performance: string | null
  wind: string | null
  venue: string
}

export interface AthleteInfo {
  athlete: string | null
  club: string | null
  bib_year: string | null
  bib: string | null
  recent_result_age: string | null
}

export interface AthleteResultsResponse {
  source_url: string
  athlete_name: string
  data: {
    athlete_info: AthleteInfo
    results: AthleteResultRow[]
  }
}
