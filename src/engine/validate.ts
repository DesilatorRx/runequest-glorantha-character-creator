import {
  CHAR_NAMES, RUNE_NAMES, availableSpiritSpells, isPhilosopher, knownSpirit, sorceryCultOf, sorceryLines, sorceryMasteries, charBase, charUncapped, cultGrants, cultStartingKeys, occupationGrants, regionOf, charRange, charValue, computeBudget, cultOf, homelandOf, occupationOf, opposite,
  remaining, rolledTotal, runeValue, runeSpellById, skillChoices, skillLines, skillName, spiritSpellById, topUpAllowed,
} from './calc'
import { SORCERY_RULES, maxMasteries } from '../data/sorcery'
import { RULES } from './rules'
import type { Character, SkillGrant } from './types'

/** Characteristic points lost to aging: one per two years (or part) above 40 (book p.81). */
export function agingRequired(c: Character): number {
  return c.age > RULES.agingFromAge ? Math.ceil((c.age - RULES.agingFromAge) / 2) : 0
}
import { CHARS } from './types'

export type StepId =
  | 'concept' | 'homeland' | 'runes' | 'characteristics' | 'passions' | 'occupation' | 'cult' | 'skills' | 'magic'
  | 'equipment' | 'other' | 'sheet'

export interface Issue {
  step: StepId
  severity: 'error' | 'warning'
  message: string
}

