import { describe, expect, it } from 'vitest'
import { newCharacter } from '../state/store'
import {
  BASE_CATEGORIES, categoryMod, charValue, computeBudget, computeDerived, damageBonus, elementalRune, locationHP, powerRune, rollChar,
  runeCharTargets, runeValue, skillLines, skillTotal, spiritCombatDamage, takePassion,
} from './calc'
import type { Character } from './types'
import { CHARS } from './types'
import { validate } from './validate'

const make = (fn: (c: Character) => void = () => {}) => {
  const c = newCharacter()
  fn(c)
  return c
}
const withChars = (vals: Partial<Character['chars']>) => make(c => { c.chars = { ...c.chars, ...vals } })
const errors = (c: Character) => validate(c).filter(i => i.severity === 'error').map(i => i.message)

describe('runes', () => {
  it('gives 60/40/20 to elemental affinities plus the homeland bonus', () => {
    const c = make(c => { c.homeland = 'sartar'; c.runes = { primary: 'air', secondary: 'earth', tertiary: 'fire' } })
    expect(elementalRune(c, 'air')).toBe(70) // 60 + Sartar's +10 Air
    expect(elementalRune(c, 'earth')).toBe(40)
    expect(elementalRune(c, 'fire')).toBe(20)
    expect(elementalRune(c, 'water')).toBe(0)
  })

  it('raises two power runes to 75 and drops their opposites to 25', () => {
    const c = make(c => { c.powerPicks = ['movement', 'truth'] })
    expect(powerRune(c, 'movement')).toBe(75)
    expect(powerRune(c, 'stasis')).toBe(25)
    expect(powerRune(c, 'truth')).toBe(75)
    expect(powerRune(c, 'illusion')).toBe(25)
    expect(powerRune(c, 'man')).toBe(50)
  })

  it('moves the opposite rune with bonus points and caps pairs at 99', () => {
    const c = make(c => { c.powerPicks = ['harmony']; c.runeBonus = { harmony: 30 } })
    expect(powerRune(c, 'harmony')).toBe(99)
    expect(powerRune(c, 'disorder')).toBe(1)
    expect(computeBudget(c).runeBonus.spent).toBe(30)
  })

  it('rejects picking both sides of a pair', () => {
    expect(errors(make(c => { c.powerPicks = ['man', 'beast'] }))).toContainEqual(expect.stringContaining('opposed'))
  })

  it('adds +2/+1 to the characteristics of the two highest elemental runes', () => {
    const c = make(c => { c.runes = { primary: 'air', secondary: 'water', tertiary: 'earth' } })
    expect(runeCharTargets(c)).toEqual({ primary: 'str', secondary: 'dex' })
    expect(charValue(c, 'str')).toBe(12)
    expect(charValue(c, 'dex')).toBe(11)
    expect(charValue(c, 'con')).toBe(10)
  })

  it('follows bonus points when they reorder the elemental runes', () => {
    const c = make(c => { c.runes = { primary: 'air', secondary: 'water', tertiary: 'earth' }; c.runeBonus = { earth: 45 } })
    expect(runeCharTargets(c)).toEqual({ primary: 'con', secondary: 'str' })
  })
})

describe('characteristics', () => {
  it('rolls within the dice ranges', () => {
    for (let i = 0; i < 200; i++) {
      const s = rollChar('siz')
      expect(s).toBeGreaterThanOrEqual(8)
      expect(s).toBeLessThanOrEqual(18)
      const p = rollChar('pow')
      expect(p).toBeGreaterThanOrEqual(3)
      expect(p).toBeLessThanOrEqual(18)
    }
  })

  it('allows a 3-point top-up only for a low total', () => {
    const low = make(c => { c.chars = { str: 10, con: 10, siz: 13, dex: 10, int: 13, pow: 10, cha: 10 }; c.topUp = { str: 3 } }) // 76 total
    expect(errors(low).filter(e => e.includes('Low-roll'))).toEqual([])
    expect(charValue(low, 'str')).toBe(13)
    const high = make(c => { c.chars = { str: 15, con: 15, siz: 13, dex: 15, int: 13, pow: 15, cha: 15 }; c.topUp = { str: 1 } }) // 101
    expect(errors(high)).toContainEqual(expect.stringContaining('Low-roll points only apply'))
  })
})

