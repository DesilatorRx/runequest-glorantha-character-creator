// Core domain types for the adventurer model and the rules data it references.

import type { TableOptions } from './rules'

export type CharId = 'str' | 'con' | 'siz' | 'dex' | 'int' | 'pow' | 'cha'
export const CHARS: CharId[] = ['str', 'con', 'siz', 'dex', 'int', 'pow', 'cha']

export type ElementalRune = 'darkness' | 'water' | 'earth' | 'fire' | 'air' | 'moon'
export const ELEMENTAL_RUNES: ElementalRune[] = ['darkness', 'water', 'earth', 'fire', 'air', 'moon']

export type PowerRune =
  | 'man' | 'beast' | 'fertility' | 'death' | 'harmony' | 'disorder' | 'truth' | 'illusion' | 'stasis' | 'movement'
/** Opposed Power/Form rune pairs; each pair always totals 100%. */
export const POWER_PAIRS: [PowerRune, PowerRune][] = [
  ['man', 'beast'], ['fertility', 'death'], ['harmony', 'disorder'], ['truth', 'illusion'], ['stasis', 'movement'],
]
export type RuneId = ElementalRune | PowerRune

/** Skill categories. Weapons and shields take the Manipulation modifier. */
export type SkillCategory =
  | 'agility' | 'communication' | 'knowledge' | 'magic' | 'manipulation' | 'perception' | 'stealth'
  | 'melee' | 'missile' | 'shield'

// ---------------------------------------------------------------------------
// Rules data

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  /** Base chance in percent, or a characteristic multiple (Dodge = DEX × 2). */
  base: number | { char: CharId; mult: number }
  /** Base for a subject other than your own culture (Customs, Homeland Lore: 00%). */
  baseOther?: number
  /** Needs a subject, shown as "Lore (Animal)"; several instances may exist. */
  specify?: string
}

/**
 * A skill reference: a skill id, optionally with a subject after a colon, e.g. "lore:Glorantha".
 * A "{homeland}" subject is filled in from the homeland's own language / customs.
 */
export type SkillKey = string

/** One skill bonus granted by a homeland, occupation or cult. */
export type SkillGrant =
  | { skill: SkillKey; bonus: number }
  /** The player picks one skill: from a list, any weapon, a homeland cultural weapon, any shield, a cult skill, or anything. */
  | { choose: SkillChoiceFrom; bonus: number; label?: string }
export type SkillChoiceFrom =
  | SkillKey[] | 'weapon' | 'melee' | 'missile' | 'cultural_weapon' | 'cultural_melee' | 'cultural_missile' | 'shield' | 'cult' | 'any'
  /** A skill with a subject the player names, e.g. Lore (any) or Read/Write (any). */
  | SubjectChoice
export interface SubjectChoice { subject: string }

export interface PassionDef { kind: PassionKind; target: string; value: number }
/** A passion an occupation or cult lets you pick: new at 60%, or +10% if already held. */
export interface PassionOption { kind: PassionKind; target: string }
export type PassionKind = 'Devotion' | 'Fear' | 'Hate' | 'Honor' | 'Love' | 'Loyalty'

export interface Homeland {
  id: string
  name: string
  /** Tribe, people, or culture for "{homeland}" skill subjects. */
  culture: string
  language: string
  rune: RuneId
  skills: SkillGrant[]
  /** Weapons commonly used here; occupations' "cultural weapon" picks come from these. */
  culturalWeapons: string[]
  passions: PassionDef[]
  cults: string[]
  occupations: string[]
  /** The place named in Homeland Lore (e.g. 'Prax' for every Praxian tribe); defaults to the homeland name. */
  place?: string
  /** Defaults to 'wiki' (Chaosium's RuneQuest wiki). */
  source?: DataSource
  /** Homeland characteristic modifiers (book p.53), e.g. Bison Riders +2 SIZ, −2 DEX. */
  charMods?: Partial<Record<CharId, number>>
  /** Tribes, cities, or regions within the homeland with their own local modifiers (book Homelands chapter). */
  regions?: HomelandRegion[]
  hint?: string
}

export interface HomelandRegion {
  id: string
  name: string
  skills?: SkillGrant[]
  /** Passions gained or raised: a new one starts at `value`; one already held is raised by `bonus` instead. */
  passions?: { kind: PassionKind; target: string; value?: number; bonus?: number }[]
  /** Rune modifier: adds to a rune, or replaces the homeland's own rune bonus (e.g. Fire/Sky instead of Air). */
  rune?: { rune: RuneId; bonus: number; replacesHomeland?: boolean }
  /** Anything that can't be applied automatically, in our own words. */
  note?: string
}