export function validate(c: Character): Issue[] {
  const out: Issue[] = []
  const err = (step: StepId, message: string) => out.push({ step, severity: 'error', message })
  const warn = (step: StepId, message: string) => out.push({ step, severity: 'warning', message })
  const b = computeBudget(c)

  // Concept
  if (!c.name.trim()) warn('concept', 'Give your adventurer a name.')

  // Homeland
  const home = homelandOf(c)
  if (!home) err('homeland', 'Choose a homeland.')

  // Runes
  const { primary, secondary, tertiary } = c.runes
  if (!primary || !secondary || !tertiary) err('runes', 'Choose a primary, secondary, and tertiary elemental rune.')
  const picked = [primary, secondary, tertiary].filter(Boolean)
  if (new Set(picked).size !== picked.length) err('runes', 'Primary, secondary, and tertiary runes must all be different.')
  if (c.powerPicks.length < RULES.powerRunePicks) warn('runes', `Choose ${RULES.powerRunePicks - c.powerPicks.length} more Power or Form rune to raise to ${RULES.powerRuneRaised}%.`)
  if (c.powerPicks.length > RULES.powerRunePicks) err('runes', `Only ${RULES.powerRunePicks} Power or Form runes start at ${RULES.powerRuneRaised}%.`)
  for (const r of c.powerPicks)
    if (c.powerPicks.includes(opposite(r))) err('runes', `${RUNE_NAMES[r]} and ${RUNE_NAMES[opposite(r)]} are opposed; pick runes from different pairs.`)
  if (remaining(b.runeBonus) < 0) err('runes', `Rune bonus points overspent by ${-remaining(b.runeBonus)}.`)
  else if (remaining(b.runeBonus) > 0) warn('runes', `${remaining(b.runeBonus)} rune bonus points left to add.`)

  // Characteristics
  if (b.topUp.spent > 0) {
    if (!topUpAllowed(c)) err('characteristics', `Low-roll points only apply when the rolled total is ${RULES.lowRollTotal} or less (yours is ${rolledTotal(c)}).`)
    else if (b.topUp.spent > b.topUp.total) err('characteristics', `At most ${b.topUp.total} points can be added to a low roll.`)
    for (const ch of CHARS)
      if ((c.topUp[ch] ?? 0) > 0 && charBase(c, ch) > RULES.topUpMax) err('characteristics', `Low-roll points can't raise ${CHAR_NAMES[ch]} above ${RULES.topUpMax}.`)
  }
  for (const ch of CHARS) {
    const r = charRange(ch)
    const base = c.chars[ch]
    if (c.options.charMethod === 'roll' && (base < r.min || base > r.max))
      err('characteristics', `${CHAR_NAMES[ch]} ${base} is outside the possible roll (${r.min}–${r.max}).`)
    if (charUncapped(c, ch) > RULES.speciesMax)
      warn('characteristics', `${CHAR_NAMES[ch]} would be ${charUncapped(c, ch)}; points above the human maximum of ${RULES.speciesMax} are ignored.`)
  }
  if (c.runeCharToCha.primary && c.runeCharToCha.secondary)
    err('characteristics', 'CHA can only take one of the two rune modifiers.')
  const aging = agingRequired(c)
  const lost = (['str', 'con', 'dex'] as const).reduce((t, ch) => t + (c.agingLoss[ch] ?? 0), 0)
  if (lost !== aging)
    (lost < aging ? err : warn)('characteristics', `At age ${c.age}, take ${aging} point${aging === 1 ? '' : 's'} off STR, CON, or DEX for aging (you have ${lost}).`)
  if (c.options.charMethod === 'assign') {
    const left = remaining(b.assign)
    if (left < 0) err('characteristics', `Characteristic points overspent by ${-left}.`)
    else if (left > 0) warn('characteristics', `${left} characteristic points unassigned.`)
    for (const ch of CHARS) {
      if (c.chars[ch] < charRange(ch).min) err('characteristics', `${CHAR_NAMES[ch]} can't be below ${charRange(ch).min}.`)
      if (c.chars[ch] > charRange(ch).max) err('characteristics', `${CHAR_NAMES[ch]} can't start above ${charRange(ch).max}.`)
    }
  }

  // Passions
  for (const p of c.passions) {
    if (!p.target.trim() && p.kind !== 'Honor') warn('passions', `${p.kind}: name who or what it's for.`)
    if (p.value > 100) err('passions', `${p.kind}${p.target ? ` (${p.target})` : ''} is over 100%; no passion can start above 100%.`)
  }

  // A pick must still be one of its choice's options (homeland or cult may have changed since).
  const checkPicks = (step: StepId, grants: SkillGrant[], picks: Record<number, string>) => grants.forEach((g, i) => {
    if (!('choose' in g)) return
    const pick = picks[i]
    if (!pick) warn(step, `Pick a skill for the +${g.bonus}% ${g.label ?? 'choice'}.`)
    else if (!skillChoices(c, g.choose).some(o => o.key === pick))
      err(step, `${skillName(c, pick)} isn't a valid ${g.label ?? 'choice'} any more. Pick again.`)
  })
  if (home) checkPicks('homeland', home.skills, c.homelandPicks)
  const region = regionOf(c)
  if (c.region && !region) err('homeland', 'Your tribe or region no longer matches your homeland. Pick it again.')
  if (region) checkPicks('homeland', region.skills ?? [], c.regionPicks)

  // Occupation
  const occ = occupationOf(c)
  if (!occ) err('occupation', 'Choose an occupation.')
  else {
    checkPicks('occupation', occ.skills, c.occupationPicks)
  }

  // Cult
  const cult = cultOf(c)
  if (!cult) err('cult', 'Choose a cult to be initiated into.')
  else {
    const left = remaining(b.cultPicks)
    if (left > 0) warn('cult', `${left} cult skill bonus${left > 1 ? 'es' : ''} not assigned.`)
    checkPicks('cult', cult.starting ?? [], c.cultStartPicks)
    const keys = cult.starting ? cultStartingKeys(c) : skillChoices(c, cult.skills).map(o => o.key)
    for (const k of c.cultPicks) if (k && !keys.includes(k)) err('cult', `${skillName(c, k)} isn't one of the ${cult.name} starting skills.`)
    if (new Set(c.cultPicks.filter(Boolean)).size !== c.cultPicks.filter(Boolean).length)
      err('cult', 'Each cult skill bonus must go to a different skill.')
    const cultRunes = cult.runes.map(r => runeValue(c, r))
    if (c.runes.primary && Math.max(...cultRunes) < RULES.cultRuneMin)
      err('cult', `Joining ${cult.name} needs one of its runes (${cult.runes.map(r => RUNE_NAMES[r]).join(', ')}) at ${RULES.cultRuneMin}% or more.`)
    if (c.powSacrifice < 0) err('cult', "POW sacrificed can't be negative.")
    if (home && !home.cults.includes(cult.id)) warn('cult', `${cult.name} is uncommon in ${home.name}. Check with your GM.`)
  }

  // Skills
  const p25 = c.personal25.filter(Boolean), p10 = c.personal10.filter(Boolean)
  if (p25.length < RULES.personalBig.count) warn('skills', `${RULES.personalBig.count - p25.length} personal +${RULES.personalBig.bonus}% bonus${RULES.personalBig.count - p25.length > 1 ? 'es' : ''} not assigned.`)
  if (p10.length < RULES.personalSmall.count) warn('skills', `${RULES.personalSmall.count - p10.length} personal +${RULES.personalSmall.bonus}% bonus${RULES.personalSmall.count - p10.length > 1 ? 'es' : ''} not assigned.`)
  if (new Set(p25).size !== p25.length) err('skills', `Each +${RULES.personalBig.bonus}% bonus must go to a different skill.`)
  if (new Set(p10).size !== p10.length) err('skills', `Each +${RULES.personalSmall.bonus}% bonus must go to a different skill.`)
  for (const l of skillLines(c)) {
    if (l.capped) warn('skills', `${l.name} is capped at ${RULES.maxStartingSkill}%; bonuses above that are lost.`)
    if (l.personal > 0 && l.total - l.personal >= RULES.maxStartingSkill)
      err('skills', `${l.name} is already ${RULES.maxStartingSkill}% before personal bonuses; put them on another skill.`)
  }
  const older = b.olderPicks
  if (older.total > 0) {
    if (older.spent < older.total) warn('skills', `Older adventurer: ${older.total - older.spent} more +${RULES.olderSkillBonus}% occupation or cult skill bonus(es) to assign.`)
    if (older.spent > older.total) err('skills', `Older adventurer: only ${older.total} +${RULES.olderSkillBonus}% bonuses at age ${c.age}.`)
    const allowed = new Set([...occupationGrants(c), ...cultGrants(c)].map(g => g.key))
    for (const k of c.olderPicks) if (k && !allowed.has(k)) err('skills', `Older-adventurer bonuses go to occupation or cult skills; ${skillName(c, k)} isn't one.`)
  } else if (c.olderPicks.some(Boolean)) err('skills', `Older-adventurer bonuses need an age of ${RULES.startingAge + 10} or more.`)

  // Magic
  if (cult) {
    const sp = b.spiritMagic
    if (sp.spent > sp.total) err('magic', `Spirit magic: ${sp.spent} points known, ${sp.total} granted.`)
    const cha = charValue(c, 'cha')
    if (sp.spent > cha) err('magic', `Spirit magic: ${sp.spent} points known, but CHA ${cha} limits you to ${cha}.`)
    const allowed = availableSpiritSpells(c)
    for (const s of c.spiritMagic) {
      const def = spiritSpellById(s.id)
      if (!def) continue
      if (cult.prohibitedSpirit?.includes(def.id)) err('magic', `${cult.name} forbids ${def.name}.`)
      else if (!allowed.has(def.id))
        warn('magic', `${def.name} isn't taught by ${cult.name} or its associated cults${occ?.spiritMagic ? ' (fine if it comes from your occupation)' : ''}.`)
    }
    if (b.runeSpells.spent > b.runeSpells.total) err('magic', `You chose ${b.runeSpells.spent} special Rune spells; you may start with ${b.runeSpells.total}.`)
    else if (b.runeSpells.spent < b.runeSpells.total) warn('magic', `Choose ${b.runeSpells.total - b.runeSpells.spent} more special Rune spell(s).`)
    for (const id of c.runeSpells) {
      const def = runeSpellById(id)
      if (def?.common) err('magic', `${def.name} is common Rune magic; you already know it.`)
      else if (def && !cult.runeSpells.includes(id)) err('magic', `${def.name} isn't a ${cult.name} special Rune spell.`)
    }
  } else if (c.spiritMagic.length || c.runeSpells.length) warn('magic', 'Magic is chosen from your cult. Pick a cult first.')

  // Sorcery
  const sorc = c.sorcery
  const int = charValue(c, 'int')
  if (sorc.spells.length || sorc.cultSpells.length || sorc.runes.length || sorc.techniques.length) {
    if (int < SORCERY_RULES.minIntForSorcery) err('magic', `Sorcery needs INT ${SORCERY_RULES.minIntForSorcery} or more (yours is ${int}).`)
    if (!isPhilosopher(c) && (sorc.spells.length || sorc.runes.length || sorc.techniques.length))
      err('magic', 'Only Philosophers start with occupation sorcery.')
    if (sorc.cultSpells.length && !sorceryCultOf(c)) err('magic', `${cult?.name ?? 'Your cult'} doesn't teach sorcery spells at creation.`)
    if (sorc.cultSpells.length > SORCERY_RULES.cultSpellsMax) err('magic', `At most ${SORCERY_RULES.cultSpellsMax} cult sorcery spells.`)
    if (sorc.cultSpells.length && c.spiritMagic.length) err('magic', 'Cult sorcery is taken instead of cult spirit magic; remove your spirit spells or your sorcery.')
    const m = sorceryMasteries(c)
    if (m.runes.length + m.techniques.length > maxMasteries(int))
      err('magic', `INT ${int} allows ${maxMasteries(int)} Runes and techniques mastered; you have ${m.runes.length + m.techniques.length}.`)
    const memorized = sorceryLines(c).length
    const spiritPts = knownSpirit(c).reduce((t, s) => t + s.points, 0)
    if (memorized + spiritPts > int) err('magic', `Memorized sorcery spells (${memorized}) plus spirit magic points (${spiritPts}) can't exceed INT ${int}.`)
  }
  if (isPhilosopher(c)) {
    if (sorc.runes.length !== SORCERY_RULES.philosopherRunesMastered || sorc.techniques.length !== SORCERY_RULES.philosopherTechniquesMastered)
      warn('magic', `Philosophers master ${SORCERY_RULES.philosopherRunesMastered} Rune and ${SORCERY_RULES.philosopherTechniquesMastered} technique.`)
    if (sorc.spells.length !== SORCERY_RULES.philosopherSpellsKnown) warn('magic', `Philosophers start with ${SORCERY_RULES.philosopherSpellsKnown} sorcery spells.`)
  }

  // Equipment
  const silver = remaining(b.silver)
  if (silver < 0) err('equipment', `Equipment costs ${-silver} L more than you have.`)

  return out
}
