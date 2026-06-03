import * as cheerio from 'cheerio'

// Turn empty Resultshub values into null
function cleanValue(value) {
  if (value === 'undefined' || value === '') {
    return null
  }
  return value
}

// Clean each key in a row object
function cleanRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return row
  }
  const cleaned = {}
  for (const key of Object.keys(row)) {
    cleaned[key] = cleanValue(row[key])
  }
  return cleaned
}

// Parse JS files that look like: tableName = [{...}];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseJsArrays(text): any {
  const pattern = /([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(\[.*?\]);/gs
  const tables = {}
  const matches = text.matchAll(pattern)

  for (const match of matches) {
    const tableName = match[1]
    const arrayText = match[2]
    try {
      const rows = JSON.parse(arrayText)
      if (Array.isArray(rows)) {
        tables[tableName] = rows.map(cleanRow)
      } else {
        tables[tableName] = rows
      }
    } catch (e) {
      tables[tableName] = {
        error: `Could not parse table '${tableName}'`,
        details: e instanceof Error ? e.message : String(e),
      }
    }
  }

  return tables
}

// Parse HTML athlete results page from fetch_athResults.php
export function parseAthleteResultsHtml(html) {
  const $ = cheerio.load(html)
  const rows = $('tr')

  let athleteInfo = {}
  const results = []

  rows.each((index, row) => {
    const cells = []
    $(row)
      .find('td, th')
      .each((_, cell) => {
        cells.push($(cell).text().trim())
      })

    if (cells.length === 0) {
      return
    }

    // First row has athlete summary text
    if (index === 0) {
      const summaryText = cells[0]
      const athleteMatch = summaryText.match(/Athlete:\s*(.*?)\./)
      const clubMatch = summaryText.match(/Club:\s*(.*?)\./)
      const bibMatch = summaryText.match(/(\d{4})\s+Bib:\s*(.*?)\./)
      const ageMatch = summaryText.match(/Recent result age:\s*(.*?)$/)

      athleteInfo = {
        athlete: athleteMatch ? athleteMatch[1].trim() : null,
        club: clubMatch ? clubMatch[1].trim() : null,
        bib_year: bibMatch ? bibMatch[1].trim() : null,
        bib: bibMatch ? bibMatch[2].trim() : null,
        recent_result_age: ageMatch ? ageMatch[1].trim() : null,
      }
      return
    }

    // Result rows start with a date like 2024-...
    if (cells.length >= 6 && cells[0].startsWith('20')) {
      let wind = cells[4] || null
      if (wind) {
        wind = wind.replace('(', '').replace(')', '').trim() || null
      }

      results.push({
        meet_date: cells[0],
        venue: cells[5],
        event: cells[1],
        performance: cells[3] || null,
        event_specification: cells[2] || null,
        wind: wind,
      })
    }
  })

  return {
    athlete_info: athleteInfo,
    results: results,
  }
}
