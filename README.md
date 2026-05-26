# Athletics Victoria Results API

A Django REST API and data parsing layer for Athletics Victoria Results Hub race data.

This project converts a legacy Results Hub data feed into a structured, queryable JSON API suitable for analytics, dashboards, visualisations, and downstream applications.


# Background

Athletics Victoria race results are hosted through ResultHub.

The underlying ResultHub endpoints found were:

```
https://athsvic.resultshub.com.au/php/resultsFileFetch.php
```
with query parameters such as:
```
?season=2026&series=xcr&round=1&venue=all
```
and
```
https://athsvic.resultshub.com.au/php/db/fetch_athResults.php
```
with query parameters such as:
```
?athleteName=LastName,FirstName
```

However, these endpoints are not a standard REST APIs.

Instead of returning normal JSON like:

```
{
  "results": [...]
}
```
it returns JavaScript-style variable assignments:

```
Signature_AlbertPark = [...];
sessions_AlbertPark = [...];
athletes_AlbertPark = [...];
```
or a HTML webpage with structured tabls containing fields
```
<tr>
  <th>Meet Date</th>
  <th>Event</th>
  <th>&nbsp;</th>
  <th style="text-align:right">Perf</th>
  <th>&nbsp;</th>
  <th>Venue</th>
  <!--<tr-->
</tr>
```

This suggests the endpoint was originally designed as an internal frontend data feed for the ResultHub website rather than as a public developer API.

# Project Goal
This project acts as an adapter layer between the legacy ResultHub feed and modern applications.

The goal is to:
- reverse engineer the Results Hub data format
- extract structured entities from the raw feed
- expose clean API endpoints
- eventually support historical storage and analytics

# Setup
Create virtual environment
```
python -m venv .venv
```

Activate:
```
.venv\Scripts\activate
```

Install dependencies
```
pip install django djangorestframework requests
```
Run Server
```
python manage.py runserver
```

# API Usage
Base local URL:
```
http://127.0.0.1:8000/api
```
Base deployed URL:
```
https://athletics-victoria-app.vercel.app/api
```
## Athlete Results
```
GET /api/athletes/results?name=LastName,FirstName
```
Fetches an athlete’s historical results and parses the upstream HTML table into structured JSON.

Example response shape:
```
{
  "source_url": "...",
  "athlete_name": "Nguyen,Quan",
  "data": {
    "athlete_info": {
      "athlete": "Quan Nguyen",
      "club": "MUU",
      "bib_year": "2026",
      "bib": "2938",
      "recent_result_age": "Open"
    },
    "results": [
      {
        "meet_date": "2026-05-16",
        "event": "6km (XC Relay)",
        "event_specification": null,
        "performance": "23:34",
        "wind": null,
        "venue": "Jells Park"
      }
    ]
  }
}
```

## Athlete Head-to-Head comparison
```
GET /api/athletes/compare?athlete1=LastName,FirstName&athlete2=LastName,FirstName
```
Compares two athletes by finding overlapping results with the same meet date, event and venue.

Each overlapping event includes a winner field:
```
0 = tie
1 = athlete1 wins
2 = athlete2 wins
-1 = unknown / cannot compare
```
Example response shape:
```
{
  "athlete1": "Nguyen,Quan",
  "athlete2": "Another,Athlete",
  "overlap_count": 3,
  "summary": {
    "athlete1_wins": 1,
    "athlete2_wins": 2,
    "ties": 0,
    "unknown": 0
  },
  "comparisons": [
    {
      "meet_date": "2023-09-03",
      "event": "21.1km (Road)",
      "venue": "Burnley",
      "athlete1_performance": "1:18:41",
      "athlete2_performance": "1:09:49",
      "winner": 2
    }
  ]
}


```
## Relay Results
```
GET /api/relays?season=<season>&series=<series>&round=<round>&club=<club>
```
Example request:
```
/api/relays?season=2026&series=xcr&round=2&club=MUU
```
Example response shape:
```
{
  "team": "MUU M1.6",
  "performance": "2:00:00",
  "place": "6",
  "legs": [
    {
      "leg_number": 1,
      "athlete": "First Last",
      "split": "20:00",
      "split_seconds": "1200"
    }
  ]
}
```

# Relay Results Processing
Relay events in the upstream ResultHub feed are represented differently from standard individual race results.

Rather than storing each athlete leg as a separate structured record, relay teams are encoded into compact pipe-delimited (`|`) and double-caret-delimited (`^^`) string fields embedded inside result rows.

Example upstream fields:

```
RelayMembers
RelaySplits
```
These fields contain packed relay leg information such as:

- athlete IDs
- bib numbers
- athlete names
- leg order
- split times

The fields are:
```
athlete_id | member_flag | bib | first_name | last_name | seq_id
```
```
split_flag | split_display | split_seconds
```

Example raw structure:
```
100001|M|1000|First|Last|1^^100002|M||First|Last|2
```
```
1|25:00|1500^^1|26:00|1560
```
The API normalizes these structures into analytics-ready JSON objects.

# Planned API Design
The long-term goal is to expose normalized entity-based endpoints instead such as:
```
/api/athletes
/api/events
/api/results
/api/sessions
/api/venues
/api/clubs
/api/relay-teams
/api/relay-legs
```
 with filtering such as:

```
?season=2026
?series=xcr
?round=1
?venue=Albert Park
```

# Future Work
## Data Modelling
Normalize raw ResultHub structures into:
```
athletes
events
sessions
race results
relay teams
relay legs
clubs
venues
```

## Historical Storage
Move from live-fetch architecture to persistent storage.

## Analytics
Potential future features:

- athlete progression tracking
- 1v1 athlete comparison
- club scoring
- race visualisations
- historical comparisons
- geospatial race analysis
- frontend dashboards