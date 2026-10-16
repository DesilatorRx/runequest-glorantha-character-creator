// Short, original summaries of skills, characteristics, Runes, Passions, and derived attributes,
// with printed page references to the RuneQuest: Roleplaying in Glorantha core rulebook.
// All summaries are our own paraphrases; consult the rulebook for the actual rules text.

export interface AbilityInfo {
  page: number
  summary: string
}

const melee = (weapon: string, page: number): AbilityInfo => ({
  page,
  summary: `Attack and parry in close combat with ${weapon}.`,
})
const missile = (weapon: string): AbilityInfo => ({
  page: 212,
  summary: `Attack targets beyond melee reach using ${weapon}.`,
})
const shield = (size: string): AbilityInfo => ({
  page: 217,
  summary: `Block blows with a ${size} shield; it can also be used to bash a foe.`,
})

export const SKILL_INFO: Record<string, AbilityInfo> = {
  // Agility
  boat: { page: 164, summary: 'Paddle, row, or steer small craft such as canoes and rafts on rivers and lakes.' },
  climb: { page: 165, summary: 'Scale walls, trees, cliffs, and ropes without falling.' },
  dodge: { page: 165, summary: 'Get out of the way of blows, missiles, and other physical dangers.' },
  drive: { page: 165, summary: 'Handle a chariot or other vehicle and its team, even at speed or in battle.' },
  jump: { page: 165, summary: 'Leap across gaps or over obstacles, and land safely after a drop.' },
  ride: { page: 166, summary: 'Stay mounted and control a riding animal, including while fighting from its back.' },
  swim: { page: 168, summary: 'Stay afloat and move through water without drowning, even in rough conditions.' },

  // Communication
  act: { page: 168, summary: 'Convincingly play a role or feign emotions, on stage or to deceive.' },
  art: { page: 168, summary: 'Create a chosen kind of artwork, such as painting, sculpture, poetry, or calligraphy.' },
  bargain: { page: 168, summary: 'Haggle over prices and trade terms to get the better side of a deal.' },
  charm: { page: 169, summary: 'Win people over through warmth, flattery, or attraction so they want to help you.' },
  dance: { page: 169, summary: 'Perform social, sacred, or martial dances that move an audience or support magic.' },
  disguise: { page: 169, summary: 'Change your appearance with costume and makeup to pass as someone else.' },
  fast_talk: { page: 169, summary: 'Rapidly bluff a few listeners into going along with you before they think it over.' },
  intimidate: { page: 169, summary: 'Frighten or pressure someone into doing what you want, at the risk of resentment.' },
  intrigue: { page: 170, summary: 'Navigate court politics, gossip, and hidden alliances to learn secrets or gain influence.' },
  orate: { page: 170, summary: 'Address and sway a crowd with a prepared or impassioned speech.' },
  sing: { page: 170, summary: 'Perform songs well enough to entertain, inspire, or accompany ritual.' },
  speak_own: { page: 171, summary: 'Fluency in your native tongue, including its idioms and regional nuances.' },
  speak_other: { page: 173, summary: 'Communicate in a language learned beyond your native one.' },

  // Knowledge
  animal_lore: { page: 178, summary: 'Identify wild creatures and understand their habits, dangers, and behavior.' },
  battle: { page: 176, summary: 'Lead and maneuver troops, and read the flow of a large engagement.' },
  bureaucracy: { page: 176, summary: 'Work official systems, records, and functionaries to get things done.' },
  celestial_lore: { page: 178, summary: 'Know the sky dome, its stars and planets, and read omens and the calendar from them.' },
  cult_lore: { page: 179, summary: 'Know the myths, rites, holy days, and secrets of one particular cult.' },
  customs: { page: 176, summary: 'Understand the etiquette, laws, and rituals of a culture so you behave appropriately.' },
  draconic_lore: { page: 179, summary: 'Grasp the strange philosophy and history of dragons, dragonewts, and draconic mysticism.' },
  elder_race_lore: { page: 179, summary: 'Know the ways and history of one elder race, such as trolls, elves, or dwarves.' },
  evaluate: { page: 177, summary: 'Judge the worth, quality, and authenticity of goods and treasure.' },
  farm: { page: 177, summary: 'Raise crops and manage fields through the agricultural year.' },
  first_aid: { page: 177, summary: 'Treat a fresh wound to restore a few hit points or stabilize the injured.' },
  game: { page: 178, summary: 'Play and win common games of skill and chance, and spot cheats.' },
  herd: { page: 178, summary: 'Tend, drive, and judge the health of livestock and herd animals.' },
  homeland_lore: { page: 179, summary: 'Know the geography, history, notable people, and politics of a homeland.' },
  alchemy: { page: 175, summary: 'Prepare potions, poisons, and other compounds through specialized formulas.' },
  library_use: { page: 178, summary: 'Locate useful information among records, scrolls, and archives.' },
  lore: { page: 178, summary: 'Specialized knowledge of one named subject, learned and tracked separately.' },
  manage_household: { page: 180, summary: 'Run a household or estate, balancing supplies, servants, and income.' },
  mineral_lore: { page: 179, summary: 'Identify ores, stones, and gems, and know where to find them.' },
  peaceful_cut: { page: 181, summary: 'Ritually slaughter an animal so its spirit departs without anger.' },
  plant_lore: { page: 180, summary: 'Recognize plants and herbs and know which are edible, healing, or poisonous.' },
  read_write: { page: 181, summary: 'Read and write a given script or written language.' },
  shiphandling: { page: 182, summary: 'Command and navigate a larger vessel and direct its crew.' },
  underworld_lore: { page: 180, summary: 'Know the realms beneath the world, their inhabitants, and their dangers.' },
  survival: { page: 182, summary: 'Find food, water, and shelter, and stay alive in the wilds.' },
  river_lore: { page: 180, summary: 'Know rivers, their currents, spirits, and the folk who live along them.' },
  treat_disease: { page: 182, summary: 'Diagnose and nurse illnesses to help a patient fight off disease.' },
  treat_poison: { page: 182, summary: 'Recognize poisons and apply remedies to lessen their effects.' },

  // Magic
  meditate: { page: 182, summary: 'Calm and focus the mind, aiding concentration and some magical practices.' },
  prepare_corpse: { page: 183, summary: 'Perform proper funeral rites so the dead rest and do not return.' },
  sense_assassin: { page: 183, summary: 'An intuitive warning of hidden danger or someone planning to strike you.' },
  sense_chaos: { page: 183, summary: 'Detect the presence of Chaos taint in creatures or places nearby.' },
  spirit_combat: { page: 183, summary: 'Fight spirits and other souls directly on the spiritual plane.' },
  spirit_dance: { page: 183, summary: 'Use rhythmic dance to perceive and interact with the Spirit World.' },
  spirit_lore: { page: 184, summary: 'Know the kinds of spirits, their habits, and how to deal with them.' },
  spirit_travel: { page: 184, summary: 'Move your discorporate self through the Spirit World and find your way back.' },
  understand_herd_beast: { page: 184, summary: 'Communicate with and comprehend the herd animals of your people.' },
  worship: { page: 184, summary: 'Lead or take part in ceremonies to your deity, which helps regain Rune points.' },

  // Manipulation
  conceal: { page: 185, summary: 'Hide objects on your person or in a place so others overlook them.' },
  craft: { page: 185, summary: 'Make useful goods in a chosen trade, such as smithing, weaving, or carpentry.' },
  devise: { page: 186, summary: 'Build, disarm, or operate traps, locks, and mechanical contraptions.' },
  martial_arts: { page: 181, summary: 'Trained unarmed or weapon technique that lets successful blows deal extra damage.' },
  play_instrument: { page: 187, summary: 'Perform music on a chosen instrument to entertain or accompany rites.' },
  sleight: { page: 187, summary: 'Pick pockets, palm objects, and perform tricks of quick hands.' },

  // Perception
  insight: { page: 188, summary: 'Read the mood, motives, and honesty of other people.' },
  listen: { page: 188, summary: 'Hear faint or distant sounds and pick out meaningful noises.' },
  scan: { page: 188, summary: 'Quickly survey your surroundings to notice movement or something out of place.' },
  search: { page: 188, summary: 'Carefully examine an area to find hidden items, doors, or clues.' },
  track: { page: 188, summary: 'Follow the trail left by people or animals across the land.' },

  // Stealth
  hide: { page: 189, summary: 'Stay unseen by using cover, shadow, and stillness.' },
  move_quietly: { page: 189, summary: 'Move without making noise that would alert others.' },

  // Melee weapons (Combat chapter weapon tables)
  battle_axe_1h: melee('a one-handed battle axe', 208),
  small_axe: melee('a small hand axe', 208),
  battle_axe_2h: melee('a battle axe held in both hands', 208),
  great_axe: melee('a heavy two-handed great axe', 208),
  dagger_axe: melee('a two-handed dagger-axe', 208),
  dagger: melee('a dagger or knife', 208),
  sickle: melee('a sickle', 208),
  broadsword: melee('a broadsword', 208),
  kopis: melee('a curved kopis', 208),
  rapier: melee('a rapier', 208),
  shortsword: melee('a shortsword', 208),
  greatsword: melee('a two-handed greatsword', 208),
  rhomphaia: melee('a rhomphaia', 208),
  sickle_sword: melee('a two-handed sickle-sword', 208),
  war_hammer: melee('a war hammer', 209),
  great_hammer: melee('a two-handed great hammer', 209),
  maul: melee('a heavy maul', 209),
  club: melee('a club', 209),
  heavy_mace: melee('a heavy mace', 209),
  light_mace: melee('a light mace', 209),
  singlestick: melee('a singlestick', 209),
  mace_2h: melee('a two-handed mace', 209),
  quarterstaff: melee('a quarterstaff', 209),
  javelin_1h: melee('a javelin held as a hand weapon', 209),
  shortspear_1h: melee('a one-handed shortspear', 209),
  lance: melee('a lance, usually from horseback', 209),
  shortspear_2h: melee('a shortspear held in both hands', 209),
  longspear: melee('a two-handed longspear', 209),
  pike: melee('a long pike', 209),
  whip: { page: 208, summary: 'Lash, entangle, or disarm a foe at short reach with a whip.' },
  fist: { page: 208, summary: 'Punch an opponent barehanded or with a cestus.' },
  grapple: { page: 208, summary: 'Seize, hold, throw, or immobilize an opponent barehanded.' },
  kick: { page: 208, summary: 'Strike an opponent with your feet or legs instead of your hands.' },

  // Missile weapons
  composite_bow: missile('a powerful composite bow'),
  elf_bow: missile('an elf bow'),
  self_bow: missile('a simple self bow'),
  crossbow: missile('a light, heavy, or repeating crossbow'),
  arbalest: missile('a massive arbalest'),
  atlatl: missile('darts or javelins launched from an atlatl'),
  dart: missile('thrown darts'),
  javelin: missile('a thrown javelin'),
  thrown_shortspear: missile('a thrown shortspear'),
  thrown_axe: missile('a thrown axe'),
  thrown_dagger: missile('a thrown dagger'),
  thrown_rock: missile('a thrown rock'),
  sling: missile('stones or bullets cast from a sling'),
  staff_sling: missile('a staff sling'),
  pole_lasso: { page: 209, summary: 'Snare and drag down a target, often an animal, with a lasso on a pole.' },

  // Shields
  shield_small: shield('small'),
  shield_medium: shield('medium'),
  shield_large: shield('large'),
}

