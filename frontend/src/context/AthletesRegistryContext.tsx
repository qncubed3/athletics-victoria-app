import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { fetchAthletes } from '../api/client'
import type { AthleteSearchEntry } from '../types/athlete'
import {
  buildSearchIndex,
  readCachedIndex,
  writeCachedIndex,
} from '../utils/athleteSearch'

interface RegistryState {
  index: AthleteSearchEntry[]
  ready: boolean
  loading: boolean
  error: string | null
  fromCache: boolean
}

const defaultState: RegistryState = {
  index: [],
  ready: false,
  loading: false,
  error: null,
  fromCache: false,
}

const AthletesRegistryContext = createContext<RegistryState>(defaultState)

let loadPromise: Promise<AthleteSearchEntry[] | null> | null = null

async function loadRegistryFromNetwork(): Promise<AthleteSearchEntry[]> {
  const data = await fetchAthletes()
  const index = buildSearchIndex(data.athletes)
  writeCachedIndex(index)
  return index
}

function getRegistry(): Promise<AthleteSearchEntry[] | null> {
  if (!loadPromise) {
    loadPromise = (async () => {
      const cached = readCachedIndex()
      if (cached) return cached
      return loadRegistryFromNetwork()
    })().catch((e) => {
      loadPromise = null
      throw e
    })
  }
  return loadPromise
}

/**
 * Prefetch athlete registry after first paint.
 * Cache is read asynchronously so sessionStorage JSON.parse
 * does not block the UI on startup.
 */
export function AthletesRegistryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RegistryState>(defaultState)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true }))

    getRegistry()
      .then((index) => {
        if (cancelled || !index) return
        setState({
          index,
          ready: true,
          loading: false,
          error: null,
          fromCache: false,
        })
      })
      .catch((e) => {
        if (cancelled) return
        setState({
          index: [],
          ready: false,
          loading: false,
          error: e instanceof Error ? e.message : 'Failed to load athletes',
          fromCache: false,
        })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AthletesRegistryContext.Provider value={state}>
      {children}
    </AthletesRegistryContext.Provider>
  )
}

export function useAthletesRegistry() {
  return useContext(AthletesRegistryContext)
}
