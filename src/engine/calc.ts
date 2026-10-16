import { CULTS, GEAR, HOMELANDS, OCCUPATIONS, RUNE_SPELLS, SKILLS, SPIRIT_SPELLS } from '../data'
import { OCCUPATION_KITS } from '../data/occupationGear'
import { SORCERY_CULTS, SORCERY_RULES, SORCERY_SPELLS } from '../data/sorcery'
import { CHAR_DICE, RULES, RUNE_CHAR } from './rules'
import type {
  Character, CharId, Cult, ElementalRune, GearItem, Homeland, LearnedSpirit, Location, Occupation, OwnedGear, Passion, PassionOption, PowerRune,
  RuneId, Skill, SkillCategory, SkillChoiceFrom, SkillGrant, SkillKey,
} from './types'
import { CHARS, ELEMENTAL_RUNES, POWER_PAIRS } from './types'

export const CHAR_NAMES: Record<CharId, string> = {
  str: 'STR', con: 'CON', siz: 'SIZ', dex: 'DEX', int: 'INT', pow: 'POW', cha: 'CHA',
}
export const CHAR_LONG: Record<CharId, string> = {
  str: 'Strength', con: 'Constitution', siz: 'Size', dex: 'Dexterity', int: 'Intelligence', pow: 'Power', cha: 'Charisma',
}
export const RUNE_NAMES: Record<RuneId, string> = {
  darkness: 'Darkness', water: 'Water', earth: 'Earth', fire: 'Fire/Sky', air: 'Air', moon: 'Moon',
  man: 'Man', beast: 'Beast', fertility: 'Fertility', death: 'Death', harmony: 'Harmony', disorder: 'Disorder',
  truth: 'Truth', illusion: 'Illusion', stasis: 'Stasis', movement: 'Movement',
}
export const CATEGORY_NAMES: Record<SkillCategory, string> = {
  agility: 'Agility', communication: 'Communication', knowledge: 'Knowledge', magic: 'Magic',
  manipulation: 'Manipulation', perception: 'Perception', stealth: 'Stealth',
  melee: 'Melee Weapons', missile: 'Missile Weapons', shield: 'Shields',
}
export const LOCATION_NAMES: Record<Location, string> = {
  rleg: 'Right leg', lleg: 'Left leg', abdomen: 'Abdomen', chest: 'Chest', rarm: 'Right arm', larm: 'Left arm', head: 'Head',
}
/** D20 hit-location ranges for humanoids. */
export const LOCATION_ROLLS: Record<Location, string> = {
  rleg: '01–04', lleg: '05–08', abdomen: '09–11', chest: '12', rarm: '13–15', larm: '16–18', head: '19–20',
}

// ---------------------------------------------------------------------------
// Lookups

const byId = <T extends { id: string }>(list: T[]) => new Map(list.map(x => [x.id, x]))
const SKILL_MAP = byId(SKILLS)
const HOMELAND_MAP = byId(HOMELANDS)
const OCCUPATION_MAP = byId(OCCUPATIONS)
const CULT_MAP = byId(CULTS)
const SPIRIT_MAP = byId(SPIRIT_SPELLS)
const RUNE_SPELL_MAP = byId(RUNE_SPELLS)
const GEAR_MAP = byId(GEAR)

export const skillById = (id: string): Skill | undefined => SKILL_MAP.get(id)
export const homelandOf = (c: Character): Homeland | undefined => HOMELAND_MAP.get(c.homeland)
export const occupationOf = (c: Character): Occupation | undefined => OCCUPATION_MAP.get(c.occupation)
export const cultOf = (c: Character): Cult | undefined => CULT_MAP.get(c.cult)
export const spiritSpellById = (id: string) => SPIRIT_MAP.get(id)
export const runeSpellById = (id: string) => RUNE_SPELL_MAP.get(id)
export const gearById = (id: string): GearItem | undefined => GEAR_MAP.get(id)
export const homelandById = (id: string) => HOMELAND_MAP.get(id)
export const occupationById = (id: string) => OCCUPATION_MAP.get(id)
export const cultById = (id: string) => CULT_MAP.get(id)

export const WEAPON_CATEGORIES: SkillCategory[] = ['melee', 'missile', 'shield']
export const isWeaponSkill = (s: Skill) => WEAPON_CATEGORIES.includes(s.category)

// ---------------------------------------------------------------------------
// Skill keys: "id" or "id:Subject"

export function parseKey(key: SkillKey): { id: string; subject?: string } {
  const i = key.indexOf(':')
  return i < 0 ? { id: key } : { id: key.slice(0, i), subject: key.slice(i + 1) }
}

/** Replace "{homeland}" / "{language}" placeholders with the adventurer's homeland culture and language. */
export function resolveKey(c: Character, key: SkillKey): SkillKey {
  const h = homelandOf(c)
  return key
    .replace('{homeland}', h?.culture ?? 'Homeland')
    .replace('{language}', h?.language ?? 'Own')
    .replace('{cult}', cultOf(c)?.name ?? 'Cult')
    .replace('{deity}', cultOf(c)?.deity ?? cultOf(c)?.name ?? 'Deity')
}

