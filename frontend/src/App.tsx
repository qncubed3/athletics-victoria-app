import { useState } from 'react'
import { AthletesPage } from './components/AthletesPage'
import { Sidebar, type NavItem } from './components/Sidebar'
import { AthletesRegistryProvider } from './context/AthletesRegistryContext'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

const PAGE_COPY: Record<NavItem, { title: string; description: string }> = {
  Home: {
    title: 'Home',
    description: 'Welcome to AthsVic Insights — your athletics analytics hub.',
  },
  Calendar: {
    title: 'Calendar',
    description: 'Upcoming meets and season events will appear here.',
  },
  Athletes: {
    title: 'Athletes',
    description: 'Search and explore athlete profiles and history.',
  },
  Results: {
    title: 'Results',
    description: 'Race results, relays, and performance breakdowns.',
  },
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePage, setActivePage] = useState<NavItem>('Home')

  const page = PAGE_COPY[activePage]

  return (
    <ThemeProvider>
      <AthletesRegistryProvider>
        <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        active={activePage}
        onToggle={() => setSidebarOpen((v) => !v)}
        onNavigate={setActivePage}
      />

      <main
        className={`main-panel ${sidebarOpen ? 'main-panel--sidebar-open' : 'main-panel--sidebar-closed'}`}
      >
        <header className="main-panel__header">
          <h2>{page.title}</h2>
          <p>{page.description}</p>
        </header>

        <section className="main-panel__body">
          {activePage === 'Athletes' ? (
            <AthletesPage />
          ) : (
            <div className="placeholder-card">
              <p>Content for {activePage} coming soon.</p>
            </div>
          )}
        </section>
      </main>
        </div>
      </AthletesRegistryProvider>
    </ThemeProvider>
  )
}
