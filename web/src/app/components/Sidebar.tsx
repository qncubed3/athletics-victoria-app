'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  CalendarDays,
  Home,
  MapPin,
  Moon,
  PanelLeft,
  Route,
  Swords,
  Sun,
  Trophy,
  Users,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/cn'

export const NAV_ROUTES = [
  { label: 'Home', href: '/' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Venues', href: '/venues' },
  { label: 'Jells Relays Replay', href: '/jells-relays-replay' },
  { label: 'Athletes', href: '/athletes' },
  { label: 'Affiliations', href: '/affiliations' },
  { label: '1v1s', href: '/1v1s' },
  { label: 'Results', href: '/results' },
] as const

const NAV_ICONS = {
  Home,
  Calendar: CalendarDays,
  Venues: MapPin,
  'Jells Relays Replay': Route,
  Athletes: Users,
  Affiliations: Building2,
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
    <aside
      className={cn(
        'pointer-events-none fixed top-0 bottom-0 left-0 z-[1] flex flex-col bg-transparent transition-[width] duration-250',
        open ? 'w-[var(--sidebar-full)]' : 'w-[var(--sidebar-icon-col)]',
        'max-sm:pointer-events-auto max-sm:relative max-sm:h-auto max-sm:w-full'
      )}
    >
      <div className="pointer-events-auto flex min-h-[72px] shrink-0 items-center gap-3 px-4 py-5">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[var(--sidebar-toggle-bg)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--sidebar-toggle-hover)]"
          onClick={onToggle}
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <PanelLeft size={20} strokeWidth={2} aria-hidden />
        </button>
        {open && (
          <h1 className="m-0 text-[1.05rem] leading-snug font-bold whitespace-nowrap text-[var(--text-primary)]">
            AthsVic Insights
          </h1>
        )}
      </div>

      <nav className="pointer-events-auto flex-1 px-3 py-2 max-sm:flex-none" aria-label="Main">
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {NAV_ROUTES.map((item) => {
            const Icon = NAV_ICONS[item.label]
            const active = isNavActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-[10px] border-0 bg-transparent px-2 py-1.5 text-left text-[0.95rem] font-medium text-[var(--text-secondary)] no-underline transition-colors',
                    !active && 'hover:[&_.sidebar-icon]:bg-[var(--sidebar-icon-hover)]'
                  )}
                  title={item.label}
                >
                  <span
                    className={cn(
                      'sidebar-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--sidebar-icon-bg)] text-[var(--text-muted)] transition-colors',
                      active && 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]'
                    )}
                  >
                    <Icon size={20} strokeWidth={2} aria-hidden />
                  </span>
                  {open && (
                    <span
                      className={cn(
                        'whitespace-nowrap',
                        active && 'font-bold text-[var(--text-primary)]'
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="pointer-events-auto mt-auto shrink-0 p-3">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-3 rounded-[10px] border-0 bg-transparent px-2 py-1.5 text-left text-[0.9rem] font-medium text-[var(--text-secondary)] transition-colors hover:[&_.sidebar-icon]:bg-[var(--sidebar-icon-hover)]"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          <span className="sidebar-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--sidebar-icon-bg)] text-[var(--text-muted)]">
            {isDark ? (
              <Sun size={20} strokeWidth={2} aria-hidden />
            ) : (
              <Moon size={20} strokeWidth={2} aria-hidden />
            )}
          </span>
          {open && (
            <span className="whitespace-nowrap text-[var(--text-muted)]">
              {isDark ? 'Light mode' : 'Dark mode'}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
