import { X } from 'lucide-react'

export function ReplayDrawerHeader({
  teamCount,
  onClose,
}: {
  teamCount: number
  onClose: () => void
}) {
  return (
    <header className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-panel)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 mb-1 text-[1.1rem] text-[var(--text-primary)]">Ranking</h3>
          <p className="m-0 text-[0.85rem] text-[var(--text-muted)]">{teamCount} teams</p>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-[var(--bg-subtle)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-muted)]"
          aria-label="Close ranking"
          onClick={onClose}
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>
    </header>
  )
}