export function skillName(c: Character, key: SkillKey): string {
  const { id, subject } = parseKey(resolveKey(c, key))
  const s = skillById(id)
  if (!s) return key
  return subject ? `${s.name} (${subject})` : s.specify ? `${s.name} (${s.specify})` : s.name
}

// ---------------------------------------------------------------------------
// Runes and characteristics

const isElemental = (r: RuneId): r is ElementalRune => (ELEMENTAL_RUNES as RuneId[]).includes(r)
const pairOf = (r: PowerRune) => POWER_PAIRS.find(p => p.includes(r))!
export const opposite = (r: PowerRune): PowerRune => { const [a, z] = pairOf(r); return r === a ? z : a }

export function elementalRune(c: Character, r: ElementalRune): number {
  let v = 0
  if (c.runes.primary === r) v = RULES.primaryRune
  else if (c.runes.secondary === r) v = RULES.secondaryRune
  else if (c.runes.tertiary === r) v = RULES.tertiaryRune
  v += homelandRuneMod(c, r)
  return Math.min(RULES.maxElementalRune, v + (c.runeBonus[r] ?? 0))
}

/** Homeland rune bonus (+10%), adjusted by the adventurer's region: an extra bonus, or a replacement rune (book Homelands chapter). */
export function homelandRuneMod(c: Character, r: RuneId): number {
  const home = homelandOf(c)
  if (!home) return 0
  const reg = home.regions?.find(x => x.id === c.region)?.rune
  let v = 0
  if (home.rune === r && !reg?.replacesHomeland) v += RULES.homelandRuneBonus
  if (reg?.rune === r) v += reg.bonus
  return v
}

/** Power/Form rune before free points: 75 if chosen, 25 if its opposite was chosen, else 50. */
function powerRuneBase(c: Character, r: PowerRune): number {
  if (c.powerPicks.includes(r)) return RULES.powerRuneRaised
  if (c.powerPicks.includes(opposite(r))) return 100 - RULES.powerRuneRaised
  return RULES.powerRuneStart
}

export function powerRune(c: Character, r: PowerRune): number {
  const o = opposite(r)
  const shift = (x: PowerRune) => (c.runeBonus[x] ?? 0) + homelandRuneMod(c, x)
  const v = powerRuneBase(c, r) + shift(r) - shift(o)
  return Math.max(100 - RULES.maxPairedRune, Math.min(RULES.maxPairedRune, v))
}

export const runeValue = (c: Character, r: RuneId): number =>
  isElemental(r) ? elementalRune(c, r) : powerRune(c, r)

export const runeBonusSpent = (c: Character): number =>
  Object.values(c.runeBonus).reduce((s, v) => s + (v ?? 0), 0)

/** The two highest elemental runes, ties broken by affinity slot (book p.53 lets the player pick; the slot order is that pick). */
export function rankedElementals(c: Character): ElementalRune[] {
  const slotOrder = [c.runes.primary, c.runes.secondary, c.runes.tertiary]
  const rank = (r: ElementalRune) => { const i = slotOrder.indexOf(r); return i < 0 ? 9 : i }
  return ELEMENTAL_RUNES
    .filter(r => elementalRune(c, r) > 0)
    .sort((a, b) => elementalRune(c, b) - elementalRune(c, a) || rank(a) - rank(b))
}

/** Characteristics raised by the primary (+2) and secondary (+1) elemental runes: the rune's own, or CHA (book p.53). */
export function runeCharTargets(c: Character): { primary?: CharId; secondary?: CharId } {
  const [first, second] = rankedElementals(c)
  return {
    primary: first && (c.runeCharToCha.primary ? 'cha' : RUNE_CHAR[first]),
    secondary: second && (c.runeCharToCha.secondary ? 'cha' : RUNE_CHAR[second]),
  }
}

export function runeCharBonus(c: Character, ch: CharId): number {
  const t = runeCharTargets(c)
  return (t.primary === ch ? RULES.primaryRuneCharBonus : 0) + (t.secondary === ch ? RULES.secondaryRuneCharBonus : 0)
}

/** Rolled value plus any low-roll top-up, before rune modifiers. */
export const charBase = (c: Character, ch: CharId): number => c.chars[ch] + (c.topUp[ch] ?? 0)
export const rolledTotal = (c: Character) => CHARS.reduce((s, ch) => s + c.chars[ch], 0)
export const topUpSpent = (c: Character) => CHARS.reduce((s, ch) => s + (c.topUp[ch] ?? 0), 0)
export const topUpAllowed = (c: Character) => c.options.charMethod === 'roll' && rolledTotal(c) <= RULES.lowRollTotal

/** Decades over the default age of 21, for older adventurers (book p.81). */
export const extraDecades = (c: Character): number => Math.max(0, Math.floor((c.age - RULES.startingAge) / 10))

/** Characteristic before the species-maximum cap: rolls, rune and homeland modifiers, age, and POW sacrificed. */
export function charUncapped(c: Character, ch: CharId): number {
  const homeland = homelandOf(c)?.charMods?.[ch] ?? 0
  const sacrifice = ch === 'pow' ? c.powSacrifice : 0
  return charBase(c, ch) + runeCharBonus(c, ch) + homeland - (c.agingLoss[ch] ?? 0) - sacrifice
}

