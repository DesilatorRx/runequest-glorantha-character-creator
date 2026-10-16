import type { PassionKind, RuneId } from '../engine/types'

// Mapping from our rules data to the community Foundry VTT system "RuneQuest: Glorantha" (id 'rqg',
// github.com/sun-dragon-cult/fvtt-system-rqg). Names, rqids and numbers only, taken from the system's wiki
// module packs (skills, skills-weapons, equipment-weapons, runes, cults, hit-locations-humanoids, adventurers)
// and checked against the system's data models at v6.1.1 (Foundry VTT v14). Weapon `system` blocks are the pack
// items' system data with descriptions removed. Generated once by a throwaway script; edit by hand from here on.
//
// ---------------------------------------------------------------------------------------------------------------
// Foundry actor JSON (shape of the pack's pregenerated character "Vasana")
//
// {
//   name: 'Vasana', type: 'character', img?: string,
//   system: {
//     extendedName: string,                 // subtitle under the name, e.g. "Farnan's Daughter"
//     editMode: false,
//     characteristics: {                    // each { value: number, formula: string, hasExperience?: boolean }
//       strength, constitution, size, dexterity, intelligence, power, charisma
//       // default formulas: '3d6' except size and intelligence '2d6+6'; power has hasExperience: false
//     },
//     background: {
//       species: 'Human', speciesRqidLink: { rqid: 'je..species-description-human', name: 'Human' } | null,
//       occupation: FOUNDRY_OCCUPATION value ('' = none), homeland: FOUNDRY_HOMELAND value (free string),
//       town, tribe, clan, gender: string; age, reputation, ransom, baseIncome: number | null;
//       standardOfLiving, ransomDetails: string; biography: string (HTML);
//       cultureJournalRqidLinks: [], tribeJournalRqidLinks: [], clanJournalRqidLinks: []
//     },
//     allies: string (HTML),
//     attributes: {
//       magicPoints: { value }, hitPoints: { value },   // current values; max is derived by the system
//       move: { currentLocomotion: 'walk', walk: { value: 8, carryingFactor: 1 }, swim: { value: 2, carryingFactor: 0.5 } },
//       heroPoints: number, isCreature: false, health: 'healthy'
//     }
//   },
//   items: Item[],
//   flags: { rqg: { documentRqidFlags: { id: 'a.character.<slug>', lang: 'en', priority: '0' } } }
// }
//
// Every embedded item: { _id, name, type, system, effects: [], flags: { rqg: { documentRqidFlags: { id: <rqid>,
// lang: 'en', priority: '0' } } } }. _id is a 16-character alphanumeric id (Vasana's cult is 'VingasCultItemId');
// runeMagic.system.cultId must equal the cult item's _id. Item types and the system fields used:
//   skill:       { category, skillName, specialization, baseChance, gainedChance, canGetExperience, hasExperience }
//                name = specialization ? `${skillName} (${specialization})` : skillName; rqid for a specialized
//                skill = `${generic rqid}-${toFoundryKebab(specialization)}` (e.g. i.skill.worship-orlanth).
//                Final chance = baseChance + gainedChance + category modifier (the system adds the modifier).
//                Dodge/Jump baseChance is recomputed by the system from DEX (x2 / x3).
//   rune:        { rune, chance, runeType: { type, name }, opposingRuneRqidLink: { rqid, name } | null,
//                  minorRuneRqidLinks: [], isMastered: false, hasExperience: false }
//   passion:     { passion: 'Loyalty', subject: 'Sartar', chance, canGetExperience: true, hasExperience: false }
//                name `${passion} (${subject})` (Honor has no subject); rqid FOUNDRY_PASSION_RQID[kind]
//   hitLocation: FOUNDRY_HIT_LOCATIONS[n].system (dieFrom, dieTo, baseHpDelta, naturalAp, wounds, hitLocationType,
//                connectedTo, ...); the system derives HP per location
//   armor:       { hitLocationRqidLinks: [{ rqid: 'i.hit-location.head', name: 'Head' }], armorType: 'Closed Helm',
//                  material: 'Bronze Plate', absorbs, encumbrance, price: { real, estimated }, moveQuietlyPenalty,
//                  size, isContainer: false, physicalItemType: 'unique', equippedStatus }
//   weapon:      FOUNDRY_WEAPONS[id].system (+ equippedStatus); usage.{oneHand,offHand,twoHand,missile}.skillRqidLink
//                points at the skill item's rqid
//   gear:        { physicalItemType: 'unique' | 'currency' | 'consumable', quantity, encumbrance,
//                  price: { real, estimated }, equippedStatus, isContainer, description }
//                Money: gear 'Lunars' (rqid i.gear.lunars, physicalItemType 'currency', price.real 1, encumbrance 0.00625 each, quantity = coins)
//   spiritMagic: { points, isVariable, castingRange, duration, concentration }
//   runeMagic:   { points, cultId, runeRqidLinks: [{ rqid, name }], castingRange, duration, isStackable, isOneUse }
//   cult:        { deity, joinedCults: [{ cultName, tagline, rank: 'initiate' }], runePoints: { value, max },
//                  runeRqidLinks: [...] }
// equippedStatus is one of 'notCarried' | 'carried' | 'equipped'.
// Ranks: 'layMember' | 'initiate' | 'godTalker' | 'runePriest' | 'runeLord' | 'chiefPriest' | 'highPriest'.
// ---------------------------------------------------------------------------------------------------------------

export const FOUNDRY_SYSTEM = { id: 'rqg', testedVersion: '6.1.1' } as const

/** The system's rqid slug rule (toKebabCase in src/system/util.ts): "Bear's Skin" -> "bear-s-skin". */
export function toFoundryKebab(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/([a-z])([A-Z])|^-|-$/g, (_m, a: string | undefined, b: string | undefined) => (a && b ? `${a}-${b}` : ''))
    .toLowerCase()
}

export interface FoundrySkill {
  name: string
  rqid: string
  category: string
  skillName: string
  /** '' on skills where we choose the subject (the exporter fills it). */
  specialization?: string
  /** Our base chance (Dodge/Jump: 0, computed from DEX). Where the Foundry pack differs it is noted below. */
  baseChance: number
}

export interface FoundryCult {
  name: string
  rqid: string
  deity: string
  cultName: string
  tagline: string
  runeRqidLinks: { rqid: string; name: string }[]
}

export const FOUNDRY_PASSION_RQID: Record<PassionKind, string> = {
  Devotion: 'i.passion.devotion-base',
  Fear: 'i.passion.fear-base',
  Hate: 'i.passion.hate-base',
  Honor: 'i.passion.honor-base',
  Love: 'i.passion.love-base',
  Loyalty: 'i.passion.loyalty-base',
}

/** background.occupation enum (OccupationEnum in the system). */
export const FOUNDRY_OCCUPATION: Record<string, string> = {
  assistant_shaman: 'assistantShaman',
  bandit: 'bandit',
  chariot_driver: 'chariotDriver',
  crafter: 'crafter',
  entertainer: 'entertainer',
  farmer: 'farmer',
  fisher: 'fisher',
  healer: 'healer',
  herder: 'herder',
  hunter: 'hunter',
  merchant: 'merchant',
  noble: 'noble',
  philosopher: 'philosopher',
  priest: 'priest',
  scribe: 'scribe',
  thief: 'thief',
  warrior_heavy_infantry: 'warriorHeavyInfantry',
  warrior_light_infantry: 'warriorLightInfantry',
  warrior_heavy_cavalry: 'warriorHeavyCavalry',
  warrior_light_cavalry: 'warriorLightCavalry',
}

/** background.homeland: a free string; these are the system's proposed values (HomeLandEnum). */
export const FOUNDRY_HOMELAND: Record<string, string> = {
  sartar: 'sartar',
  esrolia: 'esrolia',
  grazelands: 'grazelands',
  prax_bison: 'prax',
  prax_high_llama: 'prax',
  prax_impala: 'prax',
  prax_sable: 'prax',
  prax_pol_joni: 'prax',
  lunar_tarsh: 'lunarTarsh',
  old_tarsh: 'oldTarsh',
}

/**
 * Armor rqids follow 'i.armor.<armorType>-<material>'. The five marked "seen" occur on Vasana; the rest are
 * derived with the same pattern and may not match a compendium entry (harmless: the item is still embedded).
 */
export const FOUNDRY_ARMOR_RQID: Record<string, string> = {
  leather_hood: 'i.armor.hood-leather',
  broad_brimmed_hat: 'i.armor.broad-brimmed-hat-leather',
  leather_cap: 'i.armor.cap-leather',
  composite_helm: 'i.armor.helm-composite',
  open_helm: 'i.armor.open-helm-bronze-plate',
  closed_helm: 'i.armor.closed-helm-bronze-plate', // seen
  full_helm: 'i.armor.full-helm-bronze-plate',
  light_scale_sleeves: 'i.armor.sleeves-light-scale',
  heavy_scale_sleeves: 'i.armor.sleeves-heavy-scale',
  leather_vambraces: 'i.armor.vambraces-leather',
  cuirboilli_vambraces: 'i.armor.vambraces-cuirboilli',
  bronze_vambraces: 'i.armor.vambraces-bronze-plate', // seen
  leather_cuirass: 'i.armor.cuirass-leather',
  heavy_leather_cuirass: 'i.armor.cuirass-heavy-leather',
  ring_cuirass: 'i.armor.cuirass-ring-mail',
  turtleshell_cuirass: 'i.armor.cuirass-turtleshell',
  light_scale_cuirass: 'i.armor.cuirass-light-scale',
  heavy_scale_cuirass: 'i.armor.cuirass-heavy-scale',
  disk_plate: 'i.armor.cuirass-disk-plate', // seen ("Cuirass (Bronze Disk Plate)")
  bronze_cuirass: 'i.armor.cuirass-bronze-plate',
  quilted_linothorax: 'i.armor.linothorax-quilted',
  linen_linothorax: 'i.armor.linothorax-linen',
  leather_hauberk: 'i.armor.hauberk-leather',
  heavy_leather_hauberk: 'i.armor.hauberk-heavy-leather',
  ring_hauberk: 'i.armor.hauberk-ring-mail',
  light_scale_hauberk: 'i.armor.hauberk-light-scale',
  heavy_scale_hauberk: 'i.armor.hauberk-heavy-scale',
  segmented_plate: 'i.armor.segmented-plate-bronze',
  leather_skirts: 'i.armor.skirt-leather',
  linen_skirts: 'i.armor.skirt-linen',
  studded_skirts: 'i.armor.skirt-studded-leather', // seen
  light_scale_skirts: 'i.armor.skirt-light-scale',
  heavy_scale_skirts: 'i.armor.skirt-heavy-scale',
  leather_trews: 'i.armor.trews-leather',
  heavy_leather_trews: 'i.armor.trews-heavy-leather',
  leather_greaves: 'i.armor.greaves-leather',
  cuirboilli_greaves: 'i.armor.greaves-cuirboilli',
  bronze_greaves: 'i.armor.greaves-bronze-plate', // seen
}

