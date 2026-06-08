'use client'

import { ArrowLeft, ExternalLink, X } from 'lucide-react'
import type { ParsedVenue } from '@/types/events'
import { googleMapsVenueUrl, venueTypeLabel } from '@/utils/venueMap'

interface VenueDrawerDetailProps {
  venue: ParsedVenue
  onBack: () => void
  onClose: () => void
}

export function VenueDrawerDetail({ venue, onBack, onClose }: VenueDrawerDetailProps) {
  const meetWord = venue.meetCount === 1 ? 'meet' : 'meets'

  return (
    <div className="flex h-full min-h-0 w-[min(340px,36vw)] flex-col max-sm:w-[min(300px,78vw)]">
      <div className="flex shrink-0 flex-col gap-2.5 border-b border-[var(--border)] bg-[var(--bg-panel)] p-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[0.875rem] font-semibold text-[var(--accent)] hover:underline"
            onClick={onBack}
          >
            <ArrowLeft size={18} strokeWidth={2} aria-hidden />
            All venues
          </button>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-[var(--bg-subtle)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-muted)]"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div>
          <h3 className="m-0 mb-1.5 text-[1.1rem] text-[var(--text-primary)]">{venue.name}</h3>
          {venue.address && (
            <p className="m-0 mb-2 text-[0.875rem] leading-[1.45] text-[var(--text-secondary)]">
              {venue.address}
            </p>
          )}
          <p className="m-0 text-[0.8rem] font-semibold tracking-[0.03em] text-[var(--text-muted)] uppercase">
            {venue.meetCount} {meetWord} · {venueTypeLabel(venue.type)}
          </p>
          <a
            href={googleMapsVenueUrl(venue)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-[var(--accent)] no-underline hover:underline"
          >
            <ExternalLink size={14} strokeWidth={2} aria-hidden />
            Open in Google Maps
          </a>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {venue.meets.map((meet) => (
            <li
              key={`${meet.date}-${meet.series}-${meet.round}-${meet.desc}`}
              className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-subtle)] p-3"
            >
              <span className="block text-[0.75rem] font-bold tracking-[0.02em] text-[var(--accent)] uppercase">
                {meet.dateLabel}
              </span>
              <span className="mt-1 block font-semibold text-[var(--text-primary)]">
                {meet.desc}
              </span>
              <span className="mt-1 block text-[0.8rem] text-[var(--text-muted)]">
                {meet.seriesLabel} · Round {meet.round} · {meet.stat}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
