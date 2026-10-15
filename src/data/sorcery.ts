// Sorcery data: Runes and techniques a sorcerer can master, the sample sorcery
// spells, the creation-relevant numbers, and which cults/traditions teach sorcery.
// Source: RuneQuest: Roleplaying in Glorantha core rulebook, Sorcery chapter
// (printed pp.381-401), Philosopher occupation (p.70), Step 6 Cult (p.73),
// Lhankor Mhy (pp.76, 298). Names and numbers only; spell effects are not reproduced.
//
// Spell Runes/techniques were read from the Rune glyphs printed beside each
// spell heading. For every spell except Dominate (elemental) the printed
// minimum cost equals the number of Runes + techniques (1 MP each, p.386).

/** Runes a sorcerer can master (p.381-383). Includes the Magic Rune and the Form Runes. */
export type SorceryRuneId =
  | 'darkness' | 'water' | 'earth' | 'fire' | 'air' | 'moon'
  | 'movement' | 'stasis' | 'harmony' | 'disorder' | 'truth' | 'illusion' | 'fertility' | 'death'
  | 'spirit' | 'plant' | 'beast' | 'man' | 'chaos'
  | 'magic'

export type SorceryTechniqueId = 'command' | 'combine' | 'separate' | 'summon' | 'dispel' | 'tap'

export type SorceryRuneGroup = 'elemental' | 'power' | 'form' | 'condition'

export interface SorceryRune {
  id: SorceryRuneId
  name: string
  group: SorceryRuneGroup
  /** Elemental Runes: the two neighbours on Zzabur's Sigil, usable at double cost without mastery (p.382). */
  minor?: SorceryRuneId[]
  /** Power Runes: the opposed Rune, usable at double cost without mastery (p.382). */
  opposite?: SorceryRuneId
  /** Mastering it gives the sorcerer a Chaotic taint (p.383). */
  chaotic?: boolean
  /** Only Lunar sorcerers acknowledge it; spells using it follow the Lunar cycle (pp.382, 389). */
  lunarOnly?: boolean
}

export const SORCERY_RUNES: SorceryRune[] = [
  // Elemental Runes (Zzabur's Sigil), p.382
  { id: 'darkness', name: 'Darkness', group: 'elemental', minor: ['earth', 'air'] },
  { id: 'water', name: 'Water', group: 'elemental', minor: ['air', 'fire'] },
  { id: 'earth', name: 'Earth', group: 'elemental', minor: ['darkness', 'fire'] },
  { id: 'fire', name: 'Fire/Sky', group: 'elemental', minor: ['water', 'earth'] },
  { id: 'air', name: 'Air', group: 'elemental', minor: ['water', 'darkness'] },
  { id: 'moon', name: 'Moon', group: 'elemental', minor: [], lunarOnly: true },
  // Power Runes, p.382
  { id: 'movement', name: 'Movement', group: 'power', opposite: 'stasis' },
  { id: 'stasis', name: 'Stasis', group: 'power', opposite: 'movement' },
  { id: 'harmony', name: 'Harmony', group: 'power', opposite: 'disorder' },
  { id: 'disorder', name: 'Disorder', group: 'power', opposite: 'harmony' },
  { id: 'truth', name: 'Truth', group: 'power', opposite: 'illusion' },
  { id: 'illusion', name: 'Illusion', group: 'power', opposite: 'truth' },
  { id: 'fertility', name: 'Fertility', group: 'power', opposite: 'death' },
  { id: 'death', name: 'Death', group: 'power', opposite: 'fertility' },
  // Form Runes (independent; no insight between them), p.383
  { id: 'spirit', name: 'Spirit', group: 'form' },
  { id: 'plant', name: 'Plant', group: 'form' },
  { id: 'beast', name: 'Beast', group: 'form' },
  { id: 'man', name: 'Man', group: 'form' },
  { id: 'chaos', name: 'Chaos', group: 'form', chaotic: true },
  // Condition Rune studied to master magic, p.382
  { id: 'magic', name: 'Magic', group: 'condition' },
]

export interface SorceryTechnique {
  id: SorceryTechniqueId
  name: string
  /** Paired technique usable at double cost without mastery (p.383). */
  opposite?: SorceryTechniqueId
  /** Command and Tap give insight into every other technique (double cost) (p.383-384). */
  insightIntoAll?: boolean
}

