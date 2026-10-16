// Tunable creation-rule constants. Change these (not the engine) when errata or table rules differ.
// Base ruleset: RuneQuest: Roleplaying in Glorantha (Chaosium, 2018), "Creating an Adventurer".
// Numbers were checked against Chaosium's free RuneQuest wiki (rqwiki.chaosium.com) and its official Q&A.
// Values marked "verify" have not yet been checked against the printed book.

import type { CharId, ElementalRune } from './types'

export const RULES = {
  /** Elemental rune affinities at creation. */
  primaryRune: 60,
  secondaryRune: 40,
  tertiaryRune: 20,
  /** Power/Form runes start at 50/50; two chosen runes go to this value, their opposites to 100 − it. */
  powerRuneStart: 50,
  powerRuneRaised: 75,
  powerRunePicks: 2,
  /** Free points added to any runes after the above. Verify against the book. */
  runeBonusPoints: 50,
  /** Rune caps: elemental runes, and paired runes (whose opposite can't go below 100 − cap). */
  maxElementalRune: 100,
  maxPairedRune: 99,
  /** Bonus to the homeland's rune. */
  homelandRuneBonus: 10,
  /** The highest elemental rune adds this to its characteristic, the second-highest the next. */
  primaryRuneCharBonus: 2,
  secondaryRuneCharBonus: 1,

  /** Human species maximum for a characteristic. */
  speciesMax: 21,
  /** Low rolls: if the rolled total is at or below this, add up to `topUpPoints`, none above `topUpMax`. */
  lowRollTotal: 92,
  topUpPoints: 3,
  topUpMax: 18,

  /** Personal skill bonuses: this many picks of each size (no skill twice in the same size). */
  personalBig: { count: 4, bonus: 25 },
  personalSmall: { count: 5, bonus: 10 },
  /** Starting skills above this are cut to it. */
  maxStartingSkill: 100,

  /** Cult initiation: one cult skill +20%, another +15%, plus fixed bonuses for every initiate. */
  cultSkillBonuses: [20, 15],
  cultFixedBonuses: [
    { skill: 'worship:{deity}', bonus: 20 },
    { skill: 'cult_lore:{deity}', bonus: 15 },
    { skill: 'meditate', bonus: 5 },
  ],
  /** An initiate needs at least one of the cult's runes at this value. */
  cultRuneMin: 50,
  /** Rune points an initiate starts with, and special Rune spells chosen (book p.73). Each POW sacrificed adds one of each. */
  startingRunePoints: 3,
  startingRuneSpells: 3,
  /** Spirit magic points granted by the cult; total known can't exceed CHA. */
  cultSpiritMagic: 5,

  /** New passions start here; taking one already held adds `passionRepeat`. */
  basePassion: 60,
  passionRepeat: 10,
  startingReputation: 5,

  startingAge: 21,
  /** Older adventurers, per 10 years over 21 (book p.81): +5% to four occupation or cult skills,
   *  +3 Rune points, +1 point of spirit magic; from age 40, −1 STR, CON or DEX per two years or part. */
  olderSkillPicks: 4,
  olderSkillBonus: 5,
  olderRunePoints: 3,
  olderSpiritMagic: 1,
  agingFromAge: 40,
}

/** Characteristic rolls: dice count, sides, and bonus. */
export const CHAR_DICE: Record<CharId, { n: number; bonus: number }> = {
  str: { n: 3, bonus: 0 },
  con: { n: 3, bonus: 0 },
  siz: { n: 2, bonus: 6 },
  dex: { n: 3, bonus: 0 },
  int: { n: 2, bonus: 6 },
  pow: { n: 3, bonus: 0 },
  cha: { n: 3, bonus: 0 },
}

/** The characteristic each elemental rune raises. */
export const RUNE_CHAR: Record<ElementalRune, CharId> = {
  darkness: 'siz',
  water: 'dex',
  earth: 'con',
  fire: 'int',
  air: 'str',
  moon: 'pow',
}

/** Rules that differ between tables; chosen per adventurer. */
export interface TableOptions {
  /** Roll 3D6/2D6+6 (book default) or distribute a fixed pool (house rule). */
  charMethod: 'roll' | 'assign'
  /** Total characteristic points for the assign method. */
  assignPoints: number
}

export const RQG_OPTIONS: TableOptions = {
  charMethod: 'roll',
  assignPoints: 92,
}

export type Rules = typeof RULES
