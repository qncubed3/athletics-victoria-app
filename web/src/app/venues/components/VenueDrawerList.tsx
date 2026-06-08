'use client'

import { X } from 'lucide-react'
import type { ParsedMeet, ParsedVenue } from '@/types/events'
import { cn } from '@/lib/cn'

interface VenueDrawerListProps {
  venues: ParsedVenue[]
  unmappedMeets: ParsedMeet[]
  selectedCode: string | null
  onSelectVenue: (code: string) => void
  onClose: () => void
}

export function VenueDrawerList({
  venues,
  unmappedMeets,
  selectedCode,
  onSelectVenue,
  onClose,
}: VenueDrawerListProps) {
  return (
    <div className="flex h-full min-h-0 w-[min(340px,36vw)] flex-col max-sm:w-[min(300px,78vw)]">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-panel)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="m-0 mb-1 text-[1.1rem] text-[var(--text-primary)]">Venues</h3>
            <p className="m-0 text-[0.85rem] text-[var(--text-muted)]">
              {venues.length} locations
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-[var(--bg-subtle)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-muted)]"
            aria-label="Close venue list"
            onClick={onClose}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <ul className="m-0 list-none space-y-1 p-0">
          {venues.map((venue) => {
            const isActive = selectedCode === venue.code

            return (
              <li key={venue.code}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-3 text-left text-[0.875rem] text-[var(--text-primary)] transition-[background,border-color] hover:border-[var(--text-faint)] hover:bg-[var(--bg-muted)]',
                    isActive && 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  )}
                  onClick={() => onSelectVenue(venue.code)}
                >
                  <span className="mr-2 min-w-0 flex-1">{venue.name}</span>
                  <span className="shrink-0 font-semibold text-[var(--accent)]">
                    {venue.meetCount}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* meets that exist in data but have no lat/lng on the map */}
        {unmappedMeets.length > 0 && (
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <h4 className="m-0 mb-2 text-[0.85rem] text-[var(--text-secondary)]">
              Meets without map coordinates
            </h4>
            <ul className="m-0 pl-[18px] text-[0.8rem] leading-[1.5] text-[var(--text-muted)]">
              {unmappedMeets.map((meet) => (
                <li key={`${meet.date}-${meet.series}-${meet.desc}`}>
                  <strong>{meet.venue}</strong> — {meet.desc} ({meet.dateLabel})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