/**
 * Keyed by our skill id. Category strings are the system's SkillCategoryEnum: agility, communication, knowledge,
 * magic, manipulation, perception, stealth, meleeWeapons, missileWeapons, shields, naturalWeapons, otherSkills.
 * Fist, Grapple and Kick are 'naturalWeapons' in Foundry. Skills with a subject carry specialization ''.
 * Base chances differing from the Foundry pack: Evaluate and Farm (pack 10), Homeland Lore (pack 0),
 * Speak Own Language (pack's generic Speak Language is 0; own language is 50), Insight (Human) (pack 0, generic 20).
 * Crossbow maps to Light Crossbow (Heavy/Repeating are separate Foundry skills with the same base); Atlatl to
 * Atlatls (Dart); Dart/Javelin/Shortspear thrown to Javelins (...).
 */
export const FOUNDRY_SKILLS: Record<string, FoundrySkill> = {
  boat: { name: 'Boat', rqid: 'i.skill.boat', category: 'agility', skillName: 'Boat', baseChance: 5 },
  climb: { name: 'Climb', rqid: 'i.skill.climb', category: 'agility', skillName: 'Climb', baseChance: 40 },
  dodge: { name: 'Dodge', rqid: 'i.skill.dodge', category: 'agility', skillName: 'Dodge', baseChance: 0 },
  drive: { name: 'Drive', rqid: 'i.skill.drive', category: 'agility', skillName: 'Drive', specialization: '', baseChance: 5 }, // not in the Foundry packs; rqid derived
  jump: { name: 'Jump', rqid: 'i.skill.jump', category: 'agility', skillName: 'Jump', baseChance: 0 },
  ride: { name: 'Ride', rqid: 'i.skill.ride', category: 'agility', skillName: 'Ride', specialization: '', baseChance: 5 },
  swim: { name: 'Swim', rqid: 'i.skill.swim', category: 'agility', skillName: 'Swim', baseChance: 15 },
  act: { name: 'Act', rqid: 'i.skill.act', category: 'communication', skillName: 'Act', baseChance: 5 },
  art: { name: 'Art', rqid: 'i.skill.art', category: 'communication', skillName: 'Art', specialization: '', baseChance: 5 },
  bargain: { name: 'Bargain', rqid: 'i.skill.bargain', category: 'communication', skillName: 'Bargain', baseChance: 5 },
  charm: { name: 'Charm', rqid: 'i.skill.charm', category: 'communication', skillName: 'Charm', baseChance: 15 },
  dance: { name: 'Dance', rqid: 'i.skill.dance', category: 'communication', skillName: 'Dance', baseChance: 10 },
  disguise: { name: 'Disguise', rqid: 'i.skill.disguise', category: 'communication', skillName: 'Disguise', baseChance: 5 },
  fast_talk: { name: 'Fast Talk', rqid: 'i.skill.fast-talk', category: 'communication', skillName: 'Fast Talk', baseChance: 5 },
  intimidate: { name: 'Intimidate', rqid: 'i.skill.intimidate', category: 'communication', skillName: 'Intimidate', baseChance: 15 },
  intrigue: { name: 'Intrigue', rqid: 'i.skill.intrigue', category: 'communication', skillName: 'Intrigue', baseChance: 5 },
  orate: { name: 'Orate', rqid: 'i.skill.orate', category: 'communication', skillName: 'Orate', baseChance: 10 },
  sing: { name: 'Sing', rqid: 'i.skill.sing', category: 'communication', skillName: 'Sing', baseChance: 10 },
  speak_own: { name: 'Speak Language', rqid: 'i.skill.speak-language', category: 'communication', skillName: 'Speak Language', specialization: '', baseChance: 50 },
  speak_other: { name: 'Speak Language', rqid: 'i.skill.speak-language', category: 'communication', skillName: 'Speak Language', specialization: '', baseChance: 0 },
  animal_lore: { name: 'Animal Lore', rqid: 'i.skill.animal-lore', category: 'knowledge', skillName: 'Animal Lore', baseChance: 5 },
  battle: { name: 'Battle', rqid: 'i.skill.battle', category: 'knowledge', skillName: 'Battle', baseChance: 10 },
  bureaucracy: { name: 'Bureaucracy', rqid: 'i.skill.bureaucracy', category: 'knowledge', skillName: 'Bureaucracy', baseChance: 0 },
  celestial_lore: { name: 'Celestial Lore', rqid: 'i.skill.celestial-lore', category: 'knowledge', skillName: 'Celestial Lore', baseChance: 5 },
  cult_lore: { name: 'Cult Lore', rqid: 'i.skill.cult-lore', category: 'knowledge', skillName: 'Cult Lore', specialization: '', baseChance: 5 },
  customs: { name: 'Customs', rqid: 'i.skill.customs', category: 'knowledge', skillName: 'Customs', specialization: '', baseChance: 25 },
  draconic_lore: { name: 'Draconic Lore', rqid: 'i.skill.draconic-lore', category: 'knowledge', skillName: 'Draconic Lore', baseChance: 0 }, // not in the Foundry packs; rqid derived
  elder_race_lore: { name: 'Elder Race Lore', rqid: 'i.skill.elder-race-lore', category: 'knowledge', skillName: 'Elder Race Lore', specialization: '', baseChance: 5 },
  evaluate: { name: 'Evaluate', rqid: 'i.skill.evaluate', category: 'knowledge', skillName: 'Evaluate', baseChance: 5 },
  farm: { name: 'Farm', rqid: 'i.skill.farm', category: 'knowledge', skillName: 'Farm', baseChance: 5 },
  first_aid: { name: 'First Aid', rqid: 'i.skill.first-aid', category: 'knowledge', skillName: 'First Aid', baseChance: 10 },
  game: { name: 'Game', rqid: 'i.skill.game', category: 'knowledge', skillName: 'Game', baseChance: 15 },
  herd: { name: 'Herd', rqid: 'i.skill.herd', category: 'knowledge', skillName: 'Herd', baseChance: 5 },
  homeland_lore: { name: 'Homeland Lore', rqid: 'i.skill.homeland-lore', category: 'knowledge', skillName: 'Homeland Lore', specialization: '', baseChance: 30 },
  alchemy: { name: 'Alchemy', rqid: 'i.skill.alchemy', category: 'knowledge', skillName: 'Alchemy', baseChance: 0 },
  library_use: { name: 'Library Use', rqid: 'i.skill.library-use', category: 'knowledge', skillName: 'Library Use', baseChance: 0 },
  lore: { name: 'Lore', rqid: 'i.skill.lore', category: 'knowledge', skillName: 'Lore', specialization: '', baseChance: 0 },
  manage_household: { name: 'Manage Household', rqid: 'i.skill.manage-household', category: 'knowledge', skillName: 'Manage Household', baseChance: 10 },
  mineral_lore: { name: 'Mineral Lore', rqid: 'i.skill.mineral-lore', category: 'knowledge', skillName: 'Mineral Lore', baseChance: 5 },
  peaceful_cut: { name: 'Peaceful Cut', rqid: 'i.skill.peaceful-cut', category: 'knowledge', skillName: 'Peaceful Cut', baseChance: 10 },
  plant_lore: { name: 'Plant Lore', rqid: 'i.skill.plant-lore', category: 'knowledge', skillName: 'Plant Lore', baseChance: 5 },
  read_write: { name: 'Read/Write', rqid: 'i.skill.read-write', category: 'knowledge', skillName: 'Read/Write', specialization: '', baseChance: 0 },
  shiphandling: { name: 'Shiphandling', rqid: 'i.skill.shiphandling', category: 'knowledge', skillName: 'Shiphandling', baseChance: 0 },
  underworld_lore: { name: 'Underworld Lore', rqid: 'i.skill.underworld-lore', category: 'knowledge', skillName: 'Underworld Lore', baseChance: 0 }, // not in the Foundry packs; rqid derived
  survival: { name: 'Survival', rqid: 'i.skill.survival', category: 'knowledge', skillName: 'Survival', baseChance: 15 },
  river_lore: { name: 'River Lore', rqid: 'i.skill.river-lore', category: 'knowledge', skillName: 'River Lore', baseChance: 0 }, // not in the Foundry packs; rqid derived
  treat_disease: { name: 'Treat Disease', rqid: 'i.skill.treat-disease', category: 'knowledge', skillName: 'Treat Disease', baseChance: 5 },
  treat_poison: { name: 'Treat Poison', rqid: 'i.skill.treat-poison', category: 'knowledge', skillName: 'Treat Poison', baseChance: 5 },
  meditate: { name: 'Meditate', rqid: 'i.skill.meditate', category: 'magic', skillName: 'Meditate', baseChance: 0 },
  prepare_corpse: { name: 'Prepare Corpse', rqid: 'i.skill.prepare-corpse', category: 'magic', skillName: 'Prepare Corpse', baseChance: 10 },
  sense_assassin: { name: 'Sense Assassin', rqid: 'i.skill.sense-assassin', category: 'magic', skillName: 'Sense Assassin', baseChance: 0 },
  sense_chaos: { name: 'Sense Chaos', rqid: 'i.skill.sense-chaos', category: 'magic', skillName: 'Sense Chaos', baseChance: 0 },
  spirit_combat: { name: 'Spirit Combat', rqid: 'i.skill.spirit-combat', category: 'magic', skillName: 'Spirit Combat', baseChance: 20 },
  spirit_dance: { name: 'Spirit Dance', rqid: 'i.skill.spirit-dance', category: 'magic', skillName: 'Spirit Dance', baseChance: 0 },
  spirit_lore: { name: 'Spirit Lore', rqid: 'i.skill.spirit-lore', category: 'magic', skillName: 'Spirit Lore', baseChance: 0 },
  spirit_travel: { name: 'Spirit Travel', rqid: 'i.skill.spirit-travel', category: 'magic', skillName: 'Spirit Travel', baseChance: 10 },
  understand_herd_beast: { name: 'Understand Herd Beast', rqid: 'i.skill.understand-herd-beast', category: 'magic', skillName: 'Understand Herd Beast', baseChance: 0 },
  worship: { name: 'Worship', rqid: 'i.skill.worship', category: 'magic', skillName: 'Worship', specialization: '', baseChance: 5 },
  conceal: { name: 'Conceal', rqid: 'i.skill.conceal', category: 'manipulation', skillName: 'Conceal', baseChance: 5 },
  craft: { name: 'Craft', rqid: 'i.skill.craft', category: 'manipulation', skillName: 'Craft', specialization: '', baseChance: 10 },
  devise: { name: 'Devise', rqid: 'i.skill.devise', category: 'manipulation', skillName: 'Devise', baseChance: 5 },
  martial_arts: { name: 'Martial Arts', rqid: 'i.skill.martial-arts', category: 'manipulation', skillName: 'Martial Arts', baseChance: 0 }, // not in the Foundry packs; rqid derived
  play_instrument: { name: 'Play Instrument', rqid: 'i.skill.play-instrument', category: 'manipulation', skillName: 'Play Instrument', specialization: '', baseChance: 5 },
  sleight: { name: 'Sleight', rqid: 'i.skill.sleight', category: 'manipulation', skillName: 'Sleight', baseChance: 5 },
  insight: { name: 'Insight (Human)', rqid: 'i.skill.insight-human', category: 'perception', skillName: 'Insight', specialization: 'Human', baseChance: 20 },
  listen: { name: 'Listen', rqid: 'i.skill.listen', category: 'perception', skillName: 'Listen', baseChance: 25 },
  scan: { name: 'Scan', rqid: 'i.skill.scan', category: 'perception', skillName: 'Scan', baseChance: 25 },
  search: { name: 'Search', rqid: 'i.skill.search', category: 'perception', skillName: 'Search', baseChance: 25 },
  track: { name: 'Track', rqid: 'i.skill.track', category: 'perception', skillName: 'Track', baseChance: 5 },
  hide: { name: 'Hide', rqid: 'i.skill.hide', category: 'stealth', skillName: 'Hide', baseChance: 10 },
  move_quietly: { name: 'Move Quietly', rqid: 'i.skill.move-quietly', category: 'stealth', skillName: 'Move Quietly', baseChance: 10 },
  battle_axe_1h: { name: '1H Axes (Battle Axe)', rqid: 'i.skill.1h-axes-battle-axe', category: 'meleeWeapons', skillName: '1H Axes', specialization: 'Battle Axe', baseChance: 10 },
  small_axe: { name: '1H Axes (Small Axe)', rqid: 'i.skill.1h-axes-small-axe', category: 'meleeWeapons', skillName: '1H Axes', specialization: 'Small Axe', baseChance: 10 },
  battle_axe_2h: { name: '2H Axes (Battle Axe)', rqid: 'i.skill.2h-axes-battle-axe', category: 'meleeWeapons', skillName: '2H Axes', specialization: 'Battle Axe', baseChance: 5 },
  great_axe: { name: '2H Axes (Great Axe)', rqid: 'i.skill.2h-axes-great-axe', category: 'meleeWeapons', skillName: '2H Axes', specialization: 'Great Axe', baseChance: 5 },
  dagger_axe: { name: '2H Axes (Dagger Axe)', rqid: 'i.skill.2h-axes-dagger-axe', category: 'meleeWeapons', skillName: '2H Axes', specialization: 'Dagger Axe', baseChance: 5 },
  dagger: { name: '1H Daggers (Dagger)', rqid: 'i.skill.1h-daggers-dagger', category: 'meleeWeapons', skillName: '1H Daggers', specialization: 'Dagger', baseChance: 15 },
  sickle: { name: '1H Daggers (Sickle)', rqid: 'i.skill.1h-daggers-sickle', category: 'meleeWeapons', skillName: '1H Daggers', specialization: 'Sickle', baseChance: 5 },
  broadsword: { name: '1H Swords (Broadsword)', rqid: 'i.skill.1h-swords-broadsword', category: 'meleeWeapons', skillName: '1H Swords', specialization: 'Broadsword', baseChance: 10 },
  kopis: { name: '1H Swords (Kopis)', rqid: 'i.skill.1h-swords-kopis', category: 'meleeWeapons', skillName: '1H Swords', specialization: 'Kopis', baseChance: 10 },
  rapier: { name: '1H Swords (Rapier)', rqid: 'i.skill.1h-swords-rapier', category: 'meleeWeapons', skillName: '1H Swords', specialization: 'Rapier', baseChance: 10 },
  shortsword: { name: '1H Swords (Shortsword)', rqid: 'i.skill.1h-swords-shortsword', category: 'meleeWeapons', skillName: '1H Swords', specialization: 'Shortsword', baseChance: 10 },
  greatsword: { name: '2H Swords (Greatsword)', rqid: 'i.skill.2h-swords-greatsword', category: 'meleeWeapons', skillName: '2H Swords', specialization: 'Greatsword', baseChance: 5 },
  rhomphaia: { name: '2H Swords (Rhomphaia)', rqid: 'i.skill.2h-swords-rhomphaia', category: 'meleeWeapons', skillName: '2H Swords', specialization: 'Rhomphaia', baseChance: 5 },
  sickle_sword: { name: '2H Swords (Sickle-sword)', rqid: 'i.skill.2h-swords-sickle-sword', category: 'meleeWeapons', skillName: '2H Swords', specialization: 'Sickle-sword', baseChance: 5 },
  war_hammer: { name: '1H Hammers (War Hammer)', rqid: 'i.skill.1h-hammers-war-hammer', category: 'meleeWeapons', skillName: '1H Hammers', specialization: 'War Hammer', baseChance: 10 },
  great_hammer: { name: '2H Hammers (Great Hammer)', rqid: 'i.skill.2h-hammers-great-hammer', category: 'meleeWeapons', skillName: '2H Hammers', specialization: 'Great Hammer', baseChance: 5 },
  maul: { name: '2H Hammers (Maul)', rqid: 'i.skill.2h-hammers-maul', category: 'meleeWeapons', skillName: '2H Hammers', specialization: 'Maul', baseChance: 10 },
  club: { name: '1H Maces (Club)', rqid: 'i.skill.1h-maces-club', category: 'meleeWeapons', skillName: '1H Maces', specialization: 'Club', baseChance: 15 },
  heavy_mace: { name: '1H Maces (Heavy Mace)', rqid: 'i.skill.1h-maces-heavy-mace', category: 'meleeWeapons', skillName: '1H Maces', specialization: 'Heavy Mace', baseChance: 15 },
  light_mace: { name: '1H Maces (Light Mace)', rqid: 'i.skill.1h-maces-light-mace', category: 'meleeWeapons', skillName: '1H Maces', specialization: 'Light Mace', baseChance: 15 },
  singlestick: { name: '1H Maces (Singlestick)', rqid: 'i.skill.1h-maces-singlestick', category: 'meleeWeapons', skillName: '1H Maces', specialization: 'Singlestick', baseChance: 15 },
  mace_2h: { name: '2H Maces (Mace)', rqid: 'i.skill.2h-maces-mace', category: 'meleeWeapons', skillName: '2H Maces', specialization: 'Mace', baseChance: 10 },
  quarterstaff: { name: 'Quarterstaff', rqid: 'i.skill.quarterstaff', category: 'meleeWeapons', skillName: 'Quarterstaff', baseChance: 15 },
  javelin_1h: { name: '1H Spears (Javelin)', rqid: 'i.skill.1h-spears-javelin', category: 'meleeWeapons', skillName: '1H Spears', specialization: 'Javelin', baseChance: 10 },
  shortspear_1h: { name: '1H Spears (Shortspear)', rqid: 'i.skill.1h-spears-shortspear', category: 'meleeWeapons', skillName: '1H Spears', specialization: 'Shortspear', baseChance: 5 },
  lance: { name: '1H Spears (Lance)', rqid: 'i.skill.1h-spears-lance', category: 'meleeWeapons', skillName: '1H Spears', specialization: 'Lance', baseChance: 5 },
  shortspear_2h: { name: '2H Spears (Shortspear)', rqid: 'i.skill.2h-spears-shortspear', category: 'meleeWeapons', skillName: '2H Spears', specialization: 'Shortspear', baseChance: 15 },
  longspear: { name: '2H Spears (Longspear)', rqid: 'i.skill.2h-spears-longspear', category: 'meleeWeapons', skillName: '2H Spears', specialization: 'Longspear', baseChance: 15 },
  pike: { name: '2H Spears (Pike)', rqid: 'i.skill.2h-spears-pike', category: 'meleeWeapons', skillName: '2H Spears', specialization: 'Pike', baseChance: 15 },
  whip: { name: 'Whip', rqid: 'i.skill.whip', category: 'meleeWeapons', skillName: 'Whip', baseChance: 5 }, // not in the Foundry packs; rqid derived
  fist: { name: 'Fists (Fist)', rqid: 'i.skill.fists-fist', category: 'naturalWeapons', skillName: 'Fists', specialization: 'Fist', baseChance: 25 },
  grapple: { name: 'Grapple', rqid: 'i.skill.grapple', category: 'naturalWeapons', skillName: 'Grapple', baseChance: 25 },
  kick: { name: 'Kicks (Kick)', rqid: 'i.skill.kicks-kick', category: 'naturalWeapons', skillName: 'Kicks', specialization: 'Kick', baseChance: 15 },
  composite_bow: { name: 'Bows (Composite Bow)', rqid: 'i.skill.bows-composite-bow', category: 'missileWeapons', skillName: 'Bows', specialization: 'Composite Bow', baseChance: 5 },
  elf_bow: { name: 'Bows (Elf Bow)', rqid: 'i.skill.bows-elf-bow', category: 'missileWeapons', skillName: 'Bows', specialization: 'Elf Bow', baseChance: 5 },
  self_bow: { name: 'Bows (Self Bow)', rqid: 'i.skill.bows-self-bow', category: 'missileWeapons', skillName: 'Bows', specialization: 'Self Bow', baseChance: 5 },
  crossbow: { name: 'Crossbows (Light Crossbow)', rqid: 'i.skill.crossbows-light-crossbow', category: 'missileWeapons', skillName: 'Crossbows', specialization: 'Light Crossbow', baseChance: 25 },
  arbalest: { name: 'Crossbows (Arbalest)', rqid: 'i.skill.crossbows-arbalest', category: 'missileWeapons', skillName: 'Crossbows', specialization: 'Arbalest', baseChance: 10 },
  atlatl: { name: 'Atlatls (Dart)', rqid: 'i.skill.atlatls-dart', category: 'missileWeapons', skillName: 'Atlatls', specialization: 'Dart', baseChance: 5 },
  dart: { name: 'Javelins (Dart)', rqid: 'i.skill.javelins-dart', category: 'missileWeapons', skillName: 'Javelins', specialization: 'Dart', baseChance: 10 },
  javelin: { name: 'Javelins (Javelin)', rqid: 'i.skill.javelins-javelin', category: 'missileWeapons', skillName: 'Javelins', specialization: 'Javelin', baseChance: 10 },
  thrown_shortspear: { name: 'Javelins (Shortspear)', rqid: 'i.skill.javelins-shortspear', category: 'missileWeapons', skillName: 'Javelins', specialization: 'Shortspear', baseChance: 15 },
  thrown_axe: { name: 'Thrown Axe', rqid: 'i.skill.thrown-axe', category: 'missileWeapons', skillName: 'Thrown Axe', baseChance: 10 },
  thrown_dagger: { name: 'Thrown Dagger', rqid: 'i.skill.thrown-dagger', category: 'missileWeapons', skillName: 'Thrown Dagger', baseChance: 5 },
  thrown_rock: { name: 'Thrown Rock', rqid: 'i.skill.thrown-rock', category: 'missileWeapons', skillName: 'Thrown Rock', baseChance: 15 },
  sling: { name: 'Slings (Sling)', rqid: 'i.skill.slings-sling', category: 'missileWeapons', skillName: 'Slings', specialization: 'Sling', baseChance: 5 },
  staff_sling: { name: 'Slings (Staff Sling)', rqid: 'i.skill.slings-staff-sling', category: 'missileWeapons', skillName: 'Slings', specialization: 'Staff Sling', baseChance: 10 },
  pole_lasso: { name: 'Lassos (Pole Lasso)', rqid: 'i.skill.lassos-pole-lasso', category: 'missileWeapons', skillName: 'Lassos', specialization: 'Pole Lasso', baseChance: 5 },
  shield_small: { name: 'Shields (Small)', rqid: 'i.skill.shields-small', category: 'shields', skillName: 'Shields', specialization: 'Small', baseChance: 15 },
  shield_medium: { name: 'Shields (Medium)', rqid: 'i.skill.shields-medium', category: 'shields', skillName: 'Shields', specialization: 'Medium', baseChance: 15 },
  shield_large: { name: 'Shields (Large)', rqid: 'i.skill.shields-large', category: 'shields', skillName: 'Shields', specialization: 'Large', baseChance: 15 },
}