/** Final characteristic. Modifiers can't raise it above the species maximum; points above it are ignored (book p.52). */
export const charValue = (c: Character, ch: CharId): number =>
  Math.max(1, Math.min(RULES.speciesMax, charUncapped(c, ch)))

export const charRange = (ch: CharId) => {
  const d = CHAR_DICE[ch]
  return { min: d.n + d.bonus, max: d.n * 6 + d.bonus }
}

export function rollChar(ch: CharId, rand: () => number = Math.random): number {
  const d = CHAR_DICE[ch]
  let total = d.bonus
  for (let i = 0; i < d.n; i++) total += 1 + Math.floor(rand() * 6)
  return total
}

export const assignSpent = rolledTotal

// ---------------------------------------------------------------------------
// Skill category modifiers

/** Primary-characteristic modifier: 1–4 −10, 5–8 −5, 9–12 0, 13–16 +5, 17–20 +10, +5 per 4 above. */
function primaryMod(v: number): number {
  if (v <= 4) return -10
  if (v <= 8) return -5
  if (v <= 12) return 0
  return 5 * Math.ceil((v - 12) / 4)
}
/** Secondary-characteristic modifier: 1–4 −5, 5–16 0, 17–20 +5, +5 per 4 above. */
function secondaryMod(v: number): number {
  if (v <= 4) return -5
  if (v <= 16) return 0
  return 5 * Math.ceil((v - 16) / 4)
}

type ModPart = { ch: CharId; kind: 'primary' | 'secondary'; negative?: boolean }
const CATEGORY_PARTS: Record<'agility' | 'communication' | 'knowledge' | 'magic' | 'manipulation' | 'perception' | 'stealth', ModPart[]> = {
  agility: [{ ch: 'str', kind: 'secondary' }, { ch: 'siz', kind: 'secondary', negative: true }, { ch: 'dex', kind: 'primary' }, { ch: 'pow', kind: 'secondary' }],
  communication: [{ ch: 'int', kind: 'secondary' }, { ch: 'pow', kind: 'secondary' }, { ch: 'cha', kind: 'primary' }],
  knowledge: [{ ch: 'int', kind: 'primary' }, { ch: 'pow', kind: 'secondary' }],
  magic: [{ ch: 'pow', kind: 'primary' }, { ch: 'cha', kind: 'secondary' }],
  manipulation: [{ ch: 'str', kind: 'secondary' }, { ch: 'dex', kind: 'primary' }, { ch: 'int', kind: 'primary' }, { ch: 'pow', kind: 'secondary' }],
  perception: [{ ch: 'int', kind: 'primary' }, { ch: 'pow', kind: 'secondary' }],
  stealth: [{ ch: 'siz', kind: 'primary', negative: true }, { ch: 'dex', kind: 'primary' }, { ch: 'int', kind: 'primary' }, { ch: 'pow', kind: 'secondary', negative: true }],
}

/** Each characteristic's contribution to a skill category modifier (book pp.58–59). */
export function categoryModParts(c: Character, cat: SkillCategory): { ch: CharId; value: number; mod: number }[] {
  const base = cat === 'melee' || cat === 'missile' || cat === 'shield' ? 'manipulation' : cat
  return CATEGORY_PARTS[base].map(p => {
    const v = charValue(c, p.ch)
    const m = p.kind === 'primary' ? primaryMod(v) : secondaryMod(v)
    return { ch: p.ch, value: v, mod: p.negative ? -m : m }
  })
}

export function categoryMod(c: Character, cat: SkillCategory): number {
  return categoryModParts(c, cat).reduce((sum, p) => sum + p.mod, 0)
}

/** Hit point modifiers from SIZ and POW (book p.55). */
export function hpMods(c: Character): { siz: number; pow: number } {
  const siz = charValue(c, 'siz'), pow = charValue(c, 'pow')
  return {
    siz: siz <= 4 ? -2 : siz <= 8 ? -1 : siz <= 12 ? 0 : Math.ceil((siz - 12) / 4),
    pow: pow <= 4 ? -1 : pow <= 16 ? 0 : Math.ceil((pow - 16) / 4),
  }
}

export const BASE_CATEGORIES = ['agility', 'communication', 'knowledge', 'magic', 'manipulation', 'perception', 'stealth'] as const

// ---------------------------------------------------------------------------
// Skills

export interface SkillLine {
  key: SkillKey
  skill: Skill
  name: string
  base: number
  catMod: number
  homeland: number
  occupation: number
  cult: number
  /** Family history, heirloom, and older-adventurer bonuses. */
  history: number
  personal: number
  total: number
  /** True when the sum was cut to the starting maximum. */
  capped: boolean
}

export function skillBase(c: Character, s: Skill, key?: SkillKey): number {
  if (s.baseOther !== undefined && key) {
    const subject = parseKey(key).subject
    const own = homelandOf(c)?.culture
    if (subject && own && subject.toLowerCase() !== own.toLowerCase()) return s.baseOther
  }
  return typeof s.base === 'number' ? s.base : charValue(c, s.base.char) * s.base.mult
}

