import { afterEach, describe, expect, it } from 'vitest'
import { emptyHomebrew, findHomeland, setHomebrew } from '../data/registry'
import { computeBudget, elementalRune, skillTotal, startingLimits } from '../engine/calc'
import { exportCharacter } from '../engine/export'
import type { Homeland } from '../engine/types'
import { asHomebrew, mergeHomebrew } from './homebrew'
import { newCharacter } from './store'

const islands: Homeland = {
  id: 'hb-islands-abc12', name: 'The Islands', culture: 'Islander', language: 'Islander', rune: 'water', source: 'homebrew',
  skills: [{ skill: 'boat', bonus: 30 }, { skill: 'swim', bonus: 20 }], culturalWeapons: ['shortspear_1h'],
  passions: [{ kind: 'Love', target: 'family', value: 60 }], cults: [], occupations: [],
}

afterEach(() => setHomebrew(emptyHomebrew()))

describe('homebrew', () => {
  it('lets an adventurer use a homebrew homeland', () => {
    setHomebrew({ ...emptyHomebrew(), homelands: [islands] })
    const c = newCharacter()
    c.homeland = islands.id
    c.runes = { primary: 'water', secondary: 'air', tertiary: 'earth' }
    expect(skillTotal(c, 'boat')).toBeGreaterThanOrEqual(5 + 30)
    expect(elementalRune(c, 'water')).toBe(70) // 60 + the homeland's +10
  })

  it('travels inside an exported adventurer and comes back on import', () => {
    setHomebrew({ ...emptyHomebrew(), homelands: [islands] })
    const c = newCharacter()
    c.homeland = islands.id
    const file = JSON.parse(JSON.stringify(exportCharacter(c)))
    expect(file.homebrew.homelands[0].id).toBe(islands.id)

    setHomebrew(emptyHomebrew()) // another browser, without the pack
    expect(findHomeland(islands.id)).toBeUndefined()
    setHomebrew(mergeHomebrew(emptyHomebrew(), asHomebrew(file.homebrew)!))
    expect(findHomeland(islands.id)?.name).toBe('The Islands')
  })

  it('rejects files that are not homebrew', () => {
    expect(asHomebrew({ hello: 'world' })).toBeNull()
    expect(asHomebrew(null)).toBeNull()
  })
})

describe('starting power house rules', () => {
  it('adds personal bonuses, Rune points, and spirit magic, and moves the skill cap', () => {
    const c = newCharacter()
    c.cult = 'orlanth_adventurous'
    c.options = { ...c.options, extraPersonal25: 2, extraPersonal10: 1, extraRunePoints: 2, extraSpiritMagic: 3, skillCap: 120 }
    const b = computeBudget(c)
    expect([b.personal25.total, b.personal10.total, b.runeSpells.total, b.spiritMagic.total]).toEqual([6, 6, 5, 8])
    expect(startingLimits(c).runePoints).toBe(5)
    expect(startingLimits(c).skillCap).toBe(120)
  })
})