/** Where a data entry's numbers come from, so unverified entries can be flagged in the UI. */
/** 'book': checked against the core rulebook. 'wiki': Chaosium's RuneQuest wiki or Q&A. 'community': a fan transcription. 'unverified': from memory. */
export type DataSource = 'book' | 'wiki' | 'community' | 'unverified' | 'homebrew'

export type StandardOfLiving = 'destitute' | 'poor' | 'free' | 'noble' | 'petty_king'

export interface Occupation {
  id: string
  name: string
  skills: SkillGrant[]
  standard: StandardOfLiving
  /** Spendable starting wealth in Lunars (coin plus goods); `wealthNote` describes it. */
  wealth: number
  wealthNote?: string
  /** Yearly income in Lunars and ransom, display only. */
  income?: string
  ransom?: number
  passions: PassionOption[]
  /** Added to starting Reputation. */
  reputation?: number
  cults: string[]
  /** Extra spirit magic points granted on top of the cult's (assistant shamans). */
  spiritMagic?: number
  source: DataSource
  hint?: string
}

export interface Cult {
  id: string
  name: string
  /** God worshipped, for Worship and Cult Lore; defaults to the cult name. */
  deity?: string
  runes: RuneId[]
  /** Skills the cult teaches; initiation bonuses must go to these. */
  skills: SkillKey[]
  spiritSpells: string[]
  runeSpells: string[]
  /** Bonuses as the cult entry lists them; shown as a suggestion for the +20% / +15% picks. */
  suggested?: { skill: SkillKey; bonus: number }[]
  /** Cult Starting Skills (book p.73): fixed bonuses every initiate gets; the +20% / +15% picks go to these skills. */
  starting?: SkillGrant[]
  /** Spirit spells the cult forbids its members. */
  prohibitedSpirit?: string[]
  /** Spirit magic every initiate gets free, outside the 5 points (e.g. Ernalda's Ignite). */
  freeSpirit?: LearnedSpirit[]
  /** Spirit spells cost double except these (Seven Mothers). */
  doubleSpiritExcept?: string[]
  /** The cult teaches sorcery: an initiate may take up to three sorcery spells instead of spirit magic (book p.73). */
  sorcery?: boolean
  /** Associated cults (book cult entries); their spirit magic may also be learned at creation. */
  associated?: string[]
  /** Favored passions: take one at 60%, or +10% to one already held. */
  passions: PassionOption[]
  source: DataSource
  hint?: string
}

export interface SpiritSpell {
  id: string
  name: string
  /** Point cost; variable spells may be learned at any point value up to `max`. */
  cost: number
  variable?: boolean
  /** Cost confirmed by one source only. */
  likely?: boolean
}

export interface RuneSpell {
  id: string
  name: string
  cost: number
  /** Cost varies (e.g. by elemental size); `cost` is the minimum and `maxCost` the maximum. */
  variable?: boolean
  maxCost?: number
  stackable?: boolean
  /** Rune points spent casting it are not regained. */
  oneUse?: boolean
  /** Rune spells every cult offers. */
  common?: boolean
  /** Cost is a best guess. */
  guess?: boolean
}

export type GearCategory = 'melee' | 'missile' | 'shield' | 'armor' | 'gear'

export interface GearItem {
  id: string
  name: string
  category: GearCategory
  /** Price in Lunars (silver pieces). */
  cost: number
  enc: number
  /** Weapons: skill id used; damage; strike rank; hit points. */
  skill?: string
  damage?: string
  sr?: number
  hp?: number
  /** Missile weapons: range in meters. */
  range?: number
  /** Armor: armor points and the hit locations covered. */
  ap?: number
  covers?: Location[]
  /** Armor: penalty to Move Quietly (positive number to subtract). */
  mqPenalty?: number
  /** Where the book gives a price range, `cost` is the low end and this is the high end. */
  costMax?: number
  /** General equipment: sub-heading for grouping (Clothing, Tools, Riding Beasts...). */
  group?: string
}

export type Location = 'rleg' | 'lleg' | 'abdomen' | 'chest' | 'rarm' | 'larm' | 'head'
export const LOCATIONS: Location[] = ['rleg', 'lleg', 'abdomen', 'chest', 'rarm', 'larm', 'head']

// ---------------------------------------------------------------------------
// Adventurer