/** Expand grants into concrete (key, bonus) pairs using the adventurer's picks. */
function applyGrants(c: Character, grants: SkillGrant[], picks: Record<number, SkillKey>): { key: SkillKey; bonus: number }[] {
  const out: { key: SkillKey; bonus: number }[] = []
  grants.forEach((g, i) => {
    if ('skill' in g) out.push({ key: resolveKey(c, g.skill), bonus: g.bonus })
    else if (picks[i]) out.push({ key: resolveKey(c, picks[i]), bonus: g.bonus })
  })
  return out
}

export function homelandGrants(c: Character) {
  return applyGrants(c, homelandOf(c)?.skills ?? [], c.homelandPicks)
}
export function occupationGrants(c: Character) {
  return applyGrants(c, occupationOf(c)?.skills ?? [], c.occupationPicks)
}
export function regionOf(c: Character) {
  return homelandOf(c)?.regions?.find(r => r.id === c.region)
}
export function regionGrants(c: Character) {
  return applyGrants(c, regionOf(c)?.skills ?? [], c.regionPicks)
}

/** The cult's starting skills as concrete keys: fixed ones, plus the chosen option of each "X or Y". */
export function cultStartingKeys(c: Character): SkillKey[] {
  return applyGrants(c, cultOf(c)?.starting ?? [], c.cultStartPicks).map(g => g.key)
}

export function cultGrants(c: Character) {
  const cult = cultOf(c)
  if (!cult) return []
  return [
    ...RULES.cultFixedBonuses.map(g => ({ key: resolveKey(c, g.skill), bonus: g.bonus })),
    ...applyGrants(c, cult.starting ?? [], c.cultStartPicks),
    ...c.cultPicks.flatMap((k, i) => (k && RULES.cultSkillBonuses[i] ? [{ key: resolveKey(c, k), bonus: RULES.cultSkillBonuses[i] }] : [])),
  ]
}
export function historyGrants(c: Character) {
  return [
    ...c.historySkills.filter(h => h.key).map(h => ({ key: resolveKey(c, h.key), bonus: h.bonus })),
    ...c.olderPicks.filter(Boolean).map(k => ({ key: k, bonus: RULES.olderSkillBonus })),
  ]
}
export function personalGrants(c: Character) {
  return [
    ...c.personal25.filter(Boolean).map(k => ({ key: k, bonus: RULES.personalBig.bonus })),
    ...c.personal10.filter(Boolean).map(k => ({ key: k, bonus: RULES.personalSmall.bonus })),
  ]
}

/** Every skill on the sheet: all plain skills, plus subject skills that something touches. */
export function skillLines(c: Character): SkillLine[] {
  const h = [...homelandGrants(c), ...regionGrants(c)], o = occupationGrants(c), cu = cultGrants(c), hi = historyGrants(c), p = personalGrants(c)
  const keys = new Set<SkillKey>()
  for (const s of SKILLS) if (!s.specify && !isWeaponSkill(s)) keys.add(s.id)
  // Everyone speaks their own language and knows their own customs and homeland.
  for (const k of ['speak_own:{language}', 'customs:{homeland}', 'homeland_lore:{homeland}']) keys.add(resolveKey(c, k))
  for (const g of [...h, ...o, ...cu, ...hi, ...p]) keys.add(g.key)
  for (const k of c.extraSkills) keys.add(k)
  for (const g of c.gear) {
    const s = gearById(g.id)?.skill
    if (s) keys.add(s)
  }
  for (const w of homelandOf(c)?.culturalWeapons ?? []) keys.add(w)
  for (const s of SKILLS) if (s.id === 'fist' || s.id === 'grapple' || s.id === 'kick') keys.add(s.id)

  const sum = (list: { key: SkillKey; bonus: number }[], key: SkillKey) =>
    list.reduce((t, g) => (g.key === key ? t + g.bonus : t), 0)

  const lines: SkillLine[] = []
  for (const key of keys) {
    const { id } = parseKey(key)
    const skill = skillById(id)
    if (!skill) continue
    const base = skillBase(c, skill, key)
    const bonuses = { homeland: sum(h, key), occupation: sum(o, key), cult: sum(cu, key), history: sum(hi, key), personal: sum(p, key) }
    const anyBonus = Object.values(bonuses).some(v => v > 0)
    // A 00% skill doesn't get its category modifier until something raises it (book p.57).
    const catMod = base > 0 || anyBonus ? categoryMod(c, skill.category) : 0
    const line = { key, skill, name: skillName(c, key), base, catMod, ...bonuses }
    const raw = line.base + line.catMod + line.homeland + line.occupation + line.cult + line.history + line.personal
    lines.push({ ...line, total: Math.max(0, Math.min(RULES.maxStartingSkill, raw)), capped: raw > RULES.maxStartingSkill })
  }
  const order = (s: Skill) => Object.keys(CATEGORY_NAMES).indexOf(s.category)
  return lines.sort((a, b) => order(a.skill) - order(b.skill) || a.name.localeCompare(b.name))
}

export const skillTotal = (c: Character, key: SkillKey) => skillLines(c).find(l => l.key === key)?.total ?? 0

// ---------------------------------------------------------------------------
// Derived attributes

export function hitPoints(c: Character): number {
  const m = hpMods(c)
  return Math.max(1, charValue(c, 'con') + m.siz + m.pow)
}

