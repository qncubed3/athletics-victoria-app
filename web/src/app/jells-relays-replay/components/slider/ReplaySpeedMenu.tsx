'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Gauge } from 'lucide-react'
import { cn } from '@/lib/cn'

export const REPLAY_SPEEDS = [1, 2, 10, 50, 100] as const
export type ReplaySpeed = (typeof REPLAY_SPEEDS)[number]

function formatSpeedLabel(speed: ReplaySpeed): string {
  return `${speed}×`
}

export function ReplaySpeedMenu({
  value,
  onChange,
}: {
  value: ReplaySpeed
  onChange: (speed: ReplaySpeed) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close the dropdown when the user clicks elsewhere or presses Escape.
  useEffect(() => {
    if (!open) {
      return
    }

    function onDocClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function selectSpeed(speed: ReplaySpeed) {
    onChange(speed)
    setOpen(false)
  }

  return (
    <div className="replay-speed-menu relative shrink-0" ref={rootRef}>
      <button
        type="button"
        className={cn('replay-speed-menu__trigger', open && 'replay-speed-menu__trigger--open')}
        aria-label="Playback speed"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Gauge size={15} strokeWidth={2.25} aria-hidden />
        <span>{formatSpeedLabel(value)}</span>
      </button>

      {open && (
        <ul className="replay-speed-menu__list" role="listbox" aria-label="Playback speed">
          {REPLAY_SPEEDS.map((speed) => {
            const isSelected = speed === value
            return (
              <li key={speed} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    'replay-speed-menu__option',
                    isSelected && 'replay-speed-menu__option--selected'
                  )}
                  onClick={() => selectSpeed(speed)}
                >
                  <span>{formatSpeedLabel(speed)}</span>
                  {isSelected && <Check size={14} strokeWidth={2.5} aria-hidden />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
