import {
  CalendarDays,
  Home,
  Moon,
  PanelLeft,
  Sun,
  Trophy,
  Users,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const NAV_ITEMS = ['Home', 'Calendar', 'Athletes', 'Results'] as const

export type NavItem = (typeof NAV_ITEMS)[number]

const NAV_ICONS = {
  Home,
  Calendar: CalendarDays,
  Athletes: Users,
  Results: Trophy,
} as const satisfies Record<NavItem, typeof Home>

interface SidebarProps {
  open: boolean
  active: NavItem
  onToggle: () => void
  onNavigate: (item: NavItem) => void
}

export function Sidebar({ open, active, onToggle, onNavigate }: SidebarProps) {
  const { theme, toggleTheme } = useTheme()

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
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item]
            return (
              <li key={item}>
                <button
                  type="button"
                  className={`sidebar__link ${active === item ? 'sidebar__link--active' : ''}`}
                  onClick={() => onNavigate(item)}
                  title={item}
                >
                  <span className="sidebar__link-icon">
                    <Icon size={20} strokeWidth={2} aria-hidden />
                  </span>
                  {open && <span className="sidebar__link-label">{item}</span>}
                </button>
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
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          <span className="sidebar__link-icon">
            {theme === 'dark' ? (
              <Sun size={20} strokeWidth={2} aria-hidden />
            ) : (
              <Moon size={20} strokeWidth={2} aria-hidden />
            )}
          </span>
          {open && (
            <span className="sidebar__theme-label">
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
