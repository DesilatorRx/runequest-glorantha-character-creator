import { describe, expect, it } from 'vitest'
import { newCharacter } from '../state/store'
import { cultStartingKeys, isUnraised, skillLines, skillTotal, sorceryLines, swapList } from './calc'
import { validate } from './validate'

// The Reddit tester's adventurer: an Esrolian noble initiated into Lhankor Mhy.
const lm = () => {
  const c = newCharacter()
  c.homeland = 'esrolia'
  c.occupation = 'noble'
  c.cult = 'lhankor_mhy'
  c.runes = { primary: 'earth', secondary: 'fire', tertiary: 'water' }
  c.powerPicks = ['truth', 'stasis']
  return c
}
const errorsOn = (c: ReturnType<typeof lm>, step: string) => validate(c).filter(i => i.step === step && i.severity === 'error').map(i => i.message)

describe('Reddit feedback', () => {
  it("lets a Lhankor Mhy initiate pick any script for Read/Write (any) and any Lore", () => {
    const c = lm()
    c.cultStartPicks = { 0: 'read_write:Theyalan', 1: 'lore:Dragon Pass' }
    c.cultPicks = ['read_write:Theyalan', 'lore:Dragon Pass']
    expect(cultStartingKeys(c)).toEqual(expect.arrayContaining(['read_write:Theyalan', 'lore:Dragon Pass', 'sing']))
    expect(skillLines(c).find(l => l.key === 'read_write:Theyalan')!.cult).toBe(20 + 20)
    expect(errorsOn(c, 'cult')).toEqual([])
  })

  it('swaps a homeland weapon bonus to another weapon', () => {
    const c = lm()
    const idx = 8 // Esrolia: Battle Axe +15
    expect(skillLines(c).find(l => l.key === 'battle_axe_1h')!.homeland).toBe(15)
    c.swaps = { [`homeland:${idx}`]: 'small_axe' }
    expect(skillLines(c).find(l => l.key === 'small_axe')!.homeland).toBe(15)
    expect(skillLines(c).find(l => l.key === 'battle_axe_1h')?.homeland ?? 0).toBe(0)
    expect(swapList(c)[0]).toMatch(/Battle Axe.*→.*Small Axe.*homeland/)
  })

  it('allows the initiation bonuses on Cult Lore, Worship, or Meditate only when the table option is on', () => {
    const c = lm()
    c.cultStartPicks = { 0: 'read_write:Theyalan', 1: 'lore:Dragon Pass' }
    c.cultPicks = ['worship:Lhankor Mhy', 'meditate']
    expect(errorsOn(c, 'cult').length).toBeGreaterThan(0)
    c.options = { ...c.options, cultBonusOnCultSkills: true }
    expect(errorsOn(c, 'cult')).toEqual([])
    expect(skillTotal(c, 'meditate')).toBeGreaterThanOrEqual(0 + 5 + 15)
  })

  it('takes personal bonuses on sorcery spells', () => {
    const c = lm()
    c.occupation = 'philosopher'
    c.chars.int = 16
    c.sorcery = { runes: ['truth'], techniques: ['command'], spells: ['logician'], cultSpells: [] }
    c.extraSkills = ['read_write:Theyalan']
    const before = sorceryLines(c)[0].bonus
    c.personal25 = ['sorcery:logician']
    expect(sorceryLines(c)[0].bonus).toBe(before + 25)
  })

  it('treats 00% skills nothing raised as unraised', () => {
    const c = lm()
    expect(isUnraised(skillLines(c).find(l => l.key === 'sense_chaos')!)).toBe(true)
    expect(isUnraised(skillLines(c).find(l => l.key === 'climb')!)).toBe(false)
  })
})
