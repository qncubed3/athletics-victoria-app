import { getCached, setCached } from '../api/cache'
import { fetchResultshubData } from './client'
import { parseJsArrays } from './parsers'

// Build cache key for season config
function eventsCacheKey(season) {
  return `events-${season}`
}

// Season config tables (meets, venues, series, etc)
export async function fetchEvents(season) {
  const key = eventsCacheKey(season)
  const cached = getCached(key)
  if (cached) {
    return cached
  }

  const raw = await fetchResultshubData('configFileFetch.php', {
    season: season,
  })

  const tables = parseJsArrays(raw.raw_text)

  const result = {
    source_url: raw.source_url,
    tables: tables,
  }

  setCached(key, result)
  return result
}

// News items from season config, optional series filter
export async function fetchNews(season = '2026', series) {
  const eventsData = await fetchEvents(season)
  let newsItems = eventsData.tables.news || []

  if (series) {
    newsItems = newsItems.filter((item) => item.series === series)
  }

  return {
    source_url: eventsData.source_url,
    season: season,
    series: series || null,
    news_count: newsItems.length,
    news: newsItems,
  }
}