export const CHAR_INFO: Record<'str' | 'con' | 'siz' | 'dex' | 'int' | 'pow' | 'cha', AbilityInfo> = {
  str: { page: 51, summary: 'Physical might; affects damage bonus, carrying capacity, and which weapons you can wield.' },
  con: { page: 51, summary: 'Health and stamina; affects hit points, healing, and resisting poison and disease.' },
  siz: { page: 51, summary: 'Body mass; adds to hit points and damage bonus and influences strike rank.' },
  dex: { page: 52, summary: 'Speed and coordination; improves agility and sets how quickly you act in melee.' },
  int: { page: 52, summary: 'Reasoning and memory; supports Knowledge skills and limits sorcery spells held in mind.' },
  pow: { page: 52, summary: 'Soul strength and magical potency; sets magic points and pits against foes in magic.' },
  cha: { page: 52, summary: 'Force of personality and leadership; boosts social skills and caps magic you can carry.' },
}

export const RUNE_INFO: Record<string, AbilityInfo> = {
  darkness: { page: 48, summary: 'Patient, secretive, and cold, sometimes cruel; tied to stealth, hearing, and bulk.' },
  water: { page: 48, summary: 'Fluid and changeable, quick to shift moods and plans; linked to agility.' },
  earth: { page: 48, summary: 'Grounded, practical, and sensual, valuing comfort and the tangible world.' },
  fire: { page: 48, summary: 'Idealistic, pure, and perceptive, drawn to clarity and high principles.' },
  air: { page: 49, summary: 'Proud, passionate, and quick to violence; impulsive and hard to predict.' },
  moon: { page: 49, summary: 'Mystical, seeking freedom of the spirit from fear and ignorance; accepts cosmic balance.' },
  man: { page: 50, summary: 'Civilized and sociable, valuing law and settled lands over the wilderness.' },
  beast: { page: 50, summary: 'Wild and untamed, at home in the wilderness and uneasy among farms and towns.' },
  fertility: { page: 50, summary: 'Generous and sensual, embracing life, pleasure, and the giving of oneself.' },
  death: { page: 50, summary: 'Ascetic, relentless, and ruthless, renouncing worldly comforts and willing to cut ties.' },
  harmony: { page: 50, summary: 'Puts the community first; a compassionate peacemaker who seeks compromise.' },
  disorder: { page: 50, summary: 'Self-centered and contrary, chasing personal gain or pleasure above others.' },
  truth: { page: 50, summary: 'Sees reality as objective and states facts plainly, whatever the consequences.' },
  illusion: { page: 50, summary: 'Treats reality as malleable; comfortable bending facts or inventing falsehoods.' },
  stasis: { page: 50, summary: 'Steadfast and resistant to change; admirably determined or stubbornly rigid.' },
  movement: { page: 50, summary: 'Restless, ambitious, and rebellious; adapts fast but can act rashly.' },
}

