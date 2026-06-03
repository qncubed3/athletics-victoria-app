'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Home,
  MapPin,
  Moon,
  PanelLeft,
  Swords,
  Sun,
  Trophy,
  Users,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export const NAV_ROUTES = [
  { label: 'Home', href: '/' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Venues', href: '/venues' },
  { label: 'Athletes', href: '/athletes' },
  { label: '1v1s', href: '/1v1s' },
  { label: 'Results', href: '/results' },
] as const

const NAV_ICONS = {
  Home,
  Calendar: CalendarDays,
  Venues: MapPin,
  Athletes: Users,
  '1v1s': Swords,
  Results: Trophy,
} as const

function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { theme, ready, toggleTheme } = useTheme()
  const isDark = ready && theme === 'dark'

  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : 'sidebar--closed'}`}>
      <div className="sidebar__top">
        <button
          type="button"
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <PanelLeft size={20} strokeWidth={2} aria-hidden />
        </button>
        {open && <h1 className="sidebar__brand">AthsVic Insights</h1>}
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        <ul>
          {NAV_ROUTES.map((item) => {
            const Icon = NAV_ICONS[item.label]
            const active = isNavActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar__link ${active ? 'sidebar__link--active' : ''}`}
                  title={item.label}
                >
                  <span className="sidebar__link-icon">
                    <Icon size={20} strokeWidth={2} aria-hidden />
                  </span>
                  {open && <span className="sidebar__link-label">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button
          type="button"
          className="sidebar__theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          <span className="sidebar__link-icon">
            {isDark ? (
              <Sun size={20} strokeWidth={2} aria-hidden />
            ) : (
              <Moon size={20} strokeWidth={2} aria-hidden />
            )}
          </span>
          {open && (
            <span className="sidebar__theme-label">
              {isDark ? 'Light mode' : 'Dark mode'}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
