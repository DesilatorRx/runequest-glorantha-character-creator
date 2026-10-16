// Explanations of how each number on the sheet is built, for the click-to-open breakdown popovers.

import {
  CATEGORY_NAMES, CHAR_NAMES, RUNE_NAMES, categoryModParts, charUncapped, charValue, computeDerived,
  dexSR, extraDecades, healingRate, homelandOf, hpMods, maxEnc, occupationOf, opposite, rankedElementals, regionOf,
  runeCharTargets, runeValue, sizSR, type SkillLine,
} from './calc'
import { RULES } from './rules'
import type { Character, CharId, PowerRune, RuneId } from './types'
import { ELEMENTAL_RUNES } from './types'

export interface Row { label: string; value: string; strong?: boolean; dim?: boolean }
export interface Breakdown { rows: Row[]; note?: string }

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '±0')
const row = (label: string, n: number, opts: Partial<Row> = {}): Row => ({ label, value: signed(n), ...opts })
const total = (label: string, value: string | number): Row => ({ label, value: String(value), strong: true })

export function charBreakdown(c: Character, ch: CharId): Breakdown {
  const rows: Row[] = [{ label: c.options.charMethod === 'assign' ? 'Points assigned' : 'Rolled', value: String(c.chars[ch]) }]
  if (c.topUp[ch]) rows.push(row('Low-roll top-up', c.topUp[ch]!))
  const t = runeCharTargets(c)
  const [first, second] = rankedElementals(c)
  if (t.primary === ch) rows.push(row(`${RUNE_NAMES[first]} (highest rune)`, RULES.primaryRuneCharBonus))
  if (t.secondary === ch) rows.push(row(`${RUNE_NAMES[second]} (second rune)`, RULES.secondaryRuneCharBonus))
  const home = homelandOf(c)?.charMods?.[ch]
  if (home) rows.push(row(homelandOf(c)!.name, home))
  if (c.agingLoss[ch]) rows.push(row('Aging', -c.agingLoss[ch]!))
  if (ch === 'pow' && c.powSacrifice) rows.push(row('Sacrificed for Rune points', -c.powSacrifice))
  const raw = charUncapped(c, ch)
  if (raw > RULES.speciesMax) rows.push({ label: `Above the human maximum (${RULES.speciesMax})`, value: signed(RULES.speciesMax - raw), dim: true })
  rows.push(total(CHAR_NAMES[ch], charValue(c, ch)))
  return { rows }
}

export function runeBreakdown(c: Character, r: RuneId): Breakdown {
  const rows: Row[] = []
  const home = homelandOf(c)
  const region = regionOf(c)
  const homeRune = region?.rune?.replacesHomeland ? undefined : home?.rune
  if ((ELEMENTAL_RUNES as RuneId[]).includes(r)) {
    const slot = (['primary', 'secondary', 'tertiary'] as const).find(s => c.runes[s] === r)
    const v = slot === 'primary' ? RULES.primaryRune : slot === 'secondary' ? RULES.secondaryRune : slot === 'tertiary' ? RULES.tertiaryRune : 0
    rows.push({ label: slot ? `${slot[0].toUpperCase()}${slot.slice(1)} affinity` : 'Not an affinity', value: `${v}%` })
    if (homeRune === r) rows.push(row(`${home!.name} rune`, RULES.homelandRuneBonus))
    if (region?.rune?.rune === r) rows.push(row(region.name, region.rune.bonus))
    if (c.runeBonus[r]) rows.push(row('Bonus points', c.runeBonus[r]!))
    rows.push(total(RUNE_NAMES[r], `${runeValue(c, r)}%`))
    return { rows, note: `Elemental runes cap at ${RULES.maxElementalRune}%.` }
  }
  const p = r as PowerRune, o = opposite(p)
  const base = c.powerPicks.includes(p) ? RULES.powerRuneRaised : c.powerPicks.includes(o) ? 100 - RULES.powerRuneRaised : RULES.powerRuneStart
  rows.push({ label: c.powerPicks.includes(p) ? 'Chosen at 75%' : c.powerPicks.includes(o) ? `Opposite of ${RUNE_NAMES[o]}` : 'Starting value', value: `${base}%` })
  const shift = (x: PowerRune) => (c.runeBonus[x] ?? 0) + (homeRune === x ? RULES.homelandRuneBonus : 0) + (region?.rune?.rune === x ? region.rune.bonus : 0)
  if (shift(p)) rows.push(row('Bonuses to this rune', shift(p)))
  if (shift(o)) rows.push(row(`Bonuses to ${RUNE_NAMES[o]}`, -shift(o)))
  rows.push(total(RUNE_NAMES[p], `${runeValue(c, r)}%`))
  return { rows, note: `${RUNE_NAMES[p]} and ${RUNE_NAMES[o]} always total 100%; neither can pass ${RULES.maxPairedRune}%.` }
}

