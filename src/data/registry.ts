// All homelands, occupations, and cults the app knows: the book's plus the user's homebrew.
// Homebrew is set at runtime (from browser storage or an imported file); lookups always go through here.

import type { Cult, Homeland, Occupation } from '../engine/types'
import { CULTS, HOMELANDS, OCCUPATIONS } from '.'

export const HOMEBREW_FORMAT = 'rqg-character-creator/homebrew'

export interface Homebrew {
  format: typeof HOMEBREW_FORMAT
  version: 1
  name: string
  homelands: Homeland[]
  occupations: Occupation[]
  cults: Cult[]
}

export const emptyHomebrew = (): Homebrew => ({ format: HOMEBREW_FORMAT, version: 1, name: 'My homebrew', homelands: [], occupations: [], cults: [] })

let homebrew: Homebrew = emptyHomebrew()
let maps: { homelands: Map<string, Homeland>; occupations: Map<string, Occupation>; cults: Map<string, Cult> } | undefined

export function setHomebrew(h: Homebrew): void {
  homebrew = h
  maps = undefined
}
export const getHomebrew = (): Homebrew => homebrew

export const allHomelands = (): Homeland[] => [...HOMELANDS, ...homebrew.homelands]
export const allOccupations = (): Occupation[] => [...OCCUPATIONS, ...homebrew.occupations]
export const allCults = (): Cult[] => [...CULTS, ...homebrew.cults]

function lookups() {
  maps ??= {
    homelands: new Map(allHomelands().map(x => [x.id, x])),
    occupations: new Map(allOccupations().map(x => [x.id, x])),
    cults: new Map(allCults().map(x => [x.id, x])),
  }
  return maps
}
export const findHomeland = (id: string) => lookups().homelands.get(id)
export const findOccupation = (id: string) => lookups().occupations.get(id)
export const findCult = (id: string) => lookups().cults.get(id)

export const isHomebrewId = (id: string) => id.startsWith('hb-')
