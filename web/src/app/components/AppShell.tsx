'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { AthletesRegistryProvider } from '@/context/AthletesRegistryContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { cn } from '@/lib/cn'
import { Sidebar } from './Sidebar'

const PAGE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Home',
    description: 'Welcome to AthsVic Insights, your athletics analytics hub.',
  },
  '/calendar': {
    title: 'Calendar',
    description: 'Season meets and competition schedule from ResultsHub.',
  },
  '/venues': {
    title: 'Venues',
    description: 'Map of competition venues and meets hosted at each location.',
  },
  '/jells-relays-replay': {
    title: '2026 Jells Park XCR Relays Replay',
    description: '3D terrain map of the Jells Park cross country course.',
  },
  '/athletes': {
    title: 'Athletes',
    description: 'Search and explore athlete profiles and history.',
  },
  '/affiliations': {
    title: 'Affiliations',
    description: 'Club codes, names, and logos from the ResultsHub registry.',
  },
  '/1v1s': {
    title: '1v1s',
    description: 'Head-to-head comparison on overlapping meets, events, and venues.',
  },
  '/results': {
    title: 'Results',
    description: 'Race results, relays, and performance breakdowns.',
  },
}

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const page = PAGE_META[pathname] ?? {
    title: 'AthsVic Insights',
    description: '',
  }

  const isVenues = pathname === '/venues'
  const isJellsReplay = pathname === '/jells-relays-replay'
  const isAffiliations = pathname === '/affiliations'
  const isFullHeightMap = isVenues || isJellsReplay

  return (
    <ThemeProvider>
      <AthletesRegistryProvider>
        <div className="box-border min-h-dvh bg-[var(--bg-shell)] py-4 pr-4 pl-0 max-sm:p-3">
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((v) => !v)}
          />

          <main
            className={cn(
              'relative z-[2] flex min-w-0 flex-col rounded-[var(--panel-radius)] bg-[var(--bg-panel)] shadow-[var(--shadow-panel)] transition-[margin-left,background,box-shadow] duration-200',
              sidebarOpen ? 'ml-[var(--sidebar-full)]' : 'ml-[var(--sidebar-icon-col)]',
              'max-sm:ml-0 max-sm:min-h-[calc(100dvh-24px)] max-sm:rounded-[20px]',
              isFullHeightMap && 'h-[calc(100dvh-var(--panel-margin)*2)] max-h-[calc(100dvh-var(--panel-margin)*2)] overflow-hidden max-sm:h-auto max-sm:max-h-none',
              isAffiliations && 'h-auto min-h-[calc(100dvh-var(--panel-margin)*2)] max-h-none overflow-visible',
              !isFullHeightMap && !isAffiliations && 'min-h-[calc(100dvh-var(--panel-margin)*2)]'
            )}
          >
            <header className="px-9 pt-8">
              <h2 className="mb-2 text-[1.75rem] font-bold text-[var(--text-primary)]">
                {page.title}
              </h2>
              <p className="m-0 max-w-[48ch] text-base text-[var(--text-muted)]">
                {page.description}
              </p>
            </header>

            <section
              className={cn(
                'px-9 pt-7 pb-9',
                isFullHeightMap && 'flex min-h-0 flex-1 flex-col overflow-hidden',
                isAffiliations && 'flex-none overflow-visible'
              )}
            >
              {children}
            </section>
          </main>
        </div>
      </AthletesRegistryProvider>
    </ThemeProvider>
  )
}