/** Location hit points by total HP: 1–6, 7–9, 10–12, then +1 per 3 HP. */
export function locationHP(total: number): Record<Location, number> {
  const step = total <= 6 ? 0 : Math.ceil((total - 6) / 3)
  const legs = 2 + step, abdomen = 2 + step, chest = 3 + step, arms = 1 + step, head = 2 + step
  return { rleg: legs, lleg: legs, abdomen, chest, rarm: arms, larm: arms, head }
}

/** Damage bonus from STR+SIZ. */
export function damageBonus(c: Character): string {
  const v = charValue(c, 'str') + charValue(c, 'siz')
  if (v <= 12) return '−1D4'
  if (v <= 24) return '—'
  if (v <= 32) return '+1D4'
  if (v <= 40) return '+1D6'
  if (v <= 56) return '+2D6'
  return `+${2 + Math.ceil((v - 56) / 16)}D6`
}

/** Spirit combat damage from POW+CHA. */
export function spiritCombatDamage(c: Character): string {
  const v = charValue(c, 'pow') + charValue(c, 'cha')
  if (v <= 12) return '1D3'
  if (v <= 24) return '1D6'
  if (v <= 32) return '1D6+1'
  if (v <= 40) return '1D6+3'
  if (v <= 56) return '2D6+3'
  const extra = Math.ceil((v - 56) / 16)
  return `${2 + extra}D6+${3 + extra}`
}

export function healingRate(c: Character): number {
  return Math.max(1, Math.ceil(charValue(c, 'con') / 6))
}

export function dexSR(c: Character): number {
  const v = charValue(c, 'dex')
  return v <= 5 ? 5 : v <= 8 ? 4 : v <= 12 ? 3 : v <= 15 ? 2 : v <= 18 ? 1 : 0
}
export function sizSR(c: Character): number {
  const v = charValue(c, 'siz')
  return v <= 6 ? 3 : v <= 14 ? 2 : v <= 21 ? 1 : 0
}

/** Maximum ENC carried without penalty: the lower of STR and the average of STR and CON. */
export function maxEnc(c: Character): number {
  const str = charValue(c, 'str')
  return Math.min(str, Math.round((str + charValue(c, 'con')) / 2))
}

export function computeDerived(c: Character) {
  const hp = hitPoints(c)
  return {
    hp,
    locations: locationHP(hp),
    magicPoints: charValue(c, 'pow'),
    damageBonus: damageBonus(c),
    spiritDamage: spiritCombatDamage(c),
    healingRate: healingRate(c),
    dexSR: dexSR(c),
    sizSR: sizSR(c),
    maxEnc: maxEnc(c),
    move: Math.max(0, 8 - encOver(c)),
    runePoints: c.cult ? RULES.startingRunePoints + c.powSacrifice + RULES.olderRunePoints * extraDecades(c) : 0,
    reputation: RULES.startingReputation + (occupationOf(c)?.reputation ?? 0) + c.reputation,
  }
}

// ---------------------------------------------------------------------------
// Gear

export function armorByLocation(c: Character): Record<Location, number> {
  const out = { rleg: 0, lleg: 0, abdomen: 0, chest: 0, rarm: 0, larm: 0, head: 0 } as Record<Location, number>
  for (const g of c.gear) {
    const item = gearById(g.id)
    if (item?.category !== 'armor' || !item.ap) continue
    for (const loc of item.covers ?? []) out[loc] = Math.max(out[loc], item.ap)
  }
  return out
}

/** ENC of everything carried or worn (stowed items on a mount or at home don't count). Book p.150. */
export const encCarried = (c: Character) =>
  Math.round(c.gear.reduce((s, g) => s + (g.stowed ? 0 : (gearById(g.id)?.enc ?? 0) * g.qty), 0) * 100) / 100
export const encStowed = (c: Character) =>
  Math.round(c.gear.reduce((s, g) => s + (g.stowed ? (gearById(g.id)?.enc ?? 0) * g.qty : 0), 0) * 100) / 100
/** Points of ENC carried over the maximum (whole points; partial points round up). */
export const encOver = (c: Character) => Math.max(0, Math.ceil(encCarried(c) - maxEnc(c)))

const ENC_CATEGORIES: SkillCategory[] = ['agility', 'manipulation', 'stealth', 'melee', 'missile', 'shield']

/**
 * A skill as it works with the current load (book pp.150–151): each point over max ENC costs −5% to Agility,
 * Manipulation, Stealth, and weapon skills; Dodge also loses 1% per point of ENC carried up to the maximum.
 */
export function loadedSkill(c: Character, line: SkillLine): number {
  const over = encOver(c)
  let v = line.total
  if (ENC_CATEGORIES.includes(line.skill.category)) v -= 5 * over
  if (line.skill.id === 'dodge') v -= Math.floor(Math.min(encCarried(c), maxEnc(c)))
  return Math.max(0, v)
}

// ---------------------------------------------------------------------------
// Budgets

export interface Pool { total: number; spent: number }
export const remaining = (p: Pool) => p.total - p.spent

