'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { TeamCurrentLeg } from '../../getTeamCurrentLegs'
import { ReplayDrawer } from './ReplayDrawer'

export function ReplaySidebar({ rows }: { rows: TeamCurrentLeg[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <aside
        className={cn(
          'absolute inset-y-0 left-0 z-[1001] flex h-full w-[min(340px,36vw)] flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--bg-panel)] shadow-[var(--shadow-panel)] transition-transform duration-[250ms] ease-in-out max-sm:w-[min(300px,78vw)]',
          drawerOpen ? 'translate-x-0' : 'pointer-events-none -translate-x-full'
        )}
        aria-hidden={!drawerOpen}
      >
        <ReplayDrawer rows={rows} onClose={() => setDrawerOpen(false)} />
      </aside>

      {!drawerOpen && (
        <button
          type="button"
          className="absolute top-3 left-3 z-[1002] flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[var(--bg-panel)] text-[var(--text-primary)] shadow-[0_2px_10px_rgba(0,0,0,0.18)] transition-colors hover:bg-[var(--bg-subtle)]"
          aria-label="Open ranking"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={22} strokeWidth={2} />
        </button>
      )}
    </>
  )
}
