import { describe, expect, it } from 'vitest'
import { RULES } from '../engine/rules'
import type { SkillGrant, SkillKey } from '../engine/types'
import { CULTS, GEAR, HOMELANDS, OCCUPATIONS, RUNE_SPELLS, SKILLS, SPIRIT_SPELLS } from '.'

const skillIds = new Set(SKILLS.map(s => s.id))
const skillExists = (key: SkillKey) => key.startsWith('@') || skillIds.has(key.split(':')[0])
const grantKeys = (grants: SkillGrant[]) => grants.flatMap(g => ('skill' in g ? [g.skill] : Array.isArray(g.choose) ? g.choose : []))
const unique = (ids: string[]) => new Set(ids).size === ids.length

describe('data integrity', () => {
  it('has unique ids', () => {
    for (const list of [SKILLS, HOMELANDS, OCCUPATIONS, CULTS, SPIRIT_SPELLS, RUNE_SPELLS, GEAR])
      expect(unique(list.map(x => x.id))).toBe(true)
  })

  it('only references known skills', () => {
    const keys = [
      ...HOMELANDS.flatMap(h => [...grantKeys(h.skills), ...h.culturalWeapons]),
      ...OCCUPATIONS.flatMap(o => grantKeys(o.skills)),
      ...CULTS.flatMap(c => [...c.skills, ...(c.suggested ?? []).map(q => q.skill)]),
      ...RULES.cultFixedBonuses.map(g => g.skill),
      ...GEAR.flatMap(g => (g.skill ? [g.skill] : [])),
    ]
    expect(keys.filter(k => !skillExists(k))).toEqual([])
  })

  it('only references known cults, occupations, and spells', () => {
    const cults = new Set(CULTS.map(c => c.id))
    const occs = new Set(OCCUPATIONS.map(o => o.id))
    const spirit = new Set(SPIRIT_SPELLS.map(s => s.id))
    const rune = new Set(RUNE_SPELLS.map(s => s.id))
    expect(HOMELANDS.flatMap(h => h.cults).filter(id => !cults.has(id))).toEqual([])
    expect(OCCUPATIONS.flatMap(o => o.cults).filter(id => !cults.has(id))).toEqual([])
    expect(HOMELANDS.flatMap(h => h.occupations).filter(id => !occs.has(id))).toEqual([])
    expect(CULTS.flatMap(c => c.spiritSpells).filter(id => !spirit.has(id))).toEqual([])
    expect(CULTS.flatMap(c => c.runeSpells).filter(id => !rune.has(id))).toEqual([])
  })

  it('gives every cult enough skills for the initiation picks', () => {
    for (const c of CULTS) expect(c.skills.length).toBeGreaterThanOrEqual(RULES.cultSkillBonuses.length)
  })
})
