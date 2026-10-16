import { useCallback, useState } from 'react'
import { HOMEBREW_FORMAT, emptyHomebrew, getHomebrew, setHomebrew, type Homebrew } from '../data/registry'
import type { Character, Cult, Homeland, Occupation } from '../engine/types'

const KEY = 'rqg-character-creator.homebrew.v1'

// Storage can throw (private mode, blocked site data); the app must keep working without it.

export function loadHomebrew(): Homebrew {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? asHomebrew(JSON.parse(raw)) ?? emptyHomebrew() : emptyHomebrew()
  } catch {
    return emptyHomebrew()
  }
}

function saveHomebrew(h: Homebrew): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(h))
  } catch {
    // ignore: persistence is best effort
  }
}

/** Accept a homebrew file (or the homebrew embedded in an exported adventurer); null if it isn't one. */
export function asHomebrew(raw: unknown): Homebrew | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<Homebrew>
  const list = <T,>(x: unknown) => (Array.isArray(x) ? (x as T[]).filter(e => e && typeof e === 'object' && typeof (e as { id?: unknown }).id === 'string') : [])
  const h: Homebrew = {
    format: HOMEBREW_FORMAT,
    version: 1,
    name: typeof r.name === 'string' ? r.name : 'Homebrew',
    homelands: list<Homeland>(r.homelands).map(x => ({ ...x, source: 'homebrew' })),
    occupations: list<Occupation>(r.occupations).map(x => ({ ...x, source: 'homebrew' })),
    cults: list<Cult>(r.cults).map(x => ({ ...x, source: 'homebrew' })),
  }
  return h.homelands.length || h.occupations.length || h.cults.length || r.format === HOMEBREW_FORMAT ? h : null
}

/** Add entries to a homebrew collection; an entry with the same id replaces the old one. */
export function mergeHomebrew(into: Homebrew, from: Homebrew): Homebrew {
  const merge = <T extends { id: string }>(a: T[], b: T[]) => [...a.filter(x => !b.some(y => y.id === x.id)), ...b]
  return { ...into, homelands: merge(into.homelands, from.homelands), occupations: merge(into.occupations, from.occupations), cults: merge(into.cults, from.cults) }
}

/** The homebrew an adventurer uses, so an exported file opens correctly on another computer. */
export function homebrewUsedBy(c: Character): Homebrew | null {
  const h = getHomebrew()
  const used: Homebrew = {
    ...emptyHomebrew(),
    name: `Homebrew used by ${c.name || 'an adventurer'}`,
    homelands: h.homelands.filter(x => x.id === c.homeland),
    occupations: h.occupations.filter(x => x.id === c.occupation),
    cults: h.cults.filter(x => x.id === c.cult),
  }
  return used.homelands.length || used.occupations.length || used.cults.length ? used : null
}

/** Homebrew state for the app: keeps the registry, storage, and React in step. */
export function useHomebrew() {
  const [homebrew, setState] = useState<Homebrew>(() => getHomebrew())
  const update = useCallback((next: Homebrew) => {
    setHomebrew(next)
    saveHomebrew(next)
    setState(next)
  }, [])
  return { homebrew, update }
}
