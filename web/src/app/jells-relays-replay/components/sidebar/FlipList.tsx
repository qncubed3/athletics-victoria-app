'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'

const FLIP_DURATION_MS = 400
const FLIP_EASING = 'cubic-bezier(0.25, 0.8, 0.25, 1)'

function sameKeySet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  const setA = new Set(a)
  return b.every((key) => setA.has(key))
}

function toOrderKey(itemKeys: string[]): string {
  return itemKeys.join('\u0001')
}

export function FlipList({
  itemKeys,
  className,
  children,
}: {
  itemKeys: string[]
  className?: string
  children: ReactNode
}) {
  const listRef = useRef<HTMLUListElement>(null)
  const positionsRef = useRef<Map<string, { top: number; left: number }>>(new Map())
  const prevOrderKeyRef = useRef('')
  const itemKeysRef = useRef(itemKeys)

  itemKeysRef.current = itemKeys

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) {
      return
    }

    const currentKeys = itemKeysRef.current
    const orderKey = toOrderKey(currentKeys)
    const prevKeys = prevOrderKeyRef.current
      ? prevOrderKeyRef.current.split('\u0001')
      : []
    const orderChanged = prevOrderKeyRef.current !== '' && prevOrderKeyRef.current !== orderKey

    const items = Array.from(list.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement && Boolean(node.dataset.flipKey)
    )

    const nextPositions = new Map<string, { top: number; left: number }>()
    for (const item of items) {
      const key = item.dataset.flipKey
      if (!key) {
        continue
      }

      const { top, left } = item.getBoundingClientRect()
      nextPositions.set(key, { top, left })
    }

    const prevPositions = positionsRef.current
    const shouldAnimate =
      orderChanged && prevPositions.size > 0 && sameKeySet(prevKeys, currentKeys)

    if (shouldAnimate) {
      for (const item of items) {
        const key = item.dataset.flipKey
        if (!key) {
          continue
        }

        const first = prevPositions.get(key)
        const last = nextPositions.get(key)
        if (!first || !last) {
          continue
        }

        const deltaX = first.left - last.left
        const deltaY = first.top - last.top
        if (deltaX === 0 && deltaY === 0) {
          continue
        }

        item.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`
        item.style.transition = 'transform 0s'
        item.style.zIndex = '1'

        requestAnimationFrame(() => {
          item.style.transition = `transform ${FLIP_DURATION_MS}ms ${FLIP_EASING}`
          item.style.transform = ''
        })

        const onTransitionEnd = (event: TransitionEvent) => {
          if (event.propertyName !== 'transform') {
            return
          }

          item.style.zIndex = ''
          item.removeEventListener('transitionend', onTransitionEnd)
        }

        item.addEventListener('transitionend', onTransitionEnd)
      }
    }

    positionsRef.current = nextPositions
    prevOrderKeyRef.current = orderKey
  })

  return (
    <ul ref={listRef} className={className}>
      {children}
    </ul>
  )
}

export function FlipListItem({
  flipKey,
  className,
  children,
}: {
  flipKey: string
  className?: string
  children: ReactNode
}) {
  return (
    <li data-flip-key={flipKey} className={className}>
      {children}
    </li>
  )
}
