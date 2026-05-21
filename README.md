# Athletics Victoria Results API

A Django REST API and data parsing layer for Athletics Victoria Results Hub race data.

This project converts a legacy Results Hub data feed into a structured, queryable JSON API suitable for analytics, dashboards, visualisations, and downstream applications.


# Background

Athletics Victoria race results are hosted through ResultHub.

The underlying ResultHub endpoint is:

```
https://athsvic.resultshub.com.au/php/resultsFileFetch.php
```

with query parameters such as:
```
?season=2026&series=xcr&round=1&venue=all
```
However, this endpoint is not a standard REST API.

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