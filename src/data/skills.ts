import type { Skill } from '../engine/types'

// Standard human base chances, verified against the RQG core rulebook: Skills chapter (pp.163-190) and the
// weapon tables (pp.208-209, 212, 217). Names and numbers only.
// Characteristic-based bases: Dodge (DEX x2), Jump (DEX x3).
// Two-value bases ("own culture / others"): Customs 25/00, Homeland Lore 30/00, Insight (Species) 20/00;
// Speak Own Language is 50 but Speak Other Language is 00. The value stored here is the own-culture one.

export const SKILLS: Skill[] = [
  // Agility
  { id: 'boat', name: 'Boat', category: 'agility', base: 5 },
  { id: 'climb', name: 'Climb', category: 'agility', base: 40 },
  { id: 'dodge', name: 'Dodge', category: 'agility', base: { char: 'dex', mult: 2 } },
  { id: 'drive', name: 'Drive', category: 'agility', base: 5, specify: 'vehicle' },
  { id: 'jump', name: 'Jump', category: 'agility', base: { char: 'dex', mult: 3 } },
  { id: 'ride', name: 'Ride', category: 'agility', base: 5, specify: 'mount' },
  { id: 'swim', name: 'Swim', category: 'agility', base: 15 },

  // Communication
  { id: 'act', name: 'Act', category: 'communication', base: 5 },
  { id: 'art', name: 'Art', category: 'communication', base: 5, specify: 'type' },
  { id: 'bargain', name: 'Bargain', category: 'communication', base: 5 },
  { id: 'charm', name: 'Charm', category: 'communication', base: 15 },
  { id: 'dance', name: 'Dance', category: 'communication', base: 10 },
  { id: 'disguise', name: 'Disguise', category: 'communication', base: 5 },
  { id: 'fast_talk', name: 'Fast Talk', category: 'communication', base: 5 },
  { id: 'intimidate', name: 'Intimidate', category: 'communication', base: 15 },
  { id: 'intrigue', name: 'Intrigue', category: 'communication', base: 5 },
  { id: 'orate', name: 'Orate', category: 'communication', base: 10 },
  { id: 'sing', name: 'Sing', category: 'communication', base: 10 },
  { id: 'speak_own', name: 'Speak Own Language', category: 'communication', base: 50, specify: 'language' },
  { id: 'speak_other', name: 'Speak Other Language', category: 'communication', base: 0, specify: 'language' },

  // Knowledge
  { id: 'animal_lore', name: 'Animal Lore', category: 'knowledge', base: 5 },
  { id: 'battle', name: 'Battle', category: 'knowledge', base: 10 },
  { id: 'bureaucracy', name: 'Bureaucracy', category: 'knowledge', base: 0 },
  { id: 'celestial_lore', name: 'Celestial Lore', category: 'knowledge', base: 5 },
  { id: 'cult_lore', name: 'Cult Lore', category: 'knowledge', base: 5, specify: 'cult' },
  { id: 'customs', name: 'Customs', category: 'knowledge', base: 25, baseOther: 0, specify: 'culture' }, // 25 own culture, 00 others
  { id: 'draconic_lore', name: 'Draconic Lore', category: 'knowledge', base: 0 },
  { id: 'elder_race_lore', name: 'Elder Race Lore', category: 'knowledge', base: 5, specify: 'race' },
  { id: 'evaluate', name: 'Evaluate', category: 'knowledge', base: 5 },
  { id: 'farm', name: 'Farm', category: 'knowledge', base: 5 },
  { id: 'first_aid', name: 'First Aid', category: 'knowledge', base: 10 },
  { id: 'game', name: 'Game', category: 'knowledge', base: 15 },
  { id: 'herd', name: 'Herd', category: 'knowledge', base: 5 },
  { id: 'homeland_lore', name: 'Homeland Lore', category: 'knowledge', base: 30, baseOther: 0, specify: 'homeland' }, // 30 own homeland, 00 others
  { id: 'alchemy', name: 'Alchemy', category: 'knowledge', base: 0 },
  { id: 'library_use', name: 'Library Use', category: 'knowledge', base: 0 },
  { id: 'lore', name: 'Lore', category: 'knowledge', base: 0, specify: 'subject' },
  { id: 'manage_household', name: 'Manage Household', category: 'knowledge', base: 10 },
  { id: 'mineral_lore', name: 'Mineral Lore', category: 'knowledge', base: 5 },
  { id: 'peaceful_cut', name: 'Peaceful Cut', category: 'knowledge', base: 10 },
  { id: 'plant_lore', name: 'Plant Lore', category: 'knowledge', base: 5 },
  { id: 'read_write', name: 'Read/Write', category: 'knowledge', base: 0, specify: 'language' },
  { id: 'shiphandling', name: 'Shiphandling', category: 'knowledge', base: 0 },
  { id: 'underworld_lore', name: 'Underworld Lore', category: 'knowledge', base: 0 },
  { id: 'survival', name: 'Survival', category: 'knowledge', base: 15 },
  { id: 'river_lore', name: 'River Lore', category: 'knowledge', base: 0 },
  { id: 'treat_disease', name: 'Treat Disease', category: 'knowledge', base: 5 },
  { id: 'treat_poison', name: 'Treat Poison', category: 'knowledge', base: 5 },

  // Magic
  { id: 'meditate', name: 'Meditate', category: 'magic', base: 0 },
  { id: 'prepare_corpse', name: 'Prepare Corpse', category: 'magic', base: 10 },
  { id: 'sense_assassin', name: 'Sense Assassin', category: 'magic', base: 0 },
  { id: 'sense_chaos', name: 'Sense Chaos', category: 'magic', base: 0 },
  { id: 'spirit_combat', name: 'Spirit Combat', category: 'magic', base: 20 },
  { id: 'spirit_dance', name: 'Spirit Dance', category: 'magic', base: 0 },
  { id: 'spirit_lore', name: 'Spirit Lore', category: 'magic', base: 0 },
  { id: 'spirit_travel', name: 'Spirit Travel', category: 'magic', base: 10 },
  { id: 'understand_herd_beast', name: 'Understand Herd Beast', category: 'magic', base: 0 },
  { id: 'worship', name: 'Worship', category: 'magic', base: 5, specify: 'deity' },

  // Manipulation
  { id: 'conceal', name: 'Conceal', category: 'manipulation', base: 5 },
  { id: 'craft', name: 'Craft', category: 'manipulation', base: 10, specify: 'type' },
  { id: 'devise', name: 'Devise', category: 'manipulation', base: 5 },
  // Described among the Knowledge skills (p.181) in the core book, but conventionally a Manipulation skill.
  { id: 'martial_arts', name: 'Martial Arts', category: 'manipulation', base: 0 },
  { id: 'play_instrument', name: 'Play Instrument', category: 'manipulation', base: 5, specify: 'instrument' },
  { id: 'sleight', name: 'Sleight', category: 'manipulation', base: 5 },

  // Perception
  { id: 'insight', name: 'Insight (Human)', category: 'perception', base: 20 }, // 20 own species, 00 others
  { id: 'listen', name: 'Listen', category: 'perception', base: 25 },
  { id: 'scan', name: 'Scan', category: 'perception', base: 25 },
  { id: 'search', name: 'Search', category: 'perception', base: 25 },
  { id: 'track', name: 'Track', category: 'perception', base: 5 },

  // Stealth
  { id: 'hide', name: 'Hide', category: 'stealth', base: 10 },
  { id: 'move_quietly', name: 'Move Quietly', category: 'stealth', base: 10 },

  // Melee weapons
  { id: 'battle_axe_1h', name: '1H Axe (Battle Axe)', category: 'melee', base: 10 },
  { id: 'small_axe', name: '1H Axe (Small Axe)', category: 'melee', base: 10 },
  { id: 'battle_axe_2h', name: '2H Axe (Battle Axe)', category: 'melee', base: 5 },
  { id: 'great_axe', name: '2H Axe (Great Axe)', category: 'melee', base: 5 },
  { id: 'dagger_axe', name: '2H Axe (Dagger-axe)', category: 'melee', base: 5 },
  { id: 'dagger', name: '1H Dagger', category: 'melee', base: 15 },
  { id: 'sickle', name: '1H Dagger (Sickle)', category: 'melee', base: 5 },
  { id: 'broadsword', name: '1H Sword (Broadsword)', category: 'melee', base: 10 },
  { id: 'kopis', name: '1H Sword (Kopis)', category: 'melee', base: 10 },
  { id: 'rapier', name: '1H Sword (Rapier)', category: 'melee', base: 10 },
  { id: 'shortsword', name: '1H Sword (Shortsword)', category: 'melee', base: 10 },
  { id: 'greatsword', name: '2H Sword (Greatsword)', category: 'melee', base: 5 },
  { id: 'rhomphaia', name: '2H Sword (Rhomphaia)', category: 'melee', base: 5 },
  { id: 'sickle_sword', name: '2H Sword (Sickle-sword)', category: 'melee', base: 5 },
  { id: 'war_hammer', name: '1H Hammer (War Hammer)', category: 'melee', base: 10 },
  { id: 'great_hammer', name: '2H Hammer (Great Hammer)', category: 'melee', base: 5 },
  { id: 'maul', name: '2H Hammer (Maul)', category: 'melee', base: 10 },
  { id: 'club', name: '1H Mace (Club)', category: 'melee', base: 15 },
  { id: 'heavy_mace', name: '1H Mace (Heavy Mace)', category: 'melee', base: 15 },
  { id: 'light_mace', name: '1H Mace (Light Mace)', category: 'melee', base: 15 },
  { id: 'singlestick', name: '1H Mace (Singlestick)', category: 'melee', base: 15 },
  { id: 'mace_2h', name: '2H Mace', category: 'melee', base: 10 },
  { id: 'quarterstaff', name: 'Quarterstaff', category: 'melee', base: 15 },
  { id: 'javelin_1h', name: '1H Spear (Javelin)', category: 'melee', base: 10 },
  { id: 'shortspear_1h', name: '1H Spear (Shortspear)', category: 'melee', base: 5 },
  { id: 'lance', name: '1H Spear (Lance)', category: 'melee', base: 5 },
  { id: 'shortspear_2h', name: '2H Spear (Shortspear)', category: 'melee', base: 15 },
  { id: 'longspear', name: '2H Spear (Longspear)', category: 'melee', base: 15 },
  { id: 'pike', name: '2H Spear (Pike)', category: 'melee', base: 15 },
  { id: 'whip', name: 'Whip', category: 'melee', base: 5 }, // not in the core weapon tables; base unverified
  { id: 'fist', name: 'Fist', category: 'melee', base: 25 },
  { id: 'grapple', name: 'Grapple', category: 'melee', base: 25 },
  { id: 'kick', name: 'Kick', category: 'melee', base: 15 },

  // Missile weapons
  { id: 'composite_bow', name: 'Bow (Composite)', category: 'missile', base: 5 },
  { id: 'elf_bow', name: 'Bow (Elf)', category: 'missile', base: 5 },
  { id: 'self_bow', name: 'Bow (Self)', category: 'missile', base: 5 },
  { id: 'crossbow', name: 'Crossbow (Light/Heavy/Repeating)', category: 'missile', base: 25 },
  { id: 'arbalest', name: 'Crossbow (Arbalest)', category: 'missile', base: 10 },
  { id: 'atlatl', name: 'Atlatl', category: 'missile', base: 5 },
  { id: 'dart', name: 'Thrown Dart', category: 'missile', base: 10 },
  { id: 'javelin', name: 'Thrown Javelin', category: 'missile', base: 10 },
  { id: 'thrown_shortspear', name: 'Thrown Shortspear', category: 'missile', base: 15 },
  { id: 'thrown_axe', name: 'Thrown Axe', category: 'missile', base: 10 },
  { id: 'thrown_dagger', name: 'Thrown Dagger', category: 'missile', base: 5 },
  { id: 'thrown_rock', name: 'Thrown Rock', category: 'missile', base: 15 },
  { id: 'sling', name: 'Sling', category: 'missile', base: 5 },
  { id: 'staff_sling', name: 'Staff Sling', category: 'missile', base: 10 },
  { id: 'pole_lasso', name: 'Pole Lasso', category: 'missile', base: 5 },

  // Shields
  { id: 'shield_small', name: 'Small Shield', category: 'shield', base: 15 },
  { id: 'shield_medium', name: 'Medium Shield', category: 'shield', base: 15 },
  { id: 'shield_large', name: 'Large Shield', category: 'shield', base: 15 },
]