/** The six techniques (p.383-384). Any mastered technique also gives insight into Command and Tap. */
export const SORCERY_TECHNIQUES: SorceryTechnique[] = [
  { id: 'command', name: 'Command', insightIntoAll: true },
  { id: 'combine', name: 'Combine', opposite: 'separate' },
  { id: 'separate', name: 'Separate', opposite: 'combine' },
  { id: 'summon', name: 'Summon', opposite: 'dispel' },
  { id: 'dispel', name: 'Dispel', opposite: 'summon' },
  { id: 'tap', name: 'Tap', insightIntoAll: true },
]

export type SorceryRange = 'ranged' | 'touch' | 'self' | 'special'
export type SorceryDuration = 'temporal' | 'instant' | 'special'

export interface SorcerySpell {
  id: string
  name: string
  /** Fixed Runes shown with the spell heading. 'magic' means the spell works with any Rune (p.391). */
  runes: SorceryRuneId[]
  techniques: SorceryTechniqueId[]
  /** An extra Rune chosen per version of the spell, printed as "+ [..]" under the heading. */
  extraRune?: 'elemental' | 'any' | 'one_or_more'
  /** Printed minimum cost (magic points, or POW for the binding rituals). */
  cost: number
  costUnit: 'mp' | 'pow'
  /** Casting range; absent for ritual-only spells that print no range. */
  range?: SorceryRange
  activity?: 'active' | 'passive'
  duration?: SorceryDuration
  ritual?: boolean
  enchantment?: boolean
  /** Printed page number. */
  page: number
  note?: string
}

type Opt = Partial<Pick<SorcerySpell, 'extraRune' | 'costUnit' | 'range' | 'activity' | 'duration' | 'ritual' | 'enchantment' | 'note'>>

function sp(
  id: string, name: string, runes: SorceryRuneId[], techniques: SorceryTechniqueId[],
  cost: number, page: number, opt: Opt = {},
): SorcerySpell {
  return { id, name, runes, techniques, cost, costUnit: 'mp', page, ...opt }
}

const RPT: Opt = { range: 'ranged', activity: 'passive', duration: 'temporal' }
const RAT: Opt = { range: 'ranged', activity: 'active', duration: 'temporal' }
const TPT: Opt = { range: 'touch', activity: 'passive', duration: 'temporal' }
const BIND: Opt = { costUnit: 'pow', ritual: true, enchantment: true }