export const FOUNDRY_WEAPONS: Record<string, { name: string; rqid: string; system: Record<string, unknown> }> = {
  battle_axe: { name: 'Battle Axe', rqid: 'i.weapon.battle-axe', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-axes-battle-axe', name: '1H Axes (Battle Axe)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Parry', damageType: 'parry' }], damage: '1d8+2+db', minStrength: 13, minDexterity: 7, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], strikeRank: null }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-axes-battle-axe', name: '2H Axes (Battle Axe)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Parry', damageType: 'parry' }], damage: '1d8+2+db', minStrength: 9, minDexterity: 7, strikeRank: 3 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 8, max: 8 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 20, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  small_axe: { name: 'Small Axe', rqid: 'i.weapon.small-axe', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-axes-small-axe', name: '1H Axes (Small Axe)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Parry', damageType: 'parry' }], damage: '1d6+1+db', minStrength: 7, minDexterity: 7, strikeRank: 4 }, offHand: { skillRqidLink: null, damage: '1d6+1+db', minStrength: 7, minDexterity: 7, strikeRank: 4 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.thrown-axe', name: 'Thrown Axe' }, combatManeuvers: [{ name: 'Throw', damageType: 'impale' }], damage: '1d6+db/2', minStrength: 9, minDexterity: 9 } }, hitPoints: { value: 6, max: 6 }, encumbrance: 1, physicalItemType: 'consumable', quantity: 1, isContainer: false, price: { real: 15, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 0, range: 20, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: true, isRangedWeapon: false } },
  great_axe: { name: 'Great Axe', rqid: 'i.weapon.great-axe', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-axes-great-axe', name: '2H Axes (Great Axe)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Parry', damageType: 'parry' }], damage: '2d6+2+db', minStrength: 11, minDexterity: 7, strikeRank: 2 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 10, max: 10 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 30, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  dagger_axe: { name: 'Dagger Axe', rqid: 'i.weapon.dagger-axe', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-axes-dagger-axe', name: '2H Axes (Dagger Axe)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Parry', damageType: 'parry' }], damage: '3d6+db', minStrength: 13, minDexterity: 9, strikeRank: 1 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 10, max: 10 }, encumbrance: 3, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 75, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  dagger: { name: 'Dagger', rqid: 'i.weapon.dagger', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-daggers-dagger', name: '1H Daggers (Dagger)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d4+2+db', strikeRank: 4 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d4+2+db', strikeRank: 4 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.thrown-dagger', name: 'Thrown Dagger' }, combatManeuvers: [{ name: 'Throw', damageType: 'impale' }], damage: '1d4+db/2', minDexterity: 9 } }, hitPoints: { value: 6, max: 6 }, encumbrance: 0.25, physicalItemType: 'consumable', quantity: 1, isContainer: false, price: { real: 10, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 0, range: 20, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: true, isRangedWeapon: false } },
  parrying_dagger: { name: 'Parrying Dagger', rqid: 'i.weapon.dagger-parrying', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-daggers-dagger', name: '1H Daggers (Dagger)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d4+2+db', strikeRank: 4 }, offHand: { skillRqidLink: null, damage: '1d4+2+db', strikeRank: 4 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 8, max: 8 }, encumbrance: 0.33333333, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 20, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  sickle: { name: 'Sickle', rqid: 'i.weapon.sickle', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-daggers-sickle', name: '1H Daggers (Sickle)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Parry', damageType: 'parry' }], damage: '1d6+1+db', strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+1+db', strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 6, max: 6 }, encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 15, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  broadsword: { name: 'Broadsword', rqid: 'i.weapon.broadsword', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-swords-broadsword', name: '1H Swords (Broadsword)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d8+1+db', minStrength: 9, minDexterity: 7, strikeRank: 2 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d8+1+db', minStrength: 9, minDexterity: 7, strikeRank: 2 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 12, max: 12 }, encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 50, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  kopis: { name: 'Kopis', rqid: 'i.weapon.kopis', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-swords-kopis', name: '1H Swords (Kopis)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Parry', damageType: 'parry' }], damage: '1d8+1+db', minStrength: 9, minDexterity: 9, strikeRank: 2 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d8+1+db', minStrength: 9, minDexterity: 9, strikeRank: 2 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 12, max: 12 }, encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 50, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  rapier: { name: 'Rapier', rqid: 'i.weapon.rapier', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-swords-rapier', name: '1H Swords (Rapier)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d6+1+db', minStrength: 7, minDexterity: 13, strikeRank: 2 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+1+db', minStrength: 7, minDexterity: 13, strikeRank: 2 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 8, max: 8 }, encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 100, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  shortsword: { name: 'Shortsword', rqid: 'i.weapon.shortsword', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-swords-shortsword', name: '1H Swords (Shortsword)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d6+1+db', strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+1+db', strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 12, max: 12 }, encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 25, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  greatsword: { name: 'Greatsword', rqid: 'i.weapon.greatsword', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-swords-greatsword', name: '2H Swords (Greatsword)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Parry', damageType: 'parry' }], damage: '2d8+db', minStrength: 11, minDexterity: 13, strikeRank: 1 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 12, max: 12 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 100, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  rhomphaia: { name: 'Rhomphaia', rqid: 'i.weapon.rhomphaia', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-swords-rhomphaia', name: '2H Swords (Rhomphaia)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Parry', damageType: 'parry' }], damage: '2d6+2+db', minStrength: 11, minDexterity: 9, strikeRank: 2 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 10, max: 10 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 50, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  sickle_sword: { name: 'Sickle Sword (Moonsword)', rqid: 'i.weapon.sickle-sword-moonsword', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-swords-sickle-sword', name: '2H Swords (Sickle-sword)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Parry', damageType: 'parry' }], damage: '1d10+1+db', minStrength: 9, minDexterity: 9, strikeRank: 2 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 12, max: 12 }, encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 60, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  war_hammer: { name: 'War Hammer', rqid: 'i.weapon.war-hammer', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-hammers-war-hammer', name: '1H Hammers (War Hammer)' }, combatManeuvers: [{ name: 'Bash', damageType: 'crush' }, { name: 'Parry', damageType: 'parry' }, { name: 'Knockback', damageType: 'special' }], damage: '1d6+2+db', minStrength: 11, minDexterity: 9, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+2+db', minStrength: 11, minDexterity: 9, strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 10, max: 10 }, encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 20, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  great_hammer: { name: 'Great Hammer', rqid: 'i.weapon.great-hammer', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-hammers-great-hammer', name: '2H Hammers (Great Hammer)' }, combatManeuvers: [{ name: 'Bash', damageType: 'crush' }, { name: 'Parry', damageType: 'parry' }], damage: '2d6+2+db', minStrength: 9, minDexterity: 9, strikeRank: 1 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 5, max: 5 }, encumbrance: 3, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 15, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  maul: { name: 'Maul', rqid: 'i.weapon.maul', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-hammers-maul', name: '2H Hammers (Maul)' }, combatManeuvers: [{ name: 'Bash', damageType: 'crush' }, { name: 'Parry', damageType: 'parry' }, { name: 'Knockback', damageType: 'special' }], damage: '2d8+db', minStrength: 11, minDexterity: 7, strikeRank: 1 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 12, max: 12 }, encumbrance: 3, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 20, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  club: { name: 'Wooden Club', rqid: 'i.weapon.wooden-club', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-maces-club', name: '1H Maces (Club)' }, combatManeuvers: [{ name: 'Bash', damageType: 'crush' }, { name: 'Parry', damageType: 'parry' }, { name: 'Knockback', damageType: 'special' }], damage: '1d6+db', minStrength: 7, minDexterity: 7, strikeRank: 4 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+db', minStrength: 7, minDexterity: 7, strikeRank: 4 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 4, max: 4 }, encumbrance: 0.5, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 0, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  heavy_mace: { name: 'Heavy Mace', rqid: 'i.weapon.heavy-mace', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-maces-heavy-mace', name: '1H Maces (Heavy Mace)' }, combatManeuvers: [{ name: 'Bash', damageType: 'crush' }, { name: 'Parry', damageType: 'parry' }, { name: 'Knockback', damageType: 'special' }], damage: '1d8+2+db', minStrength: 13, minDexterity: 7, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d8+2+db', minStrength: 13, minDexterity: 7, strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 10, max: 10 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 20, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  light_mace: { name: 'Light Mace', rqid: 'i.weapon.light-mace', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-maces-light-mace', name: '1H Maces (Light Mace)' }, combatManeuvers: [{ name: 'Bash', damageType: 'crush' }, { name: 'Parry', damageType: 'parry' }, { name: 'Knockback', damageType: 'special' }], damage: '1d6+2+db', minStrength: 7, minDexterity: 7, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 7, minDexterity: 7, strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 6, max: 6 }, encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 10, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  singlestick: { name: 'Singlestick', rqid: 'i.weapon.singlestick', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-maces-singlestick', name: '1H Maces (Singlestick)' }, combatManeuvers: [{ name: 'Bash', damageType: 'crush' }, { name: 'Parry', damageType: 'parry' }, { name: 'Knockback', damageType: 'special' }], damage: '1d6+db', minDexterity: 9, strikeRank: 4 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+db', minDexterity: 90, strikeRank: 4 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 5, max: 5 }, encumbrance: 0.5, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 1, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  mace_2h: { name: 'Two Handed Mace', rqid: 'i.weapon.mace-two-handed', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-maces-mace', name: '2H Maces (Mace)' }, combatManeuvers: [{ name: 'Bash', damageType: 'crush' }, { name: 'Parry', damageType: 'parry' }, { name: 'Knockback', damageType: 'special' }], damage: '1d8+2+db', minStrength: 9, minDexterity: 7, strikeRank: 3 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 10, max: 10 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 25, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  quarterstaff: { name: 'Quarterstaff', rqid: 'i.weapon.quarterstaff', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: { rqid: 'i.skill.quarterstaff', name: 'Quarterstaff' }, combatManeuvers: [{ name: 'Bash', damageType: 'crush' }, { name: 'Parry', damageType: 'parry' }, { name: 'Knockback', damageType: 'special' }], damage: '1d8+db', minStrength: 9, minDexterity: 9, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 8, max: 8 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 5, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  shortspear: { name: 'Short Spear', rqid: 'i.weapon.short-spear', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-spears-shortspear', name: '1H Spears (Shortspear)' }, combatManeuvers: [{ name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d6+1+db', minStrength: 9, minDexterity: 7, strikeRank: 2 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+1+db', minStrength: 9, minDexterity: 7, strikeRank: 2 }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-spears-shortspear', name: '2H Spears (Shortspear)' }, combatManeuvers: [{ name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d8+1+db', minStrength: 7, minDexterity: 7, strikeRank: 1 }, missile: { skillRqidLink: { rqid: 'i.skill.javelins-shortspear', name: 'Javelins (Shortspear)' }, combatManeuvers: [{ name: 'Throw', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d6+1+db/2', minStrength: 9, minDexterity: 7 } }, hitPoints: { value: 10, max: 10 }, encumbrance: 2, physicalItemType: 'consumable', quantity: 1, isContainer: false, price: { real: 15, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 1, range: 20, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: true, isRangedWeapon: false } },
  longspear: { name: 'Long Spear', rqid: 'i.weapon.long-spear', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-spears-longspear', name: '2H Spears (Longspear)' }, combatManeuvers: [{ name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d10+1+db', minStrength: 9, minDexterity: 7, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 10, max: 10 }, encumbrance: 3, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 20, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  pike: { name: 'Pike', rqid: 'i.weapon.pike', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: { rqid: 'i.skill.2h-spears-pike', name: '2H Spears (Pike)' }, combatManeuvers: [{ name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '2d6+1+db', minStrength: 11, minDexterity: 7, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 12, max: 12 }, encumbrance: 3, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 25, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  lance: { name: 'Lance', rqid: 'i.weapon.lance', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-spears-lance', name: '1H Spears (Lance)' }, combatManeuvers: [{ name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d10+1+db', minStrength: 9, minDexterity: 7, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d10+1+db', minStrength: 9, minDexterity: 7, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 10, max: 10 }, encumbrance: 3, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 25, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  light_cestus: { name: 'Light Cestus', rqid: 'i.weapon.light-cestus', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.fists-light-cestus', name: 'Fists (Light Cestus)' }, combatManeuvers: [{ name: 'Hit', damageType: 'crush' }, { name: 'Parry', damageType: 'parry' }, { name: 'Knockback', damageType: 'special' }], damage: '1d3+1+db', minStrength: 7, strikeRank: 4 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d3+1+db', minStrength: 7, strikeRank: 4 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 4, max: 4 }, encumbrance: 0.5, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 10, estimated: 0 }, isNatural: false, equippedStatus: 'equipped', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  heavy_cestus: { name: 'Heavy Cestus', rqid: 'i.weapon.heavy-cestus', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.fists-heavy-cestus', name: 'Fists (Heavy Cestus)' }, combatManeuvers: [{ name: 'Hit', damageType: 'crush' }, { name: 'Parry', damageType: 'parry' }, { name: 'Knockback', damageType: 'special' }], damage: '1d3+2+db', minStrength: 11, strikeRank: 4 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d3+2+db', minStrength: 11, strikeRank: 4 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 8, max: 8 }, encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 20, estimated: 0 }, isNatural: false, equippedStatus: 'equipped', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  // Foundry models Claw as a natural weapon (isNatural, Fists (Claw)).
  claw: { name: 'Claw', rqid: 'i.weapon.claw', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.fists-claw', name: 'Fists (Claw)' }, combatManeuvers: [{ name: 'Claw', damageType: 'slash' }], damage: '1d6+db', strikeRank: 4 }, offHand: { skillRqidLink: null, combatManeuvers: [], strikeRank: 4 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: null, max: null }, hitPointLocation: 'leg', encumbrance: 0, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 0, estimated: 0 }, isNatural: true, equippedStatus: 'equipped', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  javelin: { name: 'Javelin', rqid: 'i.weapon.javelin', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-spears-javelin', name: '1H Spears (Javelin)' }, combatManeuvers: [{ name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d6+db', minStrength: 9, minDexterity: 9, strikeRank: 2 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+db', minStrength: 9, minDexterity: 9, strikeRank: 2 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.javelins-javelin', name: 'Javelins (Javelin)' }, combatManeuvers: [{ name: 'Throw', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d10+db/2', minStrength: 9, minDexterity: 9 } }, hitPoints: { value: 8, max: 8 }, encumbrance: 1, physicalItemType: 'consumable', quantity: 1, isContainer: false, price: { real: 35, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 1, range: 20, isProjectile: true, isProjectileWeapon: false, isThrownWeapon: true, isRangedWeapon: false } },
  dart: { name: 'Dart', rqid: 'i.weapon.dart', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.javelins-dart', name: 'Javelins (Dart)' }, combatManeuvers: [{ name: 'Throw', damageType: 'impale' }], damage: '1d6+db/2', minDexterity: 9 } }, hitPoints: { value: 4, max: 4 }, encumbrance: 0.5, physicalItemType: 'consumable', quantity: 1, isContainer: false, price: { real: 25, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 0, range: 20, isProjectile: true, isProjectileWeapon: false, isThrownWeapon: true, isRangedWeapon: false } },
  // Foundry has no bare atlatl item; nearest is the Atlatl Dart (Atlatls skill).
  atlatl: { name: 'Atlatl Dart', rqid: 'i.weapon.atlatl-dart', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.atlatls-dart', name: 'Atlatls (Dart)' }, combatManeuvers: [{ name: 'Throw', damageType: 'impale' }], damage: '2d6+db/2', minStrength: 7, minDexterity: 9 } }, hitPoints: { value: 6, max: 6 }, encumbrance: 0.5, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 10, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 1, range: 30, isProjectile: false, isProjectileWeapon: true, isThrownWeapon: false, isRangedWeapon: false } },
  throwing_axe: { name: 'Throwing Axe', rqid: 'i.weapon.throwing-axe', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-axes-small-axe', name: '1H Axes (Small Axe)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Parry', damageType: 'parry' }], damage: '1d6+1+db', minStrength: 7, minDexterity: 7, strikeRank: 4 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+1+db', minStrength: 7, minDexterity: 7, strikeRank: 4 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.thrown-axe', name: 'Thrown Axe' }, combatManeuvers: [{ name: 'Thrust', damageType: 'impale' }], damage: '1d6+db/2', minStrength: 9, minDexterity: 9 } }, hitPoints: { value: 6, max: 6 }, encumbrance: 1, physicalItemType: 'consumable', quantity: 1, isContainer: false, price: { real: 15, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 0, range: 20, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: true, isRangedWeapon: false } },
  throwing_dagger: { name: 'Throwing Dagger', rqid: 'i.weapon.dagger-throwing', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.1h-daggers-dagger', name: '1H Daggers (Dagger)' }, combatManeuvers: [{ name: 'Cut', damageType: 'slash' }, { name: 'Thrust', damageType: 'impale' }, { name: 'Parry', damageType: 'parry' }], damage: '1d4+db', strikeRank: 4 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d4+db', strikeRank: 4 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.thrown-dagger', name: 'Thrown Dagger' }, combatManeuvers: [{ name: 'Throw', damageType: 'impale' }], damage: '1d4+db/2', minDexterity: 9 } }, hitPoints: { value: 6, max: 6 }, encumbrance: 0.166666667, physicalItemType: 'consumable', quantity: 1, isContainer: false, price: { real: 20, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 0, range: 20, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: true, isRangedWeapon: false } },
  rock: { name: 'Rock', rqid: 'i.weapon.rock', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.thrown-rock', name: 'Thrown Rock' }, combatManeuvers: [{ name: 'Throw', damageType: 'crush' }], damage: '1d4+db/2' } }, hitPoints: { value: null, max: null }, hitPointLocation: '---', encumbrance: 0.25, physicalItemType: 'consumable', quantity: 1, isContainer: false, price: { real: 0, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 0, range: 20, isProjectile: true, isProjectileWeapon: false, isThrownWeapon: true, isRangedWeapon: false } },
  self_bow: { name: 'Self Bow', rqid: 'i.weapon.self-bow', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.bows-self-bow', name: 'Bows (Self Bow)' }, combatManeuvers: [{ name: 'Shoot', damageType: 'impale' }], damage: '1d6+1', minStrength: 9, minDexterity: 9 } }, hitPoints: { value: 5, max: 5 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 50, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 0, range: 80, isProjectile: false, isProjectileWeapon: true, isThrownWeapon: false, isRangedWeapon: false } },
  composite_bow: { name: 'Composite Bow', rqid: 'i.weapon.composite-bow', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.bows-composite-bow', name: 'Bows (Composite Bow)' }, combatManeuvers: [{ name: 'Shoot', damageType: 'impale' }], damage: '1d8+1', minStrength: 13, minDexterity: 9 } }, hitPoints: { value: 7, max: 7 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 150, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 0, range: 100, isProjectile: false, isProjectileWeapon: true, isThrownWeapon: false, isRangedWeapon: false } },
  light_crossbow: { name: 'Light Crossbow', rqid: 'i.weapon.light-crossbow', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.crossbows-light-crossbow', name: 'Crossbows (Light Crossbow)' }, combatManeuvers: [{ name: 'Shoot', damageType: 'impale' }], damage: '2d4+2', minStrength: 7, minDexterity: 7 } }, hitPoints: { value: 6, max: 6 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 80, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 2, range: 100, isProjectile: false, isProjectileWeapon: true, isThrownWeapon: false, isRangedWeapon: false } },
  heavy_crossbow: { name: 'Heavy Crossbow', rqid: 'i.weapon.heavy-crossbow', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.crossbows-heavy-crossbow', name: 'Crossbows (Heavy Crossbow)' }, combatManeuvers: [{ name: 'Shoot', damageType: 'impale' }], damage: '2d6+2', minStrength: 11, minDexterity: 7 } }, hitPoints: { value: 10, max: 10 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 100, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 3, range: 120, isProjectile: false, isProjectileWeapon: true, isThrownWeapon: false, isRangedWeapon: false } },
  arbalest: { name: 'Arbalest', rqid: 'i.weapon.arbalest', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.crossbows-arbalest', name: 'Crossbows (Arbalest)' }, combatManeuvers: [{ name: 'Shoot', damageType: 'impale' }], damage: '3d6+1', minStrength: 13, minDexterity: 7 } }, hitPoints: { value: 10, max: 10 }, encumbrance: 3, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 150, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 5, range: 150, isProjectile: false, isProjectileWeapon: true, isThrownWeapon: false, isRangedWeapon: false } },
  sling: { name: 'Sling', rqid: 'i.weapon.sling', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.slings-sling', name: 'Slings (Sling)' }, combatManeuvers: [{ name: 'Throw', damageType: 'crush' }], damage: '1d8+db/2', minDexterity: 9 } }, hitPoints: { value: null, max: null }, hitPointLocation: '---', encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 1, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 0, range: 80, isProjectile: false, isProjectileWeapon: true, isThrownWeapon: false, isRangedWeapon: false } },
  staff_sling: { name: 'Staff Sling', rqid: 'i.weapon.staff-sling', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.slings-staff-sling', name: 'Slings (Staff Sling)' }, combatManeuvers: [{ name: 'Throw', damageType: 'crush' }], damage: '1d10+db/2', minStrength: 9, minDexterity: 9 } }, hitPoints: { value: 8, max: 8 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 10, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 1, range: 100, isProjectile: false, isProjectileWeapon: true, isThrownWeapon: false, isRangedWeapon: false } },
  pole_lasso: { name: 'Pole Lasso', rqid: 'i.weapon.pole-lasso', system: { usage: { oneHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, offHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: { rqid: 'i.skill.lassos-pole-lasso', name: 'Lassos (Pole Lasso)' }, combatManeuvers: [{ name: 'Grapple', damageType: 'special' }], minStrength: 9, minDexterity: 13 } }, hitPoints: { value: 4, max: 4 }, encumbrance: 3, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 7, estimated: 0 }, isNatural: false, equippedStatus: 'carried', rate: 1, range: 3, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: true } },
  shield_small: { name: 'Small Wooden Shield', rqid: 'i.weapon.small-wooden-shield', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.shields-small', name: 'Shields (Small)' }, combatManeuvers: [{ name: 'Parry', damageType: 'parry' }, { name: 'Bash', damageType: 'crush' }, { name: 'Knockback', damageType: 'special' }], damage: '1d3+db', minStrength: 5, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d3+db', minStrength: 5, strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 8, max: 8 }, encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 4, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  // No hide shield in Foundry: wooden shield of the same size (same stats); override name/price.
  shield_small_hide: { name: 'Small Wooden Shield', rqid: 'i.weapon.small-wooden-shield', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.shields-small', name: 'Shields (Small)' }, combatManeuvers: [{ name: 'Parry', damageType: 'parry' }, { name: 'Bash', damageType: 'crush' }, { name: 'Knockback', damageType: 'special' }], damage: '1d3+db', minStrength: 5, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d3+db', minStrength: 5, strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 8, max: 8 }, encumbrance: 1, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 4, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  shield_medium: { name: 'Medium Wooden Shield', rqid: 'i.weapon.medium-wooden-shield', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.shields-medium', name: 'Shields (Medium)' }, combatManeuvers: [{ name: 'Parry', damageType: 'parry' }, { name: 'Bash', damageType: 'crush' }, { name: 'Knockback', damageType: 'special' }], damage: '1d4+db', minStrength: 9, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d4+db', minStrength: 9, strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 12, max: 12 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 12, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  // No hide shield in Foundry: wooden shield of the same size (same stats); override name/price.
  shield_medium_hide: { name: 'Medium Wooden Shield', rqid: 'i.weapon.medium-wooden-shield', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.shields-medium', name: 'Shields (Medium)' }, combatManeuvers: [{ name: 'Parry', damageType: 'parry' }, { name: 'Bash', damageType: 'crush' }, { name: 'Knockback', damageType: 'special' }], damage: '1d4+db', minStrength: 9, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d4+db', minStrength: 9, strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 12, max: 12 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 12, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  // No wicker shield in Foundry: wooden shield of the same size (same stats); override name/price.
  shield_medium_wicker: { name: 'Medium Wooden Shield', rqid: 'i.weapon.medium-wooden-shield', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.shields-medium', name: 'Shields (Medium)' }, combatManeuvers: [{ name: 'Parry', damageType: 'parry' }, { name: 'Bash', damageType: 'crush' }, { name: 'Knockback', damageType: 'special' }], damage: '1d4+db', minStrength: 9, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d4+db', minStrength: 9, strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 12, max: 12 }, encumbrance: 2, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 12, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  shield_large: { name: 'Large Wooden Shield', rqid: 'i.weapon.large-wooden-shield', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.shields-large', name: 'Shields (Large)' }, combatManeuvers: [{ name: 'Parry', damageType: 'parry' }, { name: 'Bash', damageType: 'crush' }, { name: 'Knockback', damageType: 'special' }], damage: '1d6+db', minStrength: 12, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+db', minStrength: 12, strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 16, max: 16 }, encumbrance: 3, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 40, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  // No hide shield in Foundry: wooden shield of the same size (same stats); override name/price.
  shield_large_hide: { name: 'Large Wooden Shield', rqid: 'i.weapon.large-wooden-shield', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.shields-large', name: 'Shields (Large)' }, combatManeuvers: [{ name: 'Parry', damageType: 'parry' }, { name: 'Bash', damageType: 'crush' }, { name: 'Knockback', damageType: 'special' }], damage: '1d6+db', minStrength: 12, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+db', minStrength: 12, strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 16, max: 16 }, encumbrance: 3, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 40, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
  // No wicker shield in Foundry: wooden shield of the same size (same stats); override name/price.
  shield_large_wicker: { name: 'Large Wooden Shield', rqid: 'i.weapon.large-wooden-shield', system: { usage: { oneHand: { skillRqidLink: { rqid: 'i.skill.shields-large', name: 'Shields (Large)' }, combatManeuvers: [{ name: 'Parry', damageType: 'parry' }, { name: 'Bash', damageType: 'crush' }, { name: 'Knockback', damageType: 'special' }], damage: '1d6+db', minStrength: 12, strikeRank: 3 }, offHand: { skillRqidLink: null, combatManeuvers: [], damage: '1d6+db', minStrength: 12, strikeRank: 3 }, twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 }, missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 } }, hitPoints: { value: 16, max: 16 }, encumbrance: 3, physicalItemType: 'unique', quantity: 1, isContainer: false, price: { real: 40, estimated: 0 }, isNatural: false, equippedStatus: 'carried', range: 0, isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false } },
}

export const FOUNDRY_RUNES: Record<RuneId, { name: string; rqid: string; rune: string; runeType: string; opposing?: { rqid: string; name: string } }> = {
  darkness: { name: 'Darkness (element)', rqid: 'i.rune.darkness-element', rune: 'Darkness', runeType: 'element' },
  water: { name: 'Water (element)', rqid: 'i.rune.water-element', rune: 'Water', runeType: 'element' },
  earth: { name: 'Earth (element)', rqid: 'i.rune.earth-element', rune: 'Earth', runeType: 'element' },
  fire: { name: 'Fire/Sky (element)', rqid: 'i.rune.fire-sky-element', rune: 'Fire/Sky', runeType: 'element' },
  air: { name: 'Air (element)', rqid: 'i.rune.air-element', rune: 'Air', runeType: 'element' },
  moon: { name: 'Moon (element)', rqid: 'i.rune.moon-element', rune: 'Moon', runeType: 'element' },
  man: { name: 'Man (form)', rqid: 'i.rune.man-form', rune: 'Man', runeType: 'form', opposing: { rqid: 'i.rune.beast-form', name: 'Beast (form)' } },
  beast: { name: 'Beast (form)', rqid: 'i.rune.beast-form', rune: 'Beast', runeType: 'form', opposing: { rqid: 'i.rune.man-form', name: 'Man (form)' } },
  fertility: { name: 'Fertility (power)', rqid: 'i.rune.fertility-power', rune: 'Fertility', runeType: 'power', opposing: { rqid: 'i.rune.death-power', name: 'Death (power)' } },
  death: { name: 'Death (power)', rqid: 'i.rune.death-power', rune: 'Death', runeType: 'power', opposing: { rqid: 'i.rune.fertility-power', name: 'Fertility (power)' } },
  harmony: { name: 'Harmony (power)', rqid: 'i.rune.harmony-power', rune: 'Harmony', runeType: 'power', opposing: { rqid: 'i.rune.disorder-power', name: 'Disorder (power)' } },
  disorder: { name: 'Disorder (power)', rqid: 'i.rune.disorder-power', rune: 'Disorder', runeType: 'power', opposing: { rqid: 'i.rune.harmony-power', name: 'Harmony (power)' } },
  truth: { name: 'Truth (power)', rqid: 'i.rune.truth-power', rune: 'Truth', runeType: 'power', opposing: { rqid: 'i.rune.illusion-power', name: 'Illusion (power)' } },
  illusion: { name: 'Illusion (power)', rqid: 'i.rune.illusion-power', rune: 'Illusion', runeType: 'power', opposing: { rqid: 'i.rune.truth-power', name: 'Truth (power)' } },
  stasis: { name: 'Stasis (power)', rqid: 'i.rune.stasis-power', rune: 'Stasis', runeType: 'power', opposing: { rqid: 'i.rune.movement-power', name: 'Movement (power)' } },
  movement: { name: 'Movement (power)', rqid: 'i.rune.movement-power', rune: 'Movement', runeType: 'power', opposing: { rqid: 'i.rune.stasis-power', name: 'Stasis (power)' } },
}

export const FOUNDRY_HIT_LOCATIONS: { name: string; rqid: string; system: Record<string, unknown> }[] = [
  { name: 'Right Leg', rqid: 'i.hit-location.right-leg', system: { dieFrom: 1, dieTo: 4, baseHpDelta: 0, naturalAp: 0, wounds: [], hitLocationType: 'limb', connectedTo: 'i.hit-location.abdomen', hitLocationHealthState: 'healthy', actorHealthImpact: 'healthy' } },
  { name: 'Left Leg', rqid: 'i.hit-location.left-leg', system: { dieFrom: 5, dieTo: 8, baseHpDelta: 0, naturalAp: 0, wounds: [], hitLocationType: 'limb', connectedTo: 'i.hit-location.abdomen', hitLocationHealthState: 'healthy', actorHealthImpact: 'healthy' } },
  { name: 'Abdomen', rqid: 'i.hit-location.abdomen', system: { dieFrom: 9, dieTo: 11, baseHpDelta: 0, naturalAp: 0, wounds: [], hitLocationType: 'abdomen', hitLocationHealthState: 'healthy', actorHealthImpact: 'healthy' } },
  { name: 'Chest', rqid: 'i.hit-location.chest', system: { dieFrom: 12, dieTo: 12, baseHpDelta: 1, naturalAp: 0, wounds: [], hitLocationType: 'chest', hitLocationHealthState: 'healthy', actorHealthImpact: 'healthy' } },
  { name: 'Right Arm', rqid: 'i.hit-location.right-arm', system: { dieFrom: 13, dieTo: 15, baseHpDelta: -1, naturalAp: 0, wounds: [], hitLocationType: 'limb', connectedTo: 'i.hit-location.chest', hitLocationHealthState: 'healthy', actorHealthImpact: 'healthy' } },
  { name: 'Left Arm', rqid: 'i.hit-location.left-arm', system: { dieFrom: 16, dieTo: 18, baseHpDelta: -1, naturalAp: 0, wounds: [], hitLocationType: 'limb', connectedTo: 'i.hit-location.chest', hitLocationHealthState: 'healthy', actorHealthImpact: 'healthy' } },
  { name: 'Head', rqid: 'i.hit-location.head', system: { dieFrom: 19, dieTo: 20, baseHpDelta: 0, naturalAp: 0, wounds: [], hitLocationType: 'head', hitLocationHealthState: 'healthy', actorHealthImpact: 'healthy' } },
]

export const FOUNDRY_CULTS: Record<string, FoundryCult> = {
  argan_argar: { name: 'Argan Argar', rqid: 'i.cult.argan-argar', deity: 'Argan Argar', cultName: 'Argan Argar', tagline: 'God of Surface Darkness', runeRqidLinks: [{ rqid: 'i.rune.darkness-element', name: 'Darkness (element)' }, { rqid: 'i.rune.harmony-power', name: 'Harmony (power)' }] },
  babeester_gor: { name: 'Babeester Gor', rqid: 'i.cult.babeester-gor', deity: 'Babeester Gor', cultName: 'Babeester Gor', tagline: 'the Avenging Daughter', runeRqidLinks: [{ rqid: 'i.rune.earth-element', name: 'Earth (element)' }, { rqid: 'i.rune.death-power', name: 'Death (power)' }] },
  chalana_arroy: { name: 'Chalana Arroy', rqid: 'i.cult.chalana-arroy', deity: 'Chalana Arroy', cultName: 'Chalana Arroy', tagline: 'the Healer', runeRqidLinks: [{ rqid: 'i.rune.harmony-power', name: 'Harmony (power)' }, { rqid: 'i.rune.fertility-power', name: 'Fertility (power)' }, { rqid: 'i.rune.harmony-power', name: 'Harmony (power)' }] },
  daka_fal: { name: 'Daka Fal', rqid: 'i.cult.daka-fal', deity: 'Daka Fal', cultName: 'Daka Fal', tagline: 'the Judge of the Dead', runeRqidLinks: [{ rqid: 'i.rune.man-form', name: 'Man (form)' }, { rqid: 'i.rune.spirit-form', name: 'Spirit (form)' }, { rqid: 'i.rune.man-form', name: 'Man (form)' }] },
  ernalda: { name: 'Ernalda', rqid: 'i.cult.ernalda', deity: 'Ernalda', cultName: 'Ernalda', tagline: 'the Earth Mother', runeRqidLinks: [{ rqid: 'i.rune.fertility-power', name: 'Fertility (power)' }, { rqid: 'i.rune.earth-element', name: 'Earth (element)' }, { rqid: 'i.rune.earth-element', name: 'Earth (element)' }, { rqid: 'i.rune.harmony-power', name: 'Harmony (power)' }] },
  eurmal: { name: 'Eurmal', rqid: 'i.cult.eurmal', deity: 'Eurmal', cultName: 'Eurmal', tagline: 'the Trickster', runeRqidLinks: [{ rqid: 'i.rune.illusion-power', name: 'Illusion (power)' }, { rqid: 'i.rune.disorder-power', name: 'Disorder (power)' }, { rqid: 'i.rune.illusion-power', name: 'Illusion (power)' }] },
  humakt: { name: 'Humakt', rqid: 'i.cult.humakt', deity: 'Humakt', cultName: 'Humakt', tagline: 'the God of Death', runeRqidLinks: [{ rqid: 'i.rune.death-power', name: 'Death (power)' }, { rqid: 'i.rune.truth-power', name: 'Truth (power)' }, { rqid: 'i.rune.death-power', name: 'Death (power)' }] },
  issaries: { name: 'Issaries', rqid: 'i.cult.issaries', deity: 'Issaries', cultName: 'Issaries', tagline: 'the Speaking God', runeRqidLinks: [{ rqid: 'i.rune.harmony-power', name: 'Harmony (power)' }, { rqid: 'i.rune.movement-power', name: 'Movement (power)' }] },
  lhankor_mhy: { name: 'Lhankor Mhy', rqid: 'i.cult.lhankor-mhy', deity: 'Lhankor Mhy', cultName: 'Lhankor Mhy', tagline: 'the Knowing God', runeRqidLinks: [{ rqid: 'i.rune.truth-power', name: 'Truth (power)' }, { rqid: 'i.rune.stasis-power', name: 'Stasis (power)' }] },
  maran_gor: { name: 'Maran Gor', rqid: 'i.cult.maran-gor', deity: 'Maran Gor', cultName: 'Maran Gor', tagline: 'the Earthshaker', runeRqidLinks: [{ rqid: 'i.rune.death-power', name: 'Death (power)' }, { rqid: 'i.rune.earth-element', name: 'Earth (element)' }, { rqid: 'i.rune.disorder-power', name: 'Disorder (power)' }] },
  orlanth_adventurous: { name: 'Orlanth Adventurous (Orlanth)', rqid: 'i.cult.orlanth-adventurous-orlanth', deity: 'Orlanth', cultName: 'Orlanth Adventurous', tagline: 'God of Adventurers and Heroes', runeRqidLinks: [{ rqid: 'i.rune.movement-power', name: 'Movement (power)' }, { rqid: 'i.rune.air-element', name: 'Air (element)' }, { rqid: 'i.rune.air-element', name: 'Air (element)' }, { rqid: 'i.rune.mastery-condition', name: 'Mastery (condition)' }] },
  orlanth_thunderous: { name: 'Orlanth Thunderous (Orlanth)', rqid: 'i.cult.orlanth-thunderous-orlanth', deity: 'Orlanth', cultName: 'Orlanth Thunderous', tagline: 'the Storm God', runeRqidLinks: [{ rqid: 'i.rune.movement-power', name: 'Movement (power)' }, { rqid: 'i.rune.air-element', name: 'Air (element)' }, { rqid: 'i.rune.air-element', name: 'Air (element)' }, { rqid: 'i.rune.mastery-condition', name: 'Mastery (condition)' }] },
  vinga: { name: 'Vinga (Orlanth)', rqid: 'i.cult.vinga-orlanth', deity: 'Orlanth', cultName: 'Vinga', tagline: 'the Red-Haired Warrior', runeRqidLinks: [{ rqid: 'i.rune.movement-power', name: 'Movement (power)' }, { rqid: 'i.rune.air-element', name: 'Air (element)' }, { rqid: 'i.rune.air-element', name: 'Air (element)' }, { rqid: 'i.rune.mastery-condition', name: 'Mastery (condition)' }] },
  seven_mothers: { name: 'The Seven Mothers', rqid: 'i.cult.the-seven-mothers', deity: 'The Seven Mothers', cultName: 'The Seven Mothers', tagline: '', runeRqidLinks: [{ rqid: 'i.rune.moon-element', name: 'Moon (element)' }, { rqid: 'i.rune.fertility-power', name: 'Fertility (power)' }, { rqid: 'i.rune.death-power', name: 'Death (power)' }] },
  storm_bull: { name: 'Storm Bull', rqid: 'i.cult.storm-bull', deity: 'Storm Bull', cultName: 'Storm Bull', tagline: '', runeRqidLinks: [{ rqid: 'i.rune.air-element', name: 'Air (element)' }, { rqid: 'i.rune.beast-form', name: 'Beast (form)' }, { rqid: 'i.rune.death-power', name: 'Death (power)' }] },
  waha: { name: 'Waha', rqid: 'i.cult.waha', deity: 'Waha', cultName: 'Waha', tagline: 'the Butcher', runeRqidLinks: [{ rqid: 'i.rune.man-form', name: 'Man (form)' }, { rqid: 'i.rune.death-power', name: 'Death (power)' }] },
  yelm: { name: 'Yelm', rqid: 'i.cult.yelm', deity: 'Yelm', cultName: 'Yelm', tagline: 'the Imperial Sun', runeRqidLinks: [{ rqid: 'i.rune.fertility-power', name: 'Fertility (power)' }, { rqid: 'i.rune.fire-sky-element', name: 'Fire/Sky (element)' }, { rqid: 'i.rune.fire-sky-element', name: 'Fire/Sky (element)' }, { rqid: 'i.rune.death-power', name: 'Death (power)' }] },
  yelmalio: { name: 'Yelmalio', rqid: 'i.cult.yelmalio', deity: 'Yelmalio', cultName: 'Yelmalio', tagline: 'the Bright God', runeRqidLinks: [{ rqid: 'i.rune.light-condition', name: 'Light (condition)' }, { rqid: 'i.rune.truth-power', name: 'Truth (power)' }] },
}

export const FOUNDRY_SPIRIT_RQID: Record<string, string> = {
  befuddle: 'i.spirit-magic.befuddle',
  binding_enchantment: 'i.spirit-magic.binding-enchantment',
  bladesharp: 'i.spirit-magic.bladesharp',
  bludgeon: 'i.spirit-magic.bludgeon',
  control_entity: 'i.spirit-magic.control-entity',
  coordination: 'i.spirit-magic.coordination',
  countermagic: 'i.spirit-magic.countermagic',
  darkwall: 'i.spirit-magic.darkwall',
  demoralize: 'i.spirit-magic.demoralize',
  detect_substance: 'i.spirit-magic.detect-substance',
  detect_enemies: 'i.spirit-magic.detect-enemies',
  detect_life: 'i.spirit-magic.detect-life',
  detect_magic: 'i.spirit-magic.detect-magic',
  detect_spirit: 'i.spirit-magic.detect-spirit',
  detect_trap: 'i.spirit-magic.detect-trap',
  detect_undead: 'i.spirit-magic.detect-undead',
  dispel_magic: 'i.spirit-magic.dispel-magic',
  disruption: 'i.spirit-magic.disruption',
  distraction: 'i.spirit-magic.distraction',
  dullblade: 'i.spirit-magic.dullblade',
  extinguish: 'i.spirit-magic.extinguish',
  fanaticism: 'i.spirit-magic.fanaticism',
  farsee: 'i.spirit-magic.farsee',
  firearrow: 'i.spirit-magic.firearrow',
  fireblade: 'i.spirit-magic.fireblade',
  glamour: 'i.spirit-magic.glamour',
  glue: 'i.spirit-magic.glue',
  heal: 'i.spirit-magic.heal',
  ignite: 'i.spirit-magic.ignite',
  ironhand: 'i.spirit-magic.ironhand',
  lantern: 'i.spirit-magic.lantern',
  light: 'i.spirit-magic.light',
  lightwall: 'i.spirit-magic.lightwall',
  magic_point_enchantment: 'i.spirit-magic.magic-point-enchantment',
  mobility: 'i.spirit-magic.mobility',
  multimissile: 'i.spirit-magic.multimissile',
  parry: 'i.spirit-magic.parry',
  protection: 'i.spirit-magic.protection',
  repair: 'i.spirit-magic.repair',
  rivereyes: 'i.spirit-magic.rivereyes',
  second_sight: 'i.spirit-magic.second-sight',
  shimmer: 'i.spirit-magic.shimmer',
  silence: 'i.spirit-magic.silence',
  sleep: 'i.spirit-magic.sleep',
  slow: 'i.spirit-magic.slow',
  speedart: 'i.spirit-magic.speedart',
  spell_matrix_enchantment: 'i.spirit-magic.spell-matrix-enchantment',
  spirit_binding: 'i.spirit-magic.spirit-binding',
  spirit_screen: 'i.spirit-magic.spirit-screen',
  strength: 'i.spirit-magic.strength',
  summon_entity: 'i.spirit-magic.summon-entity',
  vigor: 'i.spirit-magic.vigor',
  visibility: 'i.spirit-magic.visibility',
}

export const FOUNDRY_RUNE_SPELL_RQID: Record<string, string> = {
  command_cult_spirit: 'i.rune-magic.command-cult-spirit',
  dismiss_magic: 'i.rune-magic.dismiss-magic',
  divination: 'i.rune-magic.divination',
  extension: 'i.rune-magic.extension',
  find_enemy: 'i.rune-magic.find-enemy',
  heal_wound: 'i.rune-magic.heal-wound',
  multispell: 'i.rune-magic.multispell',
  sanctify: 'i.rune-magic.sanctify',
  soul_sight: 'i.rune-magic.soul-sight',
  spirit_block: 'i.rune-magic.spirit-block',
  summon_cult_spirit: 'i.rune-magic.summon-cult-spirit',
  warding: 'i.rune-magic.warding',
  absorption: 'i.rune-magic.absorption',
  accelerate_growth: 'i.rune-magic.accelerate-growth',
  affix_darkness: 'i.rune-magic.affix-darkness',
  alter_creature: 'i.rune-magic.alter-creature',
  analyze_magic: 'i.rune-magic.analyze-magic',
  arouse_passion: 'i.rune-magic.arouse-passion',
  axe_trance: 'i.rune-magic.axe-trance',
  axis_mundi: 'i.rune-magic.axis-mundi',
  ban: 'i.rune-magic.ban',
  bear_fruit: 'i.rune-magic.bear-fruit',
  bears_skin: 'i.rune-magic.bear-s-skin',
  bears_strength: 'i.rune-magic.bear-s-strength',
  beastmaster: 'i.rune-magic.beastmaster',
  become_other_shape: 'i.rune-magic.become-other-shape',
  berserker: 'i.rune-magic.berserker',
  bind_ghost: 'i.rune-magic.bind-ghost',
  binding_enchantment: 'i.rune-magic.binding-enchantment',
  blast_earth: 'i.rune-magic.blast-earth',
  bless_animals: 'i.rune-magic.bless-animals',
  bless_champion: 'i.rune-magic.bless-champion',
  bless_crops: 'i.rune-magic.bless-crops',
  bless_grave: 'i.rune-magic.bless-grave',
  bless_pregnancy: 'i.rune-magic.bless-pregnancy',
  bless_thunderstone: 'i.rune-magic.bless-thunderstone',
  bless_woad: 'i.rune-magic.bless-woad',
  breathe_air_water: 'i.rune-magic.breathe-air-water',
  call_founder: 'i.rune-magic.call-founder',
  catseye: 'i.rune-magic.catseye',
  chaos_gift: 'i.rune-magic.chaos-gift',
  charisma: 'i.rune-magic.charisma',
  clairvoyance: 'i.rune-magic.clairvoyance',
  claws: 'i.rune-magic.claws',
  clever_tongue: 'i.rune-magic.clever-tongue',
  cloud_call: 'i.rune-magic.cloud-call',
  cloud_clear: 'i.rune-magic.cloud-clear',
  comfort_song: 'i.rune-magic.comfort-song',
  command_species: 'i.rune-magic.command-species',
  command_priests: 'i.rune-magic.command-priests',
  command_worshipers: 'i.rune-magic.command-worshipers',
  crack: 'i.rune-magic.crack',
  create_fissure: 'i.rune-magic.create-fissure',
  create_great_market: 'i.rune-magic.create-great-market',
  create_market: 'i.rune-magic.create-market',
  create_shadow: 'i.rune-magic.create-shadow',
  create_wildfire: 'i.rune-magic.create-wildfire',
  cremate_dead: 'i.rune-magic.cremate-dead',
  cure_all_disease: 'i.rune-magic.cure-all-disease',
  cure_chaos_wound: 'i.rune-magic.cure-chaos-wound',
  cure_poison: 'i.rune-magic.cure-poison',
  dark_walk: 'i.rune-magic.dark-walk',
  detect_honor: 'i.rune-magic.detect-honor',
  detect_truth: 'i.rune-magic.detect-truth',
  discorporation: 'i.rune-magic.discorporation',
  dismiss_elemental_type: 'i.rune-magic.dismiss-elemental-type',
  draw_beast: 'i.rune-magic.draw-beast',
  earth_shield: 'i.rune-magic.earth-shield',
  earthpower: 'i.rune-magic.earthpower',
  enchant_metal: 'i.rune-magic.enchant-metal',
  face_chaos: 'i.rune-magic.face-chaos',
  fear: 'i.rune-magic.fear',
  fearless: 'i.rune-magic.fearless',
  fight_disease: 'i.rune-magic.fight-disease',
  find_substance: 'i.rune-magic.find-substance',
  fireshield: 'i.rune-magic.fireshield',
  flight: 'i.rune-magic.flight',
  float: 'i.rune-magic.float',
  free_ghost: 'i.rune-magic.free-ghost',
  gnome_to_gargoyle: 'i.rune-magic.gnome-to-gargoyle',
  group_laughter: 'i.rune-magic.group-laughter',
  guided_teleportation: 'i.rune-magic.guided-teleportation',
  hallucinate: 'i.rune-magic.hallucinate',
  harmony: 'i.rune-magic.harmony',
  heal_body: 'i.rune-magic.heal-body',
  healing_trance: 'i.rune-magic.healing-trance',
  hide_fire: 'i.rune-magic.hide-fire',
  hide_wealth: 'i.rune-magic.hide-wealth',
  identify_scent: 'i.rune-magic.identify-scent',
  illusory_motion: 'i.rune-magic.illusory-motion',
  illusory_odor: 'i.rune-magic.illusory-odor',
  illusory_sight: 'i.rune-magic.illusory-sight',
  illusory_sound: 'i.rune-magic.illusory-sound',
  illusory_substance: 'i.rune-magic.illusory-substance',
  illusory_taste: 'i.rune-magic.illusory-taste',
  impede_chaos: 'i.rune-magic.impede-chaos',
  incarnate_ancestor: 'i.rune-magic.incarnate-ancestor',
  increase_decrease_wind: 'i.rune-magic.increase-decrease-wind',
  invigorate: 'i.rune-magic.invigorate',
  inviolable: 'i.rune-magic.inviolable',
  invisibility: 'i.rune-magic.invisibility',
  knowledge: 'i.rune-magic.knowledge',
  leap: 'i.rune-magic.leap',
  lie: 'i.rune-magic.lie',
  lightning: 'i.rune-magic.lightning',
  lock: 'i.rune-magic.lock',
  madness: 'i.rune-magic.madness',
  magic_point_enchantment: 'i.rune-magic.magic-point-enchantment',
  matrix_creation: 'i.rune-magic.matrix-creation',
  mind_read: 'i.rune-magic.mind-read',
  mindblast: 'i.rune-magic.mindblast',
  mist_cloud: 'i.rune-magic.mist-cloud',
  morale: 'i.rune-magic.morale',
  oath: 'i.rune-magic.oath',
  panic: 'i.rune-magic.panic',
  passage: 'i.rune-magic.passage',
  path_watch: 'i.rune-magic.path-watch',
  pathway: 'i.rune-magic.pathway',
  peace: 'i.rune-magic.peace',
  rain: 'i.rune-magic.rain',
  reconstruction: 'i.rune-magic.reconstruction',
  reflection: 'i.rune-magic.reflection',
  regrow_limb: 'i.rune-magic.regrow-limb',
  remove_body_part: 'i.rune-magic.remove-body-part',
  reproduce: 'i.rune-magic.reproduce',
  restore_health: 'i.rune-magic.restore-health',
  resurrect: 'i.rune-magic.resurrect',
  safe: 'i.rune-magic.safe',
  seal_soul: 'i.rune-magic.seal-soul',
  sever_spirit: 'i.rune-magic.sever-spirit',
  shake_earth: 'i.rune-magic.shake-earth',
  shattering: 'i.rune-magic.shattering',
  shield: 'i.rune-magic.shield',
  slash: 'i.rune-magic.slash',
  snow: 'i.rune-magic.snow',
  speak_with_herd_beasts: 'i.rune-magic.speak-with-herd-beasts',
  speak_with_insects: 'i.rune-magic.speak-with-insects',
  spell_trading: 'i.rune-magic.spell-trading',
  spirit_armor_enchantment: 'i.rune-magic.spirit-armor-enchantment',
  spirit_guardian: 'i.rune-magic.spirit-guardian',
  spirit_melding: 'i.rune-magic.spirit-melding',
  strike: 'i.rune-magic.strike',
  strongnet: 'i.rune-magic.strongnet',
  summon_ancestor: 'i.rune-magic.summon-ancestor',
  summon_elemental_type: 'i.rune-magic.summon-elemental-type',
  summon_household_guardian: 'i.rune-magic.summon-household-guardian',
  summon_specific_ancestor: 'i.rune-magic.summon-specific-ancestor',
  summon_spirit_of_law: 'i.rune-magic.summon-spirit-of-law',
  summon_spirit_teacher: 'i.rune-magic.summon-spirit-teacher',
  summons_of_evil: 'i.rune-magic.summons-of-evil',
  sunbright: 'i.rune-magic.sunbright',
  sunspear: 'i.rune-magic.sunspear',
  suppress_lodril: 'i.rune-magic.suppress-lodril',
  sureshot: 'i.rune-magic.sureshot',
  swallow: 'i.rune-magic.swallow',
  sword_trance: 'i.rune-magic.sword-trance',
  tame_bull: 'i.rune-magic.tame-bull',
  teleportation: 'i.rune-magic.teleportation',
  thunderbolt: 'i.rune-magic.thunderbolt',
  transform_self: 'i.rune-magic.transform-self',
  translate: 'i.rune-magic.translate',
  true_weapon: 'i.rune-magic.true-weapon',
  truespeak: 'i.rune-magic.truespeak',
  turn_undead: 'i.rune-magic.turn-undead',
  wind_warp: 'i.rune-magic.wind-warp',
  wind_words: 'i.rune-magic.wind-words',
}
