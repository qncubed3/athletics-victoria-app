import type { CompareWinner } from '@/types/athlete'

// api name is Last,First so turn it into a normal name for the table headers
export function formatApiName(apiName: string) {
  const comma = apiName.indexOf(',')
  if (comma < 0) return apiName
  return `${apiName.slice(comma + 1).trim()} ${apiName.slice(0, comma).trim()}`
}

// green win, red loss, blue tie (see compare endpoint winner field)
export function perfCellClass(side: 1 | 2, winner: CompareWinner) {
  if (winner === -1) return ''
  if (winner === 0) return 'compare-table__perf--tie'
  if (winner === side) return 'compare-table__perf--win'
  return 'compare-table__perf--loss'
}