/** Every sample sorcery spell in the core rulebook (pp.391-401): 58 spells. */
export const SORCERY_SPELLS: SorcerySpell[] = [
  sp('accelerate_healing', 'Accelerate Healing', ['fertility'], ['command'], 2, 391, RPT),
  sp('animate_dead', 'Animate Dead', ['death', 'fertility'], ['combine', 'command'], 4, 391, RAT),
  sp('attract_magic', 'Attract Magic', ['magic'], ['command'], 2, 391, RPT),
  sp('attract_missiles', 'Attract Missiles', ['air', 'movement'], ['combine', 'command'], 4, 391, RAT),
  sp('attract_spirits', 'Attract Spirits', ['spirit'], ['command'], 2, 391, RAT),
  sp('bind_elemental', 'Bind Elemental', ['spirit'], ['command'], 3, 391, { ...BIND, extraRune: 'elemental' }),
  sp('bind_spirit', 'Bind Spirit', ['spirit'], ['command'], 2, 391, BIND),
  sp('boon_of_kargan_tor', 'Boon of Kargan Tor', ['death'], ['summon'], 2, 392, TPT),
  sp('call_cold', 'Call Cold', ['darkness'], ['summon'], 2, 392, RPT),
  sp('call_light', 'Call Light', ['fire'], ['summon'], 2, 392, RPT),
  sp('calm_water', 'Calm Water', ['water', 'harmony'], ['combine'], 3, 392, RAT),
  sp('castback', 'Castback', ['magic', 'stasis'], ['combine', 'command'], 4, 392, RPT),
  sp('conflagration', 'Conflagration', ['fire'], ['summon'], 2, 392, RAT),
  sp('create_hallucination', 'Create Hallucination', ['illusion'], ['combine'], 2, 392, RAT),
  sp('create_image', 'Create Image', ['illusion', 'fire'], ['combine'], 3, 392, RAT),
  sp('create_odor', 'Create Odor', ['illusion', 'air'], ['combine'], 3, 393, RAT),
  sp('create_sensation', 'Create Sensation', ['illusion', 'earth'], ['combine'], 3, 393, RAT),
  sp('create_sound', 'Create Sound', ['illusion', 'darkness'], ['combine'], 3, 393, { ...RAT, note: 'Active only for complex sounds' }),
  sp('create_taste', 'Create Taste', ['illusion', 'water'], ['combine'], 3, 393, RAT),
  sp('create_wall_of_flames', 'Create Wall of Flames', ['fire'], ['summon'], 2, 394, RAT),
  sp('dampen_damage', 'Dampen Damage', ['death'], ['dispel'], 2, 394, RAT),
  sp('disappear', 'Disappear', ['illusion', 'fire'], ['combine', 'command'], 4, 394, RAT),
  sp('dominate_humanoid', 'Dominate (Humanoid)', ['man'], ['command'], 2, 394, { ...RAT, note: 'One spell per humanoid species' }),
  sp('dominate_animal', 'Dominate (Animal)', ['beast'], ['command'], 2, 394, { ...RAT, note: 'One spell per animal species' }),
  sp('dominate_discorporate_spirit', 'Dominate (Discorporate Spirit)', ['spirit'], ['command'], 2, 394, { ...RAT, note: 'One spell per spirit type' }),
  sp('dominate_elemental', 'Dominate (Elemental)', ['spirit'], ['command'], 2, 395, { ...RAT, extraRune: 'elemental', note: 'One spell per elemental type' }),
  sp('drain_soul', 'Drain Soul', ['magic'], ['dispel'], 2, 395, { range: 'ranged', duration: 'instant' }),
  sp('enhance_int', 'Enhance INT', ['fire'], ['summon'], 2, 395, TPT),
  sp('finger_of_fire', 'Finger of Fire', ['fire', 'movement'], ['combine'], 3, 395, RAT),
  sp('geomancy', 'Geomancy', ['truth', 'earth'], ['summon'], 3, 395, RAT),
  sp('hasten_vessel', 'Hasten Vessel', ['movement', 'water'], ['combine'], 3, 396, RAT),
  sp('identify_otherworld_entity', 'Identify Otherworld Entity', ['truth', 'spirit'], ['command'], 3, 396, RAT),
  sp('identify_spell', 'Identify Spell', ['truth', 'magic'], ['command'], 3, 396, { range: 'ranged', duration: 'instant' }),
  // The heading glyph shows Illusion; the worked example on p.386 calls it Truth + Dispel.
  sp('logical_clarity', 'Logical Clarity', ['illusion'], ['dispel'], 2, 396, { ...RPT, note: 'Example on p.386 lists Truth + Dispel' }),
  sp('logician', 'Logician', ['truth'], ['summon'], 2, 396, { range: 'self', activity: 'active', duration: 'temporal' }),
  sp('magic_point_enchantment', 'Magic Point Enchantment', ['magic'], ['command'], 2, 396, { ritual: true, enchantment: true, activity: 'passive' }),
  sp('mend_flesh', 'Mend Flesh', ['harmony', 'fertility'], ['combine'], 3, 396, { range: 'ranged', activity: 'passive', duration: 'instant' }),
  sp('moonfire', 'Moonfire', ['moon', 'fire'], ['combine', 'summon'], 4, 396, RAT),
  sp('move_across_water', 'Move Across Water', ['water', 'movement'], ['combine'], 3, 397, RAT),
  sp('neutralize_armor', 'Neutralize Armor', ['stasis'], ['dispel'], 2, 397, RPT),
  sp('neutralize_magic', 'Neutralize Magic', ['magic'], ['dispel'], 2, 397, RPT),
  sp('neutralize_rune', 'Neutralize (Rune)', [], ['dispel'], 2, 397, { ...RPT, extraRune: 'any', note: 'One spell per Rune' }),
  sp('neutralize_spirit_magic', 'Neutralize Spirit Magic', ['spirit'], ['dispel'], 2, 397, RPT),
  sp('open_seas', 'Open Seas', ['water'], ['command'], 2, 397, { ritual: true, activity: 'passive', duration: 'special' }),
  sp('pierce_veil', 'Pierce Veil', ['magic', 'truth'], ['combine'], 3, 397, RPT),
  sp('protective_circle', 'Protective Circle', ['magic'], ['command'], 2, 398, { range: 'special', activity: 'passive', duration: 'temporal' }),
  sp('preserve_item', 'Preserve Item', ['stasis'], ['command'], 2, 398, TPT),
  sp('reveal_rune', 'Reveal Rune', ['truth'], ['command'], 2, 398, RAT),
  sp('rogue_wave', 'Rogue Wave', ['water', 'disorder'], ['combine'], 3, 398, RAT),
  sp('solace_of_the_logical_mind', 'Solace of the Logical Mind', ['truth'], ['command'], 2, 398, RPT),
  sp('speak_to_mind', 'Speak to Mind', ['truth', 'man'], ['command'], 3, 398, RAT),
  sp('spirit_warding', 'Spirit Warding', ['spirit'], ['dispel'], 2, 398, RPT),
  sp('steal_breath', 'Steal Breath', ['air'], ['tap'], 2, 400, RAT),
  sp('stop_vessel', 'Stop Vessel', ['water', 'stasis'], ['combine'], 3, 400, RAT),
  sp('summon_species', 'Summon (Species)', [], ['command', 'summon'], 3, 400, { ritual: true, activity: 'active', duration: 'temporal', extraRune: 'one_or_more', note: 'One spell per species' }),
  sp('tap_body', 'Tap Body', ['man'], ['tap'], 2, 400, { range: 'touch', activity: 'active', duration: 'temporal' }),
  sp('total_recall', 'Total Recall', ['truth'], ['summon'], 2, 401, RPT),
  sp('ward_against_weapons', 'Ward Against Weapons', ['death'], ['dispel'], 2, 401, RPT),
]