export const PASSION_INFO: Record<'Devotion' | 'Fear' | 'Hate' | 'Honor' | 'Love' | 'Loyalty', AbilityInfo> = {
  Devotion: { page: 233, summary: 'Heartfelt religious commitment to a deity, letting a spark of the god guide you.' },
  Fear: { page: 233, summary: 'Dread of a specific foe or group; can drive flight, caution, or desperate resistance.' },
  Hate: { page: 233, summary: 'Deep enmity toward a group or person that can fuel fierce action against them.' },
  Honor: { page: 234, summary: 'A personal code of conduct and martial virtue; breaking it costs you standing.' },
  Love: { page: 235, summary: 'Deep affection for family, a partner, or a group that you will protect and serve.' },
  Loyalty: { page: 234, summary: 'Commitment to a clan, tribe, city, temple, or leader, and duty toward it.' },
}

export const DERIVED_INFO: Record<
  'hp' | 'mp' | 'healing' | 'damageBonus' | 'spiritDamage' | 'dexSR' | 'sizSR' | 'maxEnc' | 'move' | 'runePoints' | 'reputation',
  AbilityInfo
> = {
  hp: { page: 54, summary: 'How much physical harm you can take overall; also spread among hit locations.' },
  mp: { page: 54, summary: 'Spiritual energy, equal to POW, spent to cast spirit magic and fuel other magic.' },
  healing: { page: 55, summary: 'Hit points naturally recovered each week of rest, based on CON.' },
  damageBonus: { page: 55, summary: 'Extra damage added to melee blows, based on STR plus SIZ.' },
  spiritDamage: { page: 55, summary: 'Damage your soul deals in spirit combat, based on POW plus CHA.' },
  dexSR: { page: 56, summary: 'Part of melee timing from DEX; lower means you act sooner in a round.' },
  sizSR: { page: 56, summary: 'Part of melee timing from SIZ, reflecting reach; lower means sooner.' },
  maxEnc: { page: 56, summary: 'How much gear you can carry before becoming encumbered, from STR and CON.' },
  move: { page: 195, summary: 'Movement rate per melee round; humans normally move 8 units.' },
  runePoints: { page: 73, summary: 'Divine power granted by your cult, spent to cast Rune spells and restored by worship.' },
  reputation: { page: 237, summary: 'How widely known you are; a successful roll means someone recognizes your name or deeds.' },
}