export function skillBreakdown(c: Character, l: SkillLine): Breakdown {
  const rows: Row[] = []
  const b = l.skill.base
  rows.push({ label: typeof b === 'number' ? 'Base chance' : `Base (${CHAR_NAMES[b.char]} × ${b.mult})`, value: `${l.base}%` })
  if (l.catMod || l.base > 0 || l.homeland + l.occupation + l.cult + l.history + l.personal > 0) {
    const parts = categoryModParts(c, l.skill.category).filter(p => p.mod !== 0).map(p => `${CHAR_NAMES[p.ch]} ${signed(p.mod)}`).join(', ')
    rows.push({ label: `${CATEGORY_NAMES[l.skill.category]} modifier${parts ? ` (${parts})` : ''}`, value: signed(l.catMod) })
  }
  const region = regionOf(c)
  if (l.homeland) rows.push(row(region ? `${homelandOf(c)?.name} / ${region.name}` : homelandOf(c)?.name ?? 'Homeland', l.homeland))
  if (l.occupation) rows.push(row(occupationOf(c)?.name ?? 'Occupation', l.occupation))
  if (l.cult) rows.push(row('Cult', l.cult))
  if (l.history) rows.push(row('Family history / experience', l.history))
  if (l.personal) rows.push(row('Personal bonus', l.personal))
  const raw = l.base + l.catMod + l.homeland + l.occupation + l.cult + l.history + l.personal
  if (l.capped) rows.push({ label: `Over the ${RULES.maxStartingSkill}% starting cap`, value: signed(l.total - raw), dim: true })
  rows.push(total(l.name, `${l.total}%`))
  const note = l.base === 0 && l.catMod === 0 && raw === 0 ? 'A 00% skill gets no category modifier until something raises it.' : undefined
  return { rows, note }
}

export type DerivedKey = 'hp' | 'mp' | 'healing' | 'damageBonus' | 'spiritDamage' | 'dexSR' | 'sizSR' | 'maxEnc' | 'move' | 'runePoints' | 'reputation'

export function derivedBreakdown(c: Character, key: DerivedKey): Breakdown {
  const d = computeDerived(c)
  const v = (ch: CharId) => charValue(c, ch)
  switch (key) {
    case 'hp': {
      const m = hpMods(c)
      return { rows: [{ label: 'CON', value: String(v('con')) }, row(`SIZ ${v('siz')}`, m.siz), row(`POW ${v('pow')}`, m.pow), total('Hit points', d.hp)] }
    }
    case 'mp': return { rows: [{ label: 'POW', value: String(v('pow')) }, total('Magic points', d.magicPoints)], note: 'Regained at a quarter of POW every six hours.' }
    case 'healing': return { rows: [{ label: 'CON', value: String(v('con')) }, total('Healing rate', healingRate(c))], note: '1 per 6 CON or part: hit points healed per location each week.' }
    case 'damageBonus': return { rows: [{ label: 'STR + SIZ', value: `${v('str')} + ${v('siz')} = ${v('str') + v('siz')}` }, total('Damage bonus', d.damageBonus)], note: '12 or less −1D4, 13–24 none, 25–32 +1D4, 33–40 +1D6, 41–56 +2D6.' }
    case 'spiritDamage': return { rows: [{ label: 'POW + CHA', value: `${v('pow')} + ${v('cha')} = ${v('pow') + v('cha')}` }, total('Spirit combat damage', d.spiritDamage)] }
    case 'dexSR': return { rows: [{ label: 'DEX', value: String(v('dex')) }, total('DEX strike rank', dexSR(c))], note: 'Added to every melee and missile attack.' }
    case 'sizSR': return { rows: [{ label: 'SIZ', value: String(v('siz')) }, total('SIZ strike rank', sizSR(c))], note: 'Added to melee attacks only.' }
    case 'maxEnc': return { rows: [{ label: 'Average of STR and CON', value: String(Math.round((v('str') + v('con')) / 2)) }, { label: 'Limited to STR', value: String(v('str')) }, total('Max ENC', maxEnc(c))] }
    case 'move': return { rows: [total('Movement', d.move)], note: '8 units of 3 meters per melee round for humans.' }
    case 'runePoints': {
      const rows: Row[] = [{ label: 'Initiate', value: String(c.cult ? RULES.startingRunePoints : 0) }]
      if (c.powSacrifice) rows.push(row('POW sacrificed', c.powSacrifice))
      if (extraDecades(c)) rows.push(row(`Older adventurer (${extraDecades(c)} decade${extraDecades(c) > 1 ? 's' : ''})`, RULES.olderRunePoints * extraDecades(c)))
      rows.push(total('Rune points', d.runePoints))
      return { rows }
    }
    case 'reputation': return {
      rows: [
        { label: 'Clan member', value: `${RULES.startingReputation}%` },
        row(occupationOf(c)?.name ?? 'Occupation', occupationOf(c)?.reputation ?? 0),
        row('Family history & heirloom', c.reputation),
        total('Reputation', `${d.reputation}%`),
      ],
    }
  }
}