/** Creation- and play-relevant sorcery numbers (paraphrased; page refs are printed pages). */
export const SORCERY_RULES = {
  /** Philosopher occupation: starts with one Rune and one technique mastered (p.70, p.384). */
  philosopherRunesMastered: 1,
  philosopherTechniquesMastered: 1,
  /** Philosopher occupation: starts knowing three sorcery spells, the three "(Sorcery spell)" occupational skill slots (p.70). */
  philosopherSpellsKnown: 3,
  /** Philosopher occupational bonuses to its three spells, in book order (p.70). */
  philosopherSpellBonuses: [10, 20, 10] as const,
  /** Cult sorcery: an initiate of a sorcery-teaching cult may take up to this many cult sorcery spells (p.73). */
  cultSpellsMax: 3,
  /** Cult sorcery replaces cult spirit magic entirely (normally 5 points) when chosen (p.73, p.76). */
  cultSorceryReplacesSpiritMagic: true,
  cultSpiritMagicPointsForgone: 5,
  /** Minimum INT to understand one Rune plus one technique (p.384). */
  minIntForSorcery: 13,
  /** Total Runes + techniques that can be mastered = INT - this (13 -> 2, 18 -> 7) (p.384). */
  masteryIntOffset: 11,
  /** Mastering a new Rune/technique in play: D100 vs INT+POW, then sacrifice this much POW; once per season (p.384). */
  masteryPowCost: 1,
  /** Each memorized sorcery spell and each point of spirit magic uses 1 point of INT; total cannot exceed INT (p.390). Free INT = INT - (memorized spells + spirit magic points) (p.384). */
  intPerMemorizedSpell: 1,
  intPerSpiritMagicPoint: 1,
  /** Each level of intensity above 1 also uses 1 point of Free INT while casting (p.385). */
  freeIntPerIntensityLevel: 1,
  /** Casting needs mastery of (or insight into) every Rune and technique in the spell; insight-only parts double the cost, both parts unmastered = x4 (p.386). */
  mpPerRuneOrTechnique: 1,
  unmasteredCostMultiplier: 2,
  /** Each extra intensity level costs 1 MP (2 if any component is unmastered) (p.384). */
  mpPerIntensityLevel: 1,
  /** Base parameters at intensity 1: range 10 m, duration 5 minutes, strength 1 (pp.385-386). */
  baseRangeMeters: 10,
  baseDurationMinutes: 5,
  baseStrength: 1,
  /** Each sorcery spell is its own skill rolled vs D100, modified by the Magic skills category modifier (p.386). No base chance is printed; treat as 0% + Magic modifier. */
  spellBaseChance: 0,
  /** A spell's % can never exceed the sorcerer's Read/Write skill (p.388). */
  cappedByReadWrite: true,
  /** A spell learned in play starts at 1D6 + Magic modifier; teaching costs ~50 L per common spell and a season (p.389-390). */
  learnedSpellStartDice: '1D6',
  learnCostLunars: 50,
  /** Casting takes one full round, then resolves on DEX SR of next round + 2 SR per extra MP (p.386). */
  extraStrikeRanksPerMp: 2,
  /** Failed cast costs 1 MP; critical costs only 1 MP (p.387). */
  failedCastMpCost: 1,
  /** One Rune point is worth 2 points of spirit magic or sorcery intensity when spells are compared (p.247). */
  sorceryPointsPerRunePoint: 2,
  /** Optional older start: +1 point of spirit magic/sorcery spells per 10 years over 21 (p.81). */
  extraSpellsPerDecadeOverAge21: 1,
  /** Sorcery has no Rune point cost; sorcerers still get the normal 3 cult Rune points as initiates (p.73). */
  initiateRunePoints: 3,
} as const