/** Spirit magic points counted against the starting allowance: free cult spells don't count, Seven Mothers pay double. */
export function spiritMagicPoints(c: Character): number {
  const cult = cultOf(c)
  return c.spiritMagic.reduce((s, x) => {
    const double = cult?.doubleSpiritExcept && !cult.doubleSpiritExcept.includes(x.id)
    return s + x.points * (double ? 2 : 1)
  }, 0)
}
/** All spirit magic known, including the cult's free spells. */
export function knownSpirit(c: Character): LearnedSpirit[] {
  const free = cultOf(c)?.freeSpirit ?? []
  return [...free.filter(f => !c.spiritMagic.some(s => s.id === f.id)), ...c.spiritMagic]
}

export function computeBudget(c: Character) {
  const occ = occupationOf(c)
  const choiceGrants = (occ?.skills ?? []).map((g, i) => ('choose' in g ? i : -1)).filter(i => i >= 0)
  const wealth = occ?.wealth ?? 0
  const spent = c.gear.reduce((s, g) => s + (g.kit ? 0 : (gearById(g.id)?.cost ?? 0) * g.qty), 0)
  return {
    powerPicks: { total: RULES.powerRunePicks, spent: c.powerPicks.length },
    runeBonus: { total: RULES.runeBonusPoints, spent: runeBonusSpent(c) },
    topUp: { total: topUpAllowed(c) ? RULES.topUpPoints : 0, spent: topUpSpent(c) },
    assign: { total: c.options.assignPoints, spent: assignSpent(c) },
    occupationPicks: { total: choiceGrants.length, spent: choiceGrants.filter(i => c.occupationPicks[i]).length },
    cultPicks: { total: c.cult ? RULES.cultSkillBonuses.length : 0, spent: c.cultPicks.filter(Boolean).length },
    olderPicks: { total: RULES.olderSkillPicks * extraDecades(c), spent: c.olderPicks.filter(Boolean).length },
    personal25: { total: RULES.personalBig.count, spent: c.personal25.filter(Boolean).length },
    personal10: { total: RULES.personalSmall.count, spent: c.personal10.filter(Boolean).length },
    spiritMagic: {
      total: c.cult ? (c.sorcery.cultSpells.length ? 0 : RULES.cultSpiritMagic) + (occ?.spiritMagic ?? 0) + RULES.olderSpiritMagic * extraDecades(c) : 0,
      spent: spiritMagicPoints(c),
    },
    runeSpells: { total: c.cult ? RULES.startingRuneSpells + c.powSacrifice : 0, spent: c.runeSpells.length },
    silver: { total: wealth, spent: Math.round(spent * 10) / 10 },
  }
}

// ---------------------------------------------------------------------------
// Skill pickers

/** Expand '@weapon' / '@cultural_weapon' tokens in a skill list; resolve placeholders in everything else. */
function expandToken(c: Character, key: SkillKey): SkillKey[] {
  if (key === '@weapon') return SKILLS.filter(isWeaponSkill).map(s => s.id)
  if (key === '@cultural_weapon') return homelandOf(c)?.culturalWeapons ?? []
  return [resolveKey(c, key)]
}

export interface SkillChoice { key: SkillKey; name: string; group: string }

/** Options for a skill choice: an explicit list, any weapon, a homeland cultural weapon, or (undefined) any skill. */
export function skillChoices(c: Character, from: SkillChoiceFrom = 'any'): SkillChoice[] {
  let keys: SkillKey[]
  if (from === 'weapon') keys = SKILLS.filter(isWeaponSkill).map(s => s.id)
  else if (from === 'cultural_weapon') keys = homelandOf(c)?.culturalWeapons ?? SKILLS.filter(isWeaponSkill).map(s => s.id)
  else if (from === 'cultural_melee' || from === 'cultural_missile') {
    const cat = from === 'cultural_melee' ? 'melee' : 'missile'
    keys = (homelandOf(c)?.culturalWeapons ?? SKILLS.filter(isWeaponSkill).map(s => s.id)).filter(k => skillById(k)?.category === cat)
  }
  else if (from === 'melee' || from === 'missile') keys = SKILLS.filter(s => s.category === from).map(s => s.id)
  else if (from === 'shield') keys = SKILLS.filter(s => s.category === 'shield').map(s => s.id)
  else if (from === 'cult') keys = (cultOf(c)?.skills ?? []).map(k => resolveKey(c, k))
  else if (from !== 'any') keys = from.flatMap(k => expandToken(c, k))
  else keys = [...new Set([...skillLines(c).map(l => l.key), ...SKILLS.filter(s => !s.specify).map(s => s.id)])]
  const out = keys.flatMap(key => {
    const s = skillById(parseKey(key).id)
    return s ? [{ key, name: skillName(c, key), group: CATEGORY_NAMES[s.category] }] : []
  })
  const order = Object.values(CATEGORY_NAMES)
  return out.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || a.name.localeCompare(b.name))
}

// ---------------------------------------------------------------------------
// Passions

/** Take a passion: new ones start at 60%, one already held gains +10%. */
export function takePassion(c: Character, p: PassionOption, newUid: string): Passion[] {
  const target = resolveKey(c, p.target)
  const has = c.passions.find(x => x.kind === p.kind && x.target.toLowerCase() === target.toLowerCase())
  if (has) return c.passions.map(x => (x === has ? { ...x, value: x.value + RULES.passionRepeat } : x))
  return [...c.passions, { uid: newUid, kind: p.kind, target, value: RULES.basePassion }]
}