export interface Passion { uid: string; kind: PassionKind; target: string; value: number }
export interface OwnedGear {
  uid: string
  id: string
  qty: number
  /** Part of the occupation's starting kit: free, and replaced if the occupation changes. */
  kit?: boolean
  /** For a free starting weapon: the trained skill it was taken for (one weapon per skill). */
  kitSkill?: SkillKey
  /** Kept on a mount, in camp, or at home rather than carried: doesn't count toward ENC. */
  stowed?: boolean
}
export interface LearnedSpirit { id: string; points: number }

export interface Character {
  id: string
  schema: 1
  created: string
  updated: string
  name: string
  concept: string
  notes: string
  age: number
  options: TableOptions

  homeland: string
  /** Chosen skill for each choice grant of the homeland (e.g. Composite Bow or Sling). */
  homelandPicks: Record<number, SkillKey>
  /** Tribe, city, or region within the homeland whose local modifiers apply ('' for none). */
  region: string
  regionPicks: Record<number, SkillKey>

  /** Elemental rune affinities chosen as primary / secondary / tertiary. */
  runes: { primary: ElementalRune | ''; secondary: ElementalRune | ''; tertiary: ElementalRune | '' }
  /** The two Power/Form runes raised to 75% (their opposites drop to 25%). */
  powerPicks: PowerRune[]
  /** Free rune points added to any runes. */
  runeBonus: Partial<Record<RuneId, number>>

  /** Rolled or assigned characteristics, before rune modifiers. */
  chars: Record<CharId, number>
  /** Points added to a low roll (total of 92 or less). */
  topUp: Partial<Record<CharId, number>>
  /** Rune modifier goes to CHA instead of the rune's characteristic (allowed once, book p.53). */
  runeCharToCha: { primary?: boolean; secondary?: boolean }

  passions: Passion[]
  /** The one favored passion taken from the occupation and from the cult (so it can be swapped or undone). */
  favored: { occupation?: FavoredTaken; cult?: FavoredTaken }
  /** Reputation from family history and heirloom, on top of the clan base and occupation bonus. */
  reputation: number
  /** Skill bonuses from family history events or heirlooms (e.g. famous ancestor: Orate +5%). */
  historySkills: HistorySkill[]

  occupation: string
  /** Chosen skill for each choice grant of the occupation, by index into its `skills`. */
  occupationPicks: Record<number, SkillKey>
  /** GM-approved weapon swaps: a fixed homeland/region/occupation weapon bonus moved to another weapon, keyed 'homeland:3'. */
  swaps: Record<string, SkillKey>

  cult: string
  /** Chosen skill for each choice grant in the cult's starting skills. */
  cultStartPicks: Record<number, SkillKey>
  /** Skills receiving the +20% and +15% initiation bonuses (must be cult starting skills). */
  cultPicks: SkillKey[]
  /** POW sacrificed for extra Rune points (and one extra special Rune spell each). */
  powSacrifice: number

  personal25: SkillKey[]
  personal10: SkillKey[]
  /** Skill instances added by hand (another language, craft, lore). */
  extraSkills: SkillKey[]

  spiritMagic: LearnedSpirit[]
  /** Special Rune spells chosen (common Rune magic is known automatically). */
  runeSpells: string[]
  /** Sorcery: Runes and techniques mastered (Philosopher), occupation spells, and cult spells taken instead of spirit magic. */
  sorcery: { runes: string[]; techniques: string[]; spells: string[]; cultSpells: string[] }

  /** Older adventurers (book p.81): skills given +5% per decade over 21, and characteristic losses from age. */
  olderPicks: SkillKey[]
  agingLoss: Partial<Record<CharId, number>>

  gear: OwnedGear[]
  /** Either/or picks in the occupation's starting kit, by index. */
  kitPicks: Record<number, string>
  /** The occupation whose starting kit has been handed out (so it's added once, even to older saves). */
  kitFor?: string
  /** Step 8: other information. */
  info: OtherInfo
}

/** A favored passion taken at creation: a new passion (`new`) or +10% to one already held (`bonus`). */
export interface FavoredTaken { kind: PassionKind; target: string; uid: string; mode: 'new' | 'bonus'; delta?: number }

export interface HistorySkill { uid: string; key: SkillKey; bonus: number; note: string }

export interface OtherInfo {
  gender: string
  handedness: 'right' | 'left'
  /** D8 roll for the day of the week (1–7; 8 = roll again or pick). 0 when not rolled. */
  birthDay: number
  tribe: string
  clan: string
  father: string
  mother: string
  heirloom: string
  scars: string
}