export interface SorceryCult {
  /** Matches Cult.id in cults.ts where the cult exists there. */
  id: string
  name: string
  /** Runes/techniques an initiate trained in sorcery starts with mastered. */
  startingRunes: SorceryRuneId[]
  startingTechniques: SorceryTechniqueId[]
  /** Sorcery spell ids the cult teaches; empty = not listed in the core book. */
  spells: string[]
  /** Skill bonuses applied to the chosen starting spells, one per spell. */
  spellBonuses?: number[]
  /** INT needed to begin training, where the book gives one. */
  minInt?: number
  page: number
  note?: string
}

/**
 * Cults and traditions the core book says teach sorcery. Only Lhankor Mhy has a
 * creation-ready list; the others are described only in outline on p.388-389.
 */
export const SORCERY_CULTS: SorceryCult[] = [
  {
    id: 'lhankor_mhy', name: 'Lhankor Mhy',
    startingRunes: ['truth'], startingTechniques: ['command'],
    // Full list from the cult entry (p.298); the creation summary on p.76 is cut off mid-list.
    spells: [
      'enhance_int', 'identify_otherworld_entity', 'geomancy', 'logical_clarity', 'logician',
      'reveal_rune', 'solace_of_the_logical_mind', 'speak_to_mind', 'total_recall',
    ],
    spellBonuses: [25, 10, 10],
    page: 76,
    note: 'Initiates only (p.389). Up to 5 pts cult spirit magic OR up to 3 cult sorcery spells (p.76). Spell list = the Torvald Fragments; temples vary (p.389).',
  },
  {
    id: 'malkioni_rokari', name: 'Malkioni (Rokari zzaburi)',
    startingRunes: ['spirit'], startingTechniques: ['command'],
    spells: [], minInt: 16, page: 389,
    note: 'Novitiate picks Spirit + one Elemental + one Power (or Magic) Rune, and Command + one other technique. Not a creation option in the core book.',
  },
  {
    id: 'aeolianism', name: 'Aeolianism (wizard caste)',
    startingRunes: [], startingTechniques: [],
    spells: [], minInt: 14, page: 389,
    note: 'Wizards pick two Runes and one technique. Listed as a Philosopher cult (p.70) but has no spell list.',
  },
  {
    id: 'lunar_sorcery', name: 'Lunar sorcery schools',
    startingRunes: [], startingTechniques: [],
    spells: [], page: 389,
    note: 'Typically Moon, Fire/Sky and Darkness; Power Runes and Chaos known. Moon-Rune spells follow the Lunar cycle cost changes.',
  },
]

/** Cult restrictions on sorcery found in cult entries. */
export const SORCERY_CULT_RESTRICTIONS: { cultId: string; page: number; noOffensiveSpells?: boolean; forbiddenTechniques?: SorceryTechniqueId[] }[] = [
  { cultId: 'chalana_arroy', page: 290, noOffensiveSpells: true, forbiddenTechniques: ['tap'] },
]

/** Cults the Philosopher occupation lists (p.70). Only Lhankor Mhy has a cult entry in the core book. */
export const PHILOSOPHER_CULTS = ['lhankor_mhy', 'seven_mothers', 'aeolianism', 'invisible_god'] as const

/** Max Runes + techniques mastered for an INT (0 if below the sorcery minimum). */
export function maxMasteries(int: number): number {
  return int < SORCERY_RULES.minIntForSorcery ? 0 : int - SORCERY_RULES.masteryIntOffset
}

/** Free INT left after memorized sorcery spells and spirit magic points. */
export function freeInt(int: number, memorizedSorcery: number, spiritMagicPoints: number): number {
  return int - memorizedSorcery * SORCERY_RULES.intPerMemorizedSpell - spiritMagicPoints * SORCERY_RULES.intPerSpiritMagicPoint
}
