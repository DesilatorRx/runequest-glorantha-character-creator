// Spirit spell reference info: printed page of each spell's entry in the RuneQuest: Roleplaying in Glorantha
// core rulebook (Spirit Magic chapter) plus a short summary written in our own words, and the stat-line
// range/duration where the entry gives one. Not rules text; see the book for full details.

export interface SpellInfo {
  page: number
  summary: string
  range?: 'ranged' | 'touch' | 'self' | 'special'
  duration?: 'instant' | 'temporal' | 'permanent' | 'special'
  focused?: boolean
}

export const SPIRIT_SPELL_INFO: Record<string, SpellInfo> = {
  befuddle: { page: 256, summary: 'Confuses a target who loses a POW contest; they cannot attack or raise an alarm but can still defend.', range: 'ranged', duration: 'temporal' },
  binding_enchantment: { page: 258, summary: 'Ritual that prepares an item to house a spirit or other otherworld being, costing POW.' },
  bladesharp: { page: 258, summary: 'Adds +1 damage and +5% attack chance per point to a bladed or piercing weapon.', range: 'touch', duration: 'temporal' },
  bludgeon: { page: 258, summary: 'Adds +1 damage and +5% attack chance per point to a crushing weapon.', range: 'touch', duration: 'temporal' },
  control_entity: { page: 258, summary: 'Forces a spirit or creature of one type, already beaten to 0 MP in spirit combat, to obey your commands.', range: 'ranged', duration: 'temporal' },
  coordination: { page: 258, summary: 'Grants +3 DEX: one strike rank faster and +5% to agility, manipulation and stealth skills.', range: 'touch', duration: 'temporal' },
  countermagic: { page: 258, summary: 'Shield against incoming spells; cancels weaker magic, trades out with equal spells, half effect versus Rune magic.', range: 'ranged', duration: 'temporal' },
  darkwall: { page: 259, summary: 'Conjures a movable 10-square-meter screen of darkness that blocks sight and light.', range: 'ranged', duration: 'temporal' },
  demoralize: { page: 259, summary: 'Saps a target\'s will to fight: attacks at half chance, only defensive magic. Cancels Fanaticism.', range: 'ranged', duration: 'temporal' },
  detect_substance: { page: 260, summary: 'Points you toward one chosen substance and makes it glow; dense stone or metal blocks it.', range: 'ranged', duration: 'instant', focused: true },
  detect_enemies: { page: 259, summary: 'Reveals rough direction and distance of anyone meaning you harm, or of one chosen person.', range: 'ranged', duration: 'instant', focused: true },
  detect_life: { page: 259, summary: 'Senses living creatures of human size or larger, with direction, distance and a rough size class.', range: 'ranged', duration: 'instant', focused: true },
  detect_magic: { page: 259, summary: 'Locates enchanted items and magic objects nearby and makes them glow, without saying what they are.', range: 'ranged', duration: 'instant', focused: true },
  detect_spirit: { page: 259, summary: 'Senses nearby spirits and whether each is weaker or stronger than POW 19.', range: 'ranged', duration: 'instant', focused: true },
  detect_trap: { page: 260, summary: 'Highlights a 3 m area around any deliberate trap or ambush, but not natural hazards.', range: 'ranged', duration: 'instant', focused: true },
  detect_undead: { page: 260, summary: 'Senses undead like zombies or vampires, with direction, distance and rough size.', range: 'ranged', duration: 'instant', focused: true },
  dispel_magic: { page: 260, summary: 'Removes an active spell: 1 point per spirit/sorcery point, 2 per Rune point; must beat the whole spell.', range: 'ranged', duration: 'instant' },
  disruption: { page: 260, summary: 'Overcome the target\'s POW to deal 1D3 damage to a random location, ignoring armor.', range: 'ranged', duration: 'instant' },
  distraction: { page: 260, summary: 'Lures a spirit (or foe) off its current victim so it turns to fight you instead.', range: 'ranged', duration: 'instant' },
  dullblade: { page: 261, summary: 'Cast on an enemy melee weapon: -1 damage and -5% to hit per point.', range: 'ranged', duration: 'temporal' },
  extinguish: { page: 261, summary: 'Puts out fires and cools hot things; bigger blazes need more points.', range: 'ranged', duration: 'instant' },
  fanaticism: { page: 261, summary: 'Boosts attack chance by half again, but no parrying, halved Dodge and only attack spells. Cancels Demoralize.', range: 'ranged', duration: 'temporal' },
  farsee: { page: 261, summary: 'Each point halves how far away things look to you, like a toggleable spyglass.', range: 'ranged', duration: 'temporal' },
  firearrow: { page: 261, summary: 'Turns a missile into a flaming shot dealing 3D6 fire damage instead of normal damage; cannot impale.', range: 'touch', duration: 'instant' },
  fireblade: { page: 262, summary: 'Wreathes an edged weapon or spear in fire so hits deal 3D6 plus damage bonus.', range: 'touch', duration: 'temporal' },
  glamour: { page: 262, summary: 'Grants +8 CHA: better spirit combat damage, +10% Communication and a Magic skill boost.', range: 'touch', duration: 'temporal' },
  glue: { page: 262, summary: 'Makes 5 cm squares of sticky magical glue with STR 10 per point; never binds living tissue.', range: 'touch', duration: 'temporal' },
  heal: { page: 262, summary: 'Restores 1 hit point per point to a touched location; 2 points stanch a wound, 6 reattach a limb.', range: 'touch', duration: 'instant' },
  ignite: { page: 262, summary: 'Sets any burnable object alight with a small flame; cannot ignite skin.', range: 'ranged', duration: 'instant' },
  ironhand: { page: 262, summary: 'Adds +1 damage and +5% attack chance per point to unarmed attacks.', range: 'touch', duration: 'temporal' },
  lantern: { page: 263, summary: 'Makes a flat surface such as a shield glow like a torch, lighting a 12 m half-circle ahead.', range: 'ranged', duration: 'temporal', focused: true },
  light: { page: 263, summary: 'Makes an object shed reading-level light in a 10 m radius.', range: 'ranged', duration: 'temporal' },
  lightwall: { page: 263, summary: 'Creates a movable 10-square-meter wall of glare: opaque to enemies, see-through from your side.', range: 'ranged', duration: 'temporal' },
  magic_point_enchantment: { page: 263, summary: 'Ritual that sacrifices POW to make an item store 1D10 refillable magic points per POW.' },
  mobility: { page: 263, summary: 'Doubles the target\'s movement rate and makes them one strike rank faster.', range: 'ranged', duration: 'temporal' },
  multimissile: { page: 263, summary: 'Each point adds one extra magical copy of an arrow or thrown missile when it is loosed.', range: 'touch', duration: 'temporal' },
  parry: { page: 263, summary: 'Adds +5% parry chance per point to a shield.', range: 'ranged', duration: 'temporal' },
  protection: { page: 263, summary: 'Each point adds 1 armor point to every hit location.', range: 'ranged', duration: 'temporal' },
  repair: { page: 264, summary: 'Mends a broken object with all its pieces, fixing 1D10 item hit points per point.', range: 'touch', duration: 'instant' },
  rivereyes: { page: 264, summary: 'Lets you see clearly across the water surface without glare or distortion.', range: 'self', duration: 'temporal' },
  second_sight: { page: 264, summary: 'Shows the POW auras of living things and enchantments, gauging strength relative to yours.', range: 'ranged', duration: 'temporal' },
  shimmer: { page: 264, summary: 'Blurs the target\'s outline: -5% per point to anyone trying to hit them.', range: 'ranged', duration: 'temporal' },
  silence: { page: 264, summary: 'Muffles the incidental noise of a person or object moving, like clanking armor.', range: 'touch', duration: 'temporal' },
  sleep: { page: 264, summary: 'Overcome the target\'s POW to put them into deep sleep until hurt or attacked by magic.', range: 'ranged', duration: 'temporal' },
  slow: { page: 264, summary: 'Halves the target\'s movement rate and makes them one strike rank slower.', range: 'ranged', duration: 'temporal' },
  speedart: { page: 264, summary: 'Gives one missile +15% to hit and +3 damage on its next use.', range: 'ranged', duration: 'temporal' },
  spell_matrix_enchantment: { page: 265, summary: 'Ritual that sacrifices POW to embed a spirit spell in an item, usable by whoever holds it.' },
  spirit_binding: { page: 265, summary: 'Binds a defeated spirit into a prepared item or a familiar animal.', range: 'ranged', duration: 'permanent' },
  spirit_screen: { page: 265, summary: 'Each point soaks 1 point of spirit combat damage taken by the target.', range: 'ranged', duration: 'temporal' },
  strength: { page: 265, summary: 'Grants +8 STR: one step higher damage bonus and modest agility/manipulation bonuses.', range: 'touch', duration: 'temporal' },
  summon_entity: { page: 265, summary: 'Ritual calling a spirit of a chosen type; must spend at least its MP, and it arrives uncontrolled.', duration: 'special' },
  vigor: { page: 267, summary: 'Grants +3 CON: +3 total hit points and +1 to every hit location.', range: 'touch', duration: 'temporal' },
  visibility: { page: 267, summary: 'Pulls a spirit into the mundane world in a ghostly visible form so it can interact and be targeted.', range: 'ranged', duration: 'temporal' },
}
