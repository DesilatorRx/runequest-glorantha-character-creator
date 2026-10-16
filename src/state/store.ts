import { useCallback, useEffect, useState } from 'react'
import { homelandById, withKit } from '../engine/calc'
import { RQG_OPTIONS, RULES } from '../engine/rules'
import type { Character, Passion } from '../engine/types'
import { track } from '../analytics'
import { loadActiveId, loadCharacters, saveActiveId, saveCharacters } from './storage'

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export function newCharacter(): Character {
  const now = new Date().toISOString()
  return {
    id: uid(),
    schema: 1,
    created: now,
    updated: now,
    name: '',
    concept: '',
    notes: '',
    age: RULES.startingAge,
    options: { ...RQG_OPTIONS },
    homeland: '',
    homelandPicks: {},
    region: '',
    regionPicks: {},
    runes: { primary: '', secondary: '', tertiary: '' },
    powerPicks: [],
    runeBonus: {},
    chars: { str: 10, con: 10, siz: 13, dex: 10, int: 13, pow: 10, cha: 10 },
    topUp: {},
    runeCharToCha: {},
    passions: [],
    reputation: 0,
    historySkills: [],
    favored: {},
    occupation: '',
    occupationPicks: {},
    cult: '',
    cultStartPicks: {},
    cultPicks: [],
    powSacrifice: 0,
    personal25: [],
    personal10: [],
    extraSkills: [],
    spiritMagic: [],
    runeSpells: [],
    sorcery: { runes: [], techniques: [], spells: [], cultSpells: [] },
    olderPicks: [],
    agingLoss: {},
    gear: [],
    kitPicks: {},
    info: { gender: '', handedness: 'right', birthDay: 0, tribe: '', clan: '', father: '', mother: '', heirloom: '', scars: '' },
  }
}

/** Starting passions for a homeland, replacing any earlier homeland's defaults but keeping hand-added ones. */
export function homelandPassions(homeland: string): Passion[] {
  return (homelandById(homeland)?.passions ?? []).map(p => ({ uid: uid(), ...p }))
}

/** Fill any fields missing from older or hand-edited saves, and hand out a starting kit the save never received. */
export function normalize(raw: Partial<Character>): Character {
  // An exported file carries a computed `sheet`; drop it so the adventurer is rebuilt from its choices.
  const { sheet: _sheet, ...choices } = raw as Partial<Character> & { sheet?: unknown }
  const c = fillDefaults(choices)
  return c.occupation && c.kitFor === undefined ? withKit(c, c.occupation, uid) : c
}

function fillDefaults(raw: Partial<Character>): Character {
  const base = newCharacter()
  return {
    ...base,
    ...raw,
    options: { ...base.options, ...raw.options },
    runes: { ...base.runes, ...raw.runes },
    chars: { ...base.chars, ...raw.chars },
    sorcery: { ...base.sorcery, ...raw.sorcery },
    info: { ...base.info, ...raw.info },
    id: raw.id ?? base.id,
  } as Character
}

export function useCharacters() {
  const [chars, setChars] = useState<Character[]>(() => loadCharacters().map(normalize))
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveId())

  useEffect(() => saveCharacters(chars), [chars])
  useEffect(() => saveActiveId(activeId), [activeId])

  const active = chars.find(c => c.id === activeId) ?? null

  const update = useCallback((id: string, fn: (c: Character) => Character) => {
    setChars(list => list.map(c => (c.id === id ? { ...fn(c), updated: new Date().toISOString() } : c)))
  }, [])

  const create = useCallback(() => {
    track('new-adventurer', 'New adventurer')
    const c = newCharacter()
    setChars(list => [...list, c])
    setActiveId(c.id)
  }, [])

  const add = useCallback((c: Character) => {
    const copy = { ...normalize(c), id: uid() }
    setChars(list => [...list, copy])
    setActiveId(copy.id)
  }, [])

  const remove = useCallback((id: string) => {
    setChars(list => list.filter(c => c.id !== id))
    setActiveId(cur => (cur === id ? null : cur))
  }, [])

  return { chars, active, activeId, setActiveId, update, create, add, remove }
}
