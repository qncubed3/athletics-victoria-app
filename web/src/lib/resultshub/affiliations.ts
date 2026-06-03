import { fetchResultshubData } from './client'
import { parseJsArrays } from './parsers'

// List of affiliation codes
export async function fetchAffiliations() {
  const raw = await fetchResultshubData('db/select_affiliations.php', {})
  const tables = parseJsArrays(raw.raw_text)
  const rows = tables.affiliations || []

  const codes = []
  for (const row of rows) {
    if (row && row.AffilCode) {
      codes.push(row.AffilCode)
    }
  }

  return {
    source_url: raw.source_url,
    affiliations: codes,
  }
}
