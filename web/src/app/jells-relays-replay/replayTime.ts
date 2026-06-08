export function parseTimeOfDayToSeconds(value: string | null): number | null {
  if (!value) {
    return null
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) {
    return null
  }

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  const meridiem = match[4].toUpperCase()

  if (meridiem === 'PM' && hours !== 12) {
    hours += 12
  }
  if (meridiem === 'AM' && hours === 12) {
    hours = 0
  }

  return hours * 3600 + minutes * 60 + seconds
}

/** Seconds since midnight (0 = 12:00 AM). Matches parsed API clock times. */
export function formatClockTime(secondsSinceMidnight: number): string {
  const normalized = ((secondsSinceMidnight % 86400) + 86400) % 86400
  const hours24 = Math.floor(normalized / 3600)
  const minutes = Math.floor((normalized % 3600) / 60)
  const seconds = Math.floor(normalized % 60)
  const meridiem = hours24 >= 12 ? 'PM' : 'AM'
  let hours12 = hours24 % 12
  if (hours12 === 0) {
    hours12 = 12
  }

  return `${hours12}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${meridiem}`
}

export function formatGunElapsed(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`
}