// ---------------------------------------------------------------------------
// Magic availability

/** Spirit spells an initiate may start with: the cult's and its associated cults', minus any the cult forbids (book p.73). */
export function availableSpiritSpells(c: Character): Set<string> {
  const cult = cultOf(c)
  if (!cult) return new Set()
  const ids = new Set(cult.spiritSpells)
  for (const a of cult.associated ?? []) for (const id of cultById(a)?.spiritSpells ?? []) ids.add(id)
  for (const id of cult.prohibitedSpirit ?? []) ids.delete(id)
  return ids
}

export const commonRuneSpells = () => RUNE_SPELLS.filter(s => s.common)

// ---------------------------------------------------------------------------
// Step 8: birth date (book p.81)

const SEASON_OF: Partial<Record<ElementalRune, string>> = {
  water: 'Sea Season', fire: 'Fire Season', earth: 'Earth Season', darkness: 'Dark Season', air: 'Storm Season',
}
const POWER_WEEKS: PowerRune[] = ['disorder', 'harmony', 'death', 'fertility', 'stasis', 'movement', 'illusion', 'truth']
export const WEEKDAYS = ['Freezeday', 'Waterday', 'Clayday', 'Windsday', 'Fireday', 'Wildday', 'Godsday']

/** Season from the highest elemental rune (skipping Moon), week from the highest Power rune. */
export function birthDate(c: Character): { season?: string; week?: string; day?: string } {
  const season = rankedElementals(c).filter(r => r !== 'moon').map(r => SEASON_OF[r])[0]
  const week = [...POWER_WEEKS].sort((a, b) => powerRune(c, b) - powerRune(c, a))[0]
  const tie = POWER_WEEKS.filter(w => powerRune(c, w) === powerRune(c, week)).length > 1
  return {
    season,
    week: tie ? undefined : `${RUNE_NAMES[week]} Week`,
    day: c.info.birthDay >= 1 && c.info.birthDay <= 7 ? WEEKDAYS[c.info.birthDay - 1] : undefined,
  }
}

/**
 * Apply a region's passion modifiers. An existing passion gains `bonus` (or +10%); a missing one starts at `value` (60%).
 * A bonus for a named tribe or city renames the matching generic homeland passion, e.g. Loyalty (tribe) → Loyalty (Colymar Tribe).
 */
export function applyRegionPassions(c: Character, regionId: string, newUid: () => string): Passion[] {
  const region = homelandOf(c)?.regions?.find(r => r.id === regionId)
  let list = [...c.passions]
  for (const p of region?.passions ?? []) {
    const same = (x: Passion) => x.kind === p.kind && x.target.toLowerCase() === p.target.toLowerCase()
    const generic = list.find(x => x.kind === p.kind && ['tribe', 'city', 'clan'].includes(x.target.toLowerCase())
      && p.target.toLowerCase().includes(x.target.toLowerCase()))
    if (list.some(same)) list = list.map(x => (same(x) ? { ...x, value: x.value + (p.bonus ?? RULES.passionRepeat) } : x))
    else if (generic && p.bonus && p.value === undefined) list = list.map(x => (x === generic ? { ...x, target: p.target, value: x.value + p.bonus! } : x))
    else list.push({ uid: newUid(), kind: p.kind, target: p.target, value: p.value ?? RULES.basePassion })
  }
  return list
}

// ---------------------------------------------------------------------------
// Sorcery (book pp.381–402; Philosopher p.70; cult sorcery p.73)

export const isPhilosopher = (c: Character) => c.occupation === 'philosopher'
export const sorceryCultOf = (c: Character) => SORCERY_CULTS.find(s => s.id === c.cult && s.spells.length > 0)

/** Runes and techniques mastered: the Philosopher's picks plus what a sorcery-cult initiate starts with. */
export function sorceryMasteries(c: Character): { runes: string[]; techniques: string[] } {
  const cult = c.sorcery.cultSpells.length ? sorceryCultOf(c) : undefined
  return {
    runes: [...new Set([...(isPhilosopher(c) ? c.sorcery.runes : []), ...(cult?.startingRunes ?? [])])],
    techniques: [...new Set([...(isPhilosopher(c) ? c.sorcery.techniques : []), ...(cult?.startingTechniques ?? [])])],
  }
}

export interface SorceryLine { id: string; name: string; bonus: number; total: number; costMultiplier: number }

