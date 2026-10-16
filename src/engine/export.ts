// Export format: the adventurer's choices (what the app needs to rebuild it) plus a `sheet` of final values,
// so VTTs and other tools can read the numbers without reimplementing RQG's rules. The app ignores `sheet` on import.

import {
  CATEGORY_NAMES, CHAR_NAMES, LOCATION_NAMES, RUNE_NAMES, armorByLocation, charValue, commonRuneSpells, computeDerived,
  cultOf, encCarried, encOver, gearById, homelandOf, knownSpirit, loadedSkill, occupationOf, regionOf, runeSpellById,
  runeValue, skillLines, sorceryLines, spiritSpellById,
} from './calc'
import type { Character, RuneId } from './types'
import { CHARS, ELEMENTAL_RUNES, LOCATIONS, POWER_PAIRS } from './types'
import { validate } from './validate'

export const SHEET_FORMAT = 'rqg-character-creator/sheet'
export const SHEET_VERSION = 1

/** Every final value on the adventurer sheet, in plain data. */
export function buildSheet(c: Character) {
  const d = computeDerived(c)
  const lines = skillLines(c)
  const armor = armorByLocation(c)
  const cult = cultOf(c)
  const runes = [...ELEMENTAL_RUNES, ...POWER_PAIRS.flat()] as RuneId[]
  const issues = validate(c)

  return {
    format: SHEET_FORMAT,
    version: SHEET_VERSION,
    note: 'Computed values for other tools; ignored when imported back into the app.',
    ruleset: 'RuneQuest: Roleplaying in Glorantha (Chaosium, 2018)',
    generated: new Date().toISOString(),
    complete: !issues.some(i => i.severity === 'error'),

    identity: {
      name: c.name,
      age: c.age,
      homeland: homelandOf(c)?.name ?? null,
      region: regionOf(c)?.name ?? null,
      occupation: occupationOf(c)?.name ?? null,
      cult: cult?.name ?? null,
      deity: cult ? cult.deity ?? cult.name : null,
    },
    characteristics: Object.fromEntries(CHARS.map(ch => [CHAR_NAMES[ch], charValue(c, ch)])),
    attributes: {
      hitPoints: d.hp,
      magicPoints: d.magicPoints,
      healingRate: d.healingRate,
      damageBonus: d.damageBonus === '—' ? null : d.damageBonus,
      spiritCombatDamage: d.spiritDamage,
      dexStrikeRank: d.dexSR,
      sizStrikeRank: d.sizSR,
      maxEnc: d.maxEnc,
      encCarried: encCarried(c),
      encOver: encOver(c),
      move: d.move,
      runePoints: d.runePoints,
      reputation: d.reputation,
    },
    runes: Object.fromEntries(runes.map(r => [RUNE_NAMES[r], runeValue(c, r)])),
    hitLocations: LOCATIONS.map(l => ({ location: LOCATION_NAMES[l], hitPoints: d.locations[l], armor: armor[l] })),
    skills: lines.map(l => ({
      key: l.key,
      name: l.name,
      category: CATEGORY_NAMES[l.skill.category],
      value: l.total,
      /** With the current load's encumbrance penalties (Dodge, and anything over max ENC). */
      valueLoaded: loadedSkill(c, l),
      sources: {
        base: l.base, categoryModifier: l.catMod, homeland: l.homeland, occupation: l.occupation,
        cult: l.cult, history: l.history, personal: l.personal,
      },
      capped: l.capped,
    })),
    passions: c.passions.map(p => ({ kind: p.kind, target: p.target || null, value: p.value })),
    weapons: c.gear.flatMap(g => {
      const w = gearById(g.id)
      if (!w || !['melee', 'missile', 'shield'].includes(w.category)) return []
      const skill = lines.find(l => l.key === w.skill)
      return [{
        name: w.name,
        skill: skill?.name ?? null,
        value: skill ? loadedSkill(c, skill) : null,
        damage: w.damage ?? null,
        addsDamageBonus: w.category === 'melee' || w.category === 'shield',
        strikeRank: w.category === 'missile' ? d.dexSR : d.dexSR + d.sizSR + (w.sr ?? 0),
        hitPoints: w.hp ?? null,
        range: w.range ?? null,
        stowed: !!g.stowed,
      }]
    }),
    magic: {
      spirit: knownSpirit(c).map(s => ({ name: spiritSpellById(s.id)?.name ?? s.id, points: s.points })),
      runeSpells: c.runeSpells.map(id => {
        const s = runeSpellById(id)
        return { name: s?.name ?? id, cost: s?.cost ?? null, variable: !!s?.variable, stackable: !!s?.stackable }
      }),
      commonRuneSpells: cult ? commonRuneSpells().map(s => s.name) : [],
      sorcery: sorceryLines(c).map(s => ({ name: s.name, value: s.total })),
    },
    equipment: c.gear.map(g => ({ name: gearById(g.id)?.name ?? g.id, quantity: g.qty, startingKit: !!g.kit, stowed: !!g.stowed })),
    issues: issues.map(i => ({ step: i.step, severity: i.severity, message: i.message })),
  }
}

/** What the Export button saves: the adventurer plus its computed sheet. */
export function exportCharacter(c: Character) {
  return { ...c, sheet: buildSheet(c) }
}