describe('derived values', () => {
  it('computes hit points from CON with SIZ and POW modifiers', () => {
    expect(computeDerived(withChars({ con: 12, siz: 13, pow: 10 })).hp).toBe(13)
    expect(computeDerived(withChars({ con: 12, siz: 8, pow: 17 })).hp).toBe(12)
    expect(computeDerived(withChars({ con: 10, siz: 21, pow: 21 })).hp).toBe(15)
  })

  it('splits hit points by location', () => {
    expect(locationHP(6)).toMatchObject({ rleg: 2, abdomen: 2, chest: 3, rarm: 1, head: 2 })
    expect(locationHP(12)).toMatchObject({ rleg: 4, abdomen: 4, chest: 5, rarm: 3, head: 4 })
    expect(locationHP(13)).toMatchObject({ rleg: 5, chest: 6, rarm: 4 })
    expect(locationHP(22)).toMatchObject({ rleg: 8, chest: 9, rarm: 7 })
  })

  it('reads damage bonus and spirit combat damage bands', () => {
    expect(damageBonus(withChars({ str: 5, siz: 7 }))).toBe('−1D4')
    expect(damageBonus(withChars({ str: 12, siz: 12 }))).toBe('—')
    expect(damageBonus(withChars({ str: 16, siz: 16 }))).toBe('+1D4')
    expect(damageBonus(withChars({ str: 18, siz: 18 }))).toBe('+1D6')
    expect(spiritCombatDamage(withChars({ pow: 12, cha: 12 }))).toBe('1D6')
    expect(spiritCombatDamage(withChars({ pow: 18, cha: 18 }))).toBe('1D6+3')
  })

  it('computes strike ranks and healing rate', () => {
    const d = computeDerived(withChars({ dex: 13, siz: 15, con: 13 }))
    expect(d.dexSR).toBe(2)
    expect(d.sizSR).toBe(1)
    expect(d.healingRate).toBe(3)
  })
})

describe('skill category modifiers', () => {
  it('uses primary and secondary bands', () => {
    // Agility: DEX primary, STR/POW secondary, SIZ negative secondary.
    expect(categoryMod(withChars({ dex: 17, str: 10, pow: 10, siz: 13 }), 'agility')).toBe(10)
    expect(categoryMod(withChars({ dex: 10, str: 17, pow: 10, siz: 17 }), 'agility')).toBe(0)
    // Stealth: DEX and INT primary, SIZ negative primary, POW negative secondary.
    expect(categoryMod(withChars({ dex: 13, int: 13, siz: 9, pow: 10 }), 'stealth')).toBe(10)
    expect(categoryMod(withChars({ dex: 10, int: 10, siz: 17, pow: 17 }), 'stealth')).toBe(-15)
  })

  it('applies the Manipulation modifier to weapons', () => {
    const c = withChars({ dex: 17, int: 13 })
    expect(categoryMod(c, 'melee')).toBe(categoryMod(c, 'manipulation'))
    expect(categoryMod(c, 'manipulation')).toBe(15)
  })
})

describe('skills', () => {
  it('stacks homeland, occupation, cult, and personal bonuses', () => {
    const c = make(c => {
      c.homeland = 'sartar'
      c.occupation = 'warrior_heavy_infantry'
      c.cult = 'humakt'
      c.cultPicks = ['battle']
      c.personal25 = ['battle']
    })
    // Battle: base 10 + Knowledge 5 (INT 13) + occupation 30 + cult 20 + personal 25.
    expect(skillTotal(c, 'battle')).toBe(90)
    // Every initiate gets Worship +20, Cult Lore +15, Meditate +5 (Magic modifier is 0 at POW/CHA 10).
    expect(skillTotal(c, 'worship:Humakt')).toBe(25)
    expect(skillTotal(c, 'cult_lore:Humakt')).toBe(25)
  })

  it('caps starting skills at 100%', () => {
    const c = make(c => {
      c.homeland = 'grazelands'
      c.occupation = 'hunter'
      c.personal25 = ['herd']
      c.personal10 = ['herd']
      c.extraSkills = []
    })
    c.cult = 'waha'
    c.cultPicks = ['herd']
    c.chars.int = 17
    const herd = skillLines(c).find(l => l.key === 'herd')!
    expect(herd.total).toBe(100) // 5 base + 10 Knowledge + 35 + 20 + 25 + 10 = 105
    expect(herd.capped).toBe(true)
  })

  it('fills homeland placeholders in skill names', () => {
    const c = make(c => { c.homeland = 'esrolia' })
    expect(skillTotal(c, 'speak_own:Esrolian')).toBe(50)
    expect(skillTotal(c, 'customs:Esrolian')).toBe(30) // 25 + Knowledge 5
    expect(skillTotal(c, 'speak_other:Tradetalk')).toBe(20)
  })
})