/** Known sorcery spells with their chance: Magic modifier + starting bonus, capped by Read/Write (p.388). */
export function sorceryLines(c: Character): SorceryLine[] {
  const occ = isPhilosopher(c) ? c.sorcery.spells : []
  const cultSpells = sorceryCultOf(c) ? c.sorcery.cultSpells : []
  const cultBonuses = sorceryCultOf(c)?.spellBonuses ?? []
  const m = sorceryMasteries(c)
  const readWrite = Math.max(0, ...skillLines(c).filter(l => l.skill.id === 'read_write').map(l => l.total))
  const mod = categoryMod(c, 'magic')
  const ids = [...new Set([...occ, ...cultSpells])]
  return ids.flatMap(id => {
    const spell = SORCERY_SPELLS.find(s => s.id === id)
    if (!spell) return []
    const bonus = (occ.indexOf(id) >= 0 ? SORCERY_RULES.philosopherSpellBonuses[occ.indexOf(id)] ?? 0 : 0)
      + (cultSpells.indexOf(id) >= 0 ? cultBonuses[cultSpells.indexOf(id)] ?? 0 : 0)
    const unRunes = spell.runes.filter(r => !m.runes.includes(r)).length
    const unTech = spell.techniques.filter(t => !m.techniques.includes(t)).length
    const costMultiplier = unRunes && unTech ? 4 : unRunes || unTech ? SORCERY_RULES.unmasteredCostMultiplier : 1
    const raw = Math.max(0, SORCERY_RULES.spellBaseChance + mod + bonus)
    return [{ id, name: spell.name, bonus, total: Math.min(raw, readWrite, RULES.maxStartingSkill), costMultiplier }]
  })
}

// ---------------------------------------------------------------------------
// Occupation starting kit (book pp.63–73): free gear that doesn't cost starting silver

export const occupationKit = (c: Character) => OCCUPATION_KITS[c.occupation]

/** The kit's catalog items as owned gear, marked free. Either/or choices use the picks made on the Equipment step. */
export function kitGear(occupation: string, picks: Record<number, string>, newUid: () => string): OwnedGear[] {
  const kit = OCCUPATION_KITS[occupation]
  if (!kit) return []
  const chosen = (kit.choices ?? []).flatMap((ch, i) => (picks[i] ?? ch.options[0] ?? '').split('+')).filter(Boolean)
  return [...kit.items.map(k => ({ id: k.id, qty: k.qty ?? 1 })), ...chosen.map(id => ({ id, qty: 1 }))]
    .filter(g => gearById(g.id))
    .map(g => ({ uid: newUid(), ...g, kit: true }))
}

/** Swap in a new occupation's kit: drop the old free items (kit gear and free weapons), keep anything bought. */
export function withKit(c: Character, occupation: string, newUid: () => string): Character {
  const bought = c.gear.filter(g => !g.kit)
  return { ...c, kitPicks: {}, kitFor: occupation, gear: [...kitGear(occupation, {}, newUid), ...bought] }
}

/**
 * Weapon skills that earn a free starting weapon: the book's "appropriate weapons" (the weapon skills the occupation
 * trains) or "cultural weapons" (the homeland's cultural weapons the adventurer trained, falling back to all of them).
 */
export function kitWeaponSkills(c: Character): SkillKey[] {
  const kit = occupationKit(c)
  if (!kit?.weapons || kit.weapons === 'none') return []
  const trained = occupationGrants(c).map(g => g.key).filter(k => { const s = skillById(parseKey(k).id); return s && isWeaponSkill(s) })
  if (kit.weapons === 'appropriate') return [...new Set(trained)]
  const cultural = homelandOf(c)?.culturalWeapons ?? []
  const both = trained.filter(k => cultural.includes(k))
  return both.length ? [...new Set(both)] : cultural
}

export const weaponsForSkill = (key: SkillKey): GearItem[] => GEAR.filter(g => g.skill === key)

// ---------------------------------------------------------------------------
// Favored passions (occupation p.63, cult p.74): take one, new at 60% or +10% to one already held

const samePassion = (a: { kind: string; target: string }, b: { kind: string; target: string }) =>
  a.kind === b.kind && a.target.toLowerCase() === b.target.toLowerCase()

/** Undo the favored passion taken for a slot: remove it if it was new, or take back its +10%. */
export function undoFavored(c: Character, slot: 'occupation' | 'cult'): Character {
  const t = c.favored[slot]
  if (!t) return c
  const passions = t.mode === 'new'
    ? c.passions.filter(p => p.uid !== t.uid)
    : c.passions.map(p => (p.uid === t.uid ? { ...p, value: p.value - (t.delta ?? RULES.passionRepeat) } : p))
  return { ...c, passions, favored: { ...c.favored, [slot]: undefined } }
}

/** Take a favored passion for a slot, replacing any earlier pick; picking the same one again undoes it. */
export function chooseFavored(c: Character, slot: 'occupation' | 'cult', option: PassionOption, newUid: () => string): Character {
  const target = resolveKey(c, option.target)
  const was = c.favored[slot]
  const cleared = undoFavored(c, slot)
  if (was && samePassion(was, { kind: option.kind, target })) return cleared
  const held = cleared.passions.find(p => samePassion(p, { kind: option.kind, target }))
  if (held) {
    const delta = Math.max(0, Math.min(100, held.value + RULES.passionRepeat) - held.value)
    return {
      ...cleared,
      passions: cleared.passions.map(p => (p === held ? { ...p, value: p.value + delta } : p)),
      favored: { ...cleared.favored, [slot]: { kind: option.kind, target, uid: held.uid, mode: 'bonus', delta } },
    }
  }
  const uid = newUid()
  return {
    ...cleared,
    passions: [...cleared.passions, { uid, kind: option.kind, target, value: RULES.basePassion }],
    favored: { ...cleared.favored, [slot]: { kind: option.kind, target, uid, mode: 'new' } },
  }
}
