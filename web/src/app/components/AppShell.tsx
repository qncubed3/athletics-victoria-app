'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { AthletesRegistryProvider } from '@/context/AthletesRegistryContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { Sidebar } from './Sidebar'
import '@/App.css'

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
  '/athletes': {
    title: 'Athletes',
    description: 'Search and explore athlete profiles and history.',
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

  return (
    <ThemeProvider>
      <AthletesRegistryProvider>
        <div className="app-shell">
          <Sidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen((v) => !v)}
          />

          <main
            className={`main-panel ${sidebarOpen ? 'main-panel--sidebar-open' : 'main-panel--sidebar-closed'} ${pathname === '/venues' ? 'main-panel--venues' : ''}`}
          >
            <header className="main-panel__header">
              <h2>{page.title}</h2>
              <p>{page.description}</p>
            </header>

            <section className="main-panel__body">{children}</section>
          </main>
        </div>
      </AthletesRegistryProvider>
    </ThemeProvider>
  )
}