describe('passions', () => {
  it('adds a new passion at 60 or +10 to one already held', () => {
    const c = make(c => { c.passions = [{ uid: 'a', kind: 'Loyalty', target: 'clan', value: 60 }] })
    expect(takePassion(c, { kind: 'Loyalty', target: 'clan' }, 'b')[0].value).toBe(70)
    expect(takePassion(c, { kind: 'Hate', target: 'Chaos' }, 'b')).toHaveLength(2)
  })
})

describe('validation', () => {
  it('flags missing core choices on a blank adventurer', () => {
    const e = errors(make())
    expect(e).toContainEqual(expect.stringContaining('homeland'))
    expect(e).toContainEqual(expect.stringContaining('occupation'))
    expect(e).toContainEqual(expect.stringContaining('cult'))
  })

  it('flags occupation picks that no longer fit after a homeland change', () => {
    const c = make(c => { c.homeland = 'sartar'; c.occupation = 'thief'; c.occupationPicks = { 8: 'broadsword' } })
    expect(errors(c).filter(e => e.includes('valid'))).toEqual([])
    c.homeland = 'esrolia' // Esrolian cultural weapons don't include the broadsword
    expect(errors(c)).toContainEqual(expect.stringContaining("isn't a valid cultural weapon"))
  })

  it('limits spirit magic to the cult grant and CHA', () => {
    const c = make(c => {
      c.cult = 'humakt'
      c.chars.cha = 4
      c.spiritMagic = [{ id: 'bladesharp', points: 5 }]
    })
    expect(errors(c)).toContainEqual(expect.stringContaining('CHA 4'))
  })

  it("matches the book's worked example, Vasana (pp.45–59)", () => {
    const c = make(c => {
      c.homeland = 'sartar'
      c.runes = { primary: 'air', secondary: 'moon', tertiary: 'earth' }
      c.powerPicks = ['movement', 'death']
      c.runeBonus = { air: 20, moon: 10, truth: 20 }
      c.chars = { str: 15, con: 11, siz: 10, dex: 11, int: 15, pow: 13, cha: 17 }
      c.topUp = { str: 1, con: 1, pow: 1 }
      c.runeCharToCha = { primary: true }
    })
    expect([runeValue(c, 'air'), runeValue(c, 'moon'), runeValue(c, 'earth')]).toEqual([90, 50, 20])
    expect([runeValue(c, 'movement'), runeValue(c, 'stasis'), runeValue(c, 'death'), runeValue(c, 'truth'), runeValue(c, 'illusion')]).toEqual([75, 25, 75, 70, 30])
    expect(CHARS.map(ch => charValue(c, ch))).toEqual([16, 12, 10, 11, 15, 15, 19])
    const d = computeDerived(c)
    expect([d.hp, d.healingRate, d.damageBonus, d.maxEnc, d.dexSR, d.sizSR, d.magicPoints]).toEqual([12, 2, '+1D4', 14, 3, 2, 15])
    expect(d.locations).toMatchObject({ rleg: 4, abdomen: 4, chest: 5, rarm: 3, head: 4 })
    expect(BASE_CATEGORIES.map(cat => categoryMod(c, cat))).toEqual([0, 10, 5, 10, 5, 5, 5]) // Stealth: INT 15 gives +5 (p.59 table)
    expect(errors(c).filter(e => e.includes('characteristic') || e.includes('CHA'))).toEqual([])
  })

  it('accepts a complete adventurer with no errors', () => {
    const c = make(c => {
      c.name = 'Vasana'
      c.homeland = 'sartar'
      c.homelandPicks = { 3: 'ride:Horse', 7: 'composite_bow' }
      c.runes = { primary: 'air', secondary: 'earth', tertiary: 'fire' }
      c.powerPicks = ['movement', 'truth']
      c.runeBonus = { air: 10, movement: 10, man: 10, fertility: 10, earth: 10 }
      c.chars = { str: 13, con: 12, siz: 13, dex: 12, int: 14, pow: 13, cha: 14 }
      c.occupation = 'warrior_heavy_infantry'
      c.occupationPicks = { 5: 'broadsword', 7: 'composite_bow', 8: 'dagger' }
      c.cult = 'orlanth_adventurous'
      c.cultStartPicks = { 3: 'broadsword' }
      c.cultPicks = ['orate', 'speak_other:Stormspeech']
      c.personal25 = ['broadsword', 'dodge', 'scan', 'listen']
      c.personal10 = ['ride:Horse', 'climb', 'jump', 'sing', 'shield_medium']
      c.spiritMagic = [{ id: 'bladesharp', points: 2 }, { id: 'heal', points: 2 }, { id: 'detect_enemies', points: 1 }]
      c.runeSpells = ['lightning', 'flight', 'shield']
    })
    expect(errors(c)).toEqual([])
  })
})
