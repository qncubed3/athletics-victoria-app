'use client'

import { useMemo, useState } from 'react'
import { CLUBS, type Club } from '@/lib/clubs'

const SORTED_CLUBS: readonly Club[] = [...CLUBS].sort((a, b) =>
  a.code.localeCompare(b.code)
)

function matchesQuery(club: Club, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (club.code.toLowerCase().includes(q)) return true
  if (club.name && club.name.toLowerCase().includes(q)) return true
  return false
}

function ClubLogo({ code, logoUrl }: { code: string; logoUrl: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        className="inline-flex h-[72px] w-[72px] items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-base font-bold text-[var(--text-faint)]"
        title="Logo unavailable"
      >
        {code.slice(0, 2)}
      </span>
    )
  }

  return (
    <img
      src={logoUrl}
      alt=""
      className="block h-[72px] w-[72px] rounded-lg bg-[var(--bg-subtle)] object-contain"
      width={72}
      height={72}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

function ClubCard({ club }: { club: Club }) {
  return (
    <article
      className="flex flex-col items-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-4 text-center transition-[border-color,box-shadow] hover:border-[var(--accent)] hover:shadow-[var(--shadow-dropdown)]"
      title={club.name ?? club.code}
    >
      <ClubLogo code={club.code} logoUrl={club.logoUrl} />
      <p className="m-0 text-[0.85rem] font-bold tracking-[0.02em] text-[var(--text-primary)] tabular-nums">
        {club.code}
      </p>
      <p className="m-0 line-clamp-2 text-[0.75rem] leading-[1.35] text-[var(--text-secondary)]">
        {club.name ?? <span className="text-[var(--text-faint)]">—</span>}
      </p>
    </article>
  )
}

export function AffiliationsPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => SORTED_CLUBS.filter((club) => matchesQuery(club, query)),
    [query]
  )

  return (
    <div>
      <div className="relative mb-6 max-w-[480px]">
        <label
          className="mb-2 block text-[0.85rem] font-semibold text-[var(--text-secondary)]"
          htmlFor="affiliations-search"
        >
          Search clubs
        </label>
        <input
          id="affiliations-search"
          type="search"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3 text-base text-[var(--text-primary)] transition-[border-color,box-shadow,background] focus:border-[var(--accent)] focus:bg-[var(--bg-panel)] focus:shadow-[0_0_0_3px_var(--accent-soft)] focus:outline-none"
          placeholder="Code or club name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        <p className="m-0 mt-2 text-[0.8rem] text-[var(--text-faint)]">
          Showing {filtered.length} of {SORTED_CLUBS.length} affiliations
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="my-12 text-center text-[0.95rem] text-[var(--text-faint)]">
          No clubs match your search.
        </p>
      ) : (
        <div
          className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 px-0.5 pt-1 pb-4"
          role="list"
        >
          {filtered.map((club) => (
            <ClubCard key={club.code} club={club} />
          ))}
        </div>
      )}
    </div>
  )
}
