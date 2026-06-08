'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatClockTime, formatGunElapsed } from '../../replayTime'
import { ReplaySpeedMenu, type ReplaySpeed } from './ReplaySpeedMenu'

function ReplayPlayButton({
  isPlaying,
  onClick,
}: {
  isPlaying: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={cn('replay-controls__play', isPlaying && 'replay-controls__play--active')}
      onClick={onClick}
      aria-label={isPlaying ? 'Pause replay' : 'Play replay'}
    >
      {isPlaying ? <Pause size={16} strokeWidth={2.5} /> : <Play size={16} strokeWidth={2.5} />}
    </button>
  )
}

function ReplayClockDisplay({
  value,
  gunElapsed,
}: {
  value: number
  gunElapsed: number
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <p className="whitespace-nowrap text-[0.9rem] font-semibold tabular-nums text-[var(--text-primary)]">
        {formatClockTime(value)}
      </p>
      <p className="whitespace-nowrap text-[0.9rem] font-semibold tabular-nums text-[var(--accent)]">
        +{formatGunElapsed(gunElapsed)}
      </p>
    </div>
  )
}

function ReplayScrubber({
  value,
  min,
  max,
  progress,
  gunElapsed,
  onScrub,
}: {
  value: number
  min: number
  max: number
  progress: number
  gunElapsed: number
  onScrub: (next: number) => void
}) {
  return (
    <div className="replay-controls__track-wrap min-w-0 flex-1">
      <div
        className="replay-controls__track-fill"
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
      <input
        type="range"
        className="replay-controls__range"
        min={min}
        max={max}
        step={0.1}
        value={value}
        onChange={(event) => onScrub(Number(event.target.value))}
        aria-label="Replay time"
        aria-valuetext={`${formatClockTime(value)}, ${formatGunElapsed(gunElapsed)} since gun`}
      />
    </div>
  )
}

export function ReplaySlider({
  value,
  onChange,
  min = 0,
  max = 7200,
}: {
  value: number
  onChange: (timeOfDaySeconds: number) => void
  min?: number
  max?: number
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<ReplaySpeed>(50)
  const valueRef = useRef(value)
  const speedRef = useRef(speed)
  const onChangeRef = useRef(onChange)

  // Refs let the rAF loop read latest value/speed without re-subscribing each render.
  valueRef.current = value
  speedRef.current = speed
  onChangeRef.current = onChange

  const span = Math.max(max - min, 0.1)
  const progress = ((value - min) / span) * 100
  const gunElapsed = value - min

  // Changing events updates min/max; stop playback so we don't run past the new range.
  useEffect(() => {
    setIsPlaying(false)
  }, [min, max])

  // Advance scrubber time each frame while playing; refs avoid restarting the loop every tick.
  useEffect(() => {
    if (!isPlaying) {
      return
    }

    let frame = 0
    let last = performance.now()

    const tick = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      const next = Math.min(valueRef.current + delta * speedRef.current, max)
      onChangeRef.current(next)

      if (next >= max) {
        setIsPlaying(false)
        return
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isPlaying, max])

  function handlePlayPause() {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    if (value >= max) {
      onChange(min)
    }

    setIsPlaying(true)
  }

  function handleScrub(next: number) {
    setIsPlaying(false)
    onChange(next)
  }

  return (
    <div className="replay-controls flex shrink-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 shadow-[var(--shadow-pill)]">
      <ReplayPlayButton isPlaying={isPlaying} onClick={handlePlayPause} />
      <ReplayClockDisplay value={value} gunElapsed={gunElapsed} />
      <ReplayScrubber
        value={value}
        min={min}
        max={max}
        progress={progress}
        gunElapsed={gunElapsed}
        onScrub={handleScrub}
      />
      <ReplaySpeedMenu value={speed} onChange={setSpeed} />
    </div>
  )
}
