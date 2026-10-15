import type { CharId, DataSource, Homeland, HomelandRegion, PassionDef, RuneId, SkillGrant } from '../engine/types'

// Homelands checked against the RuneQuest: Roleplaying in Glorantha core rulebook:
//   overview, Common Cults and Suggested Occupations pp.24–26; base passions p.27; homeland Rune modifiers p.45;
//   homeland characteristic modifiers p.53; cultural skills and weapons pp.60–63; Local Modifiers in the
//   Homelands chapter pp.106–130. Warrior types per homeland follow the Warrior occupation entries pp.71–73.
// Speak Own Language (50) and Customs (25) are automatic, so they are not repeated here.

const P = (kind: PassionDef['kind'], target: string): PassionDef => ({ kind, target, value: 60 })
const BOW_OR_SLING = { choose: ['composite_bow', 'sling'], bonus: 10, label: 'Composite Bow or Sling' }
/** "Ride (any)": the book lets the adventurer pick the mount. */
const RIDE_ANY = {
  choose: ['ride:Horse', 'ride:Bison', 'ride:High Llama', 'ride:Impala', 'ride:Sable Antelope'], bonus: 5, label: 'Ride (any)',
}
/** The book's "Orlanth" covers its subcults, including Vinga. */
const ORLANTH = ['orlanth_adventurous', 'orlanth_thunderous', 'vinga']

/** A passion from a local modifier: new at 60%, or +10% if already held. */
const LOCAL = (kind: PassionDef['kind'], target: string) => ({ kind, target, value: 60, bonus: 10 })

/** Praxian tribes share Tradetalk +10% and Survival +10% (p.62); the rest is per tribe. */
function praxTribe(t: {
  id: string; name: string; culture: string; rune: RuneId; mount: string; hint: string
  weapons: SkillGrant[]; cults: string[]; occupations: string[]
  charMods?: Partial<Record<CharId, number>>; regions?: HomelandRegion[]; source?: DataSource
}): Homeland {
  return {
    id: t.id, name: t.name, culture: t.culture, language: 'Praxian', rune: t.rune, hint: t.hint, source: t.source ?? 'book',
    skills: [
      { skill: 'herd', bonus: 30 }, { skill: 'peaceful_cut', bonus: 15 }, { skill: `ride:${t.mount}`, bonus: 35 },
      { skill: 'spirit_combat', bonus: 20 }, { skill: 'survival', bonus: 10 }, { skill: 'speak_other:Tradetalk', bonus: 10 },
      ...t.weapons,
    ],
    culturalWeapons: t.weapons.flatMap(g => ('skill' in g ? [g.skill] : Array.isArray(g.choose) ? g.choose : [])),
    passions: [P('Hate', 'Chaos'), P('Love', 'family'), P('Loyalty', 'tribe')],
    cults: t.cults,
    occupations: t.occupations,
    ...(t.charMods ? { charMods: t.charMods } : {}),
    ...(t.regions ? { regions: t.regions } : {}),
  }
}

export const HOMELANDS: Homeland[] = [
  {
    id: 'sartar',
    name: 'Sartar',
    culture: 'Heortling',
    language: 'Heortling',
    rune: 'air',
    source: 'book',
    hint: 'Storm-worshipping hill clans of Dragon Pass, newly freed from Lunar occupation.',
    skills: [
      { skill: 'dance', bonus: 5 }, { skill: 'farm', bonus: 20 }, { skill: 'herd', bonus: 10 },
      RIDE_ANY, { skill: 'sing', bonus: 10 }, { skill: 'speak_other:Tradetalk', bonus: 10 },
      { skill: 'spirit_combat', bonus: 15 },
      { skill: 'battle_axe_1h', bonus: 10 }, { skill: 'broadsword', bonus: 15 }, BOW_OR_SLING,
      { skill: 'dagger', bonus: 10 }, { skill: 'javelin', bonus: 10 }, { skill: 'shield_large', bonus: 10 },
      { skill: 'shield_medium', bonus: 15 }, { skill: 'shortspear_1h', bonus: 10 },
    ],
    culturalWeapons: ['battle_axe_1h', 'broadsword', 'composite_bow', 'sling', 'dagger', 'javelin', 'shield_large', 'shield_medium', 'shortspear_1h'],
    passions: [P('Love', 'family'), P('Loyalty', 'clan'), P('Loyalty', 'tribe')],
    cults: [...ORLANTH, 'ernalda', 'babeester_gor', 'chalana_arroy', 'eurmal', 'humakt', 'issaries', 'lhankor_mhy', 'maran_gor', 'storm_bull', 'yelmalio'],
    occupations: ['farmer', 'noble', 'priest', 'warrior_heavy_infantry', 'warrior_light_infantry', 'warrior_heavy_cavalry', 'warrior_light_cavalry'],
    regions: [
      { id: 'colymar', name: 'Colymar Tribe', passions: [{ kind: 'Loyalty', target: 'Colymar Tribe', bonus: 10 }], note: 'The +10% goes to your tribe Loyalty, named for the Colymar.' },
      { id: 'boldhome', name: 'Boldhome', passions: [LOCAL('Loyalty', 'Sartar')] },
      { id: 'lismelder', name: 'Lismelder Tribe', passions: [LOCAL('Hate', 'Undead')] },
      { id: 'sun_dome_temple', name: 'Sun Dome Temple', rune: { rune: 'fire', bonus: 10, replacesHomeland: true } },
      { id: 'pavis', name: 'Pavis (Prax)', passions: [LOCAL('Loyalty', 'Argrath')], note: 'Heortling city in Prax, described in the Prax section.' },
      { id: 'sun_county', name: 'Sun County (Prax)', rune: { rune: 'fire', bonus: 10, replacesHomeland: true }, note: 'Yelmalio theocracy in Prax.' },
    ],
  },
  {
    id: 'esrolia',
    name: 'Esrolia',
    culture: 'Esrolian',
    language: 'Esrolian',
    rune: 'earth',
    source: 'book',
    hint: 'Rich, ancient land of many cities, ruled by Earth priestesses and grandmothers.',
    skills: [
      { skill: 'bargain', bonus: 5 }, { skill: 'dance', bonus: 10 }, { skill: 'farm', bonus: 25 }, { skill: 'first_aid', bonus: 5 },
      { skill: 'intrigue', bonus: 5 }, { skill: 'sing', bonus: 5 }, { skill: 'speak_other:Tradetalk', bonus: 20 },
      { skill: 'spirit_combat', bonus: 15 },
      { skill: 'battle_axe_1h', bonus: 15 }, { skill: 'shield_large', bonus: 10 }, { skill: 'shield_medium', bonus: 15 },
      { skill: 'rapier', bonus: 10 }, { skill: 'self_bow', bonus: 10 }, { skill: 'shield_small', bonus: 15 },
      { skill: 'shortspear_1h', bonus: 10 }, { skill: 'thrown_axe', bonus: 10 },
    ],
    culturalWeapons: ['battle_axe_1h', 'shield_large', 'shield_medium', 'rapier', 'self_bow', 'shield_small', 'shortspear_1h', 'thrown_axe'],
    passions: [P('Love', 'family'), P('Loyalty', 'city'), P('Loyalty', 'clan')],
    cults: ['ernalda', 'argan_argar', 'babeester_gor', 'chalana_arroy', 'eurmal', 'issaries', 'lhankor_mhy', 'maran_gor', ...ORLANTH],
    occupations: ['healer', 'merchant', 'priest', 'scribe', 'thief'],
    regions: [
      { id: 'ezel', name: 'Ezel', passions: [{ kind: 'Devotion', target: 'Ernalda', value: 60 }], rune: { rune: 'earth', bonus: 10 } },
      { id: 'longsi_land', name: 'Longsi Land', skills: [{ skill: 'herd', bonus: 10 }], rune: { rune: 'air', bonus: 5 } },
      { id: 'necropolis', name: 'Necropolis', skills: [{ skill: 'prepare_corpse', bonus: 20 }], rune: { rune: 'death', bonus: 10 } },
      { id: 'nochet', name: 'Nochet', skills: [{ skill: 'bargain', bonus: 10 }, { skill: 'speak_other:Tradetalk', bonus: 10 }] },
      { id: 'north_esrolia', name: 'North Esrolia', skills: [{ skill: 'farm', bonus: 10 }], rune: { rune: 'earth', bonus: 5 } },
      { id: 'north_march', name: 'North March', skills: [{ skill: 'herd', bonus: 10 }], rune: { rune: 'air', bonus: 5 } },
      { id: 'rhigos', name: 'Rhigos', skills: [{ skill: 'bargain', bonus: 10 }], rune: { rune: 'fertility', bonus: 5 } },
      { id: 'south_esrolia', name: 'South Esrolia', skills: [{ skill: 'farm', bonus: 10 }], rune: { rune: 'earth', bonus: 5 } },
    ],
  },
  {
    id: 'grazelands',
    name: 'Grazelands',
    culture: 'Grazeland Pony Breeders',
    language: 'Pure Horse Tongue',
    rune: 'fire',
    source: 'book',
    hint: 'Proud horse-nomads of the Sun who rule their vendref farmers.',
    skills: [
      { skill: 'herd', bonus: 35 }, { skill: 'ride:Horse', bonus: 35 }, { skill: 'speak_other:Tradetalk', bonus: 10 },
      { skill: 'spirit_combat', bonus: 15 },
      { skill: 'broadsword', bonus: 10 }, { skill: 'composite_bow', bonus: 15 }, { skill: 'dagger', bonus: 10 },
      { skill: 'lance', bonus: 15 }, { skill: 'shield_medium', bonus: 10 }, { skill: 'shield_small', bonus: 15 },
    ],
    culturalWeapons: ['broadsword', 'composite_bow', 'dagger', 'lance', 'shield_medium', 'shield_small'],
    // The book's third passion is Loyalty to the Feathered Horse Queen OR the Luminous Stallion King; edit if needed.
    passions: [P('Love', 'family'), P('Loyalty', 'clan'), P('Loyalty', 'Feathered Horse Queen')],
    cults: ['yelm', 'ernalda', 'humakt', 'issaries', ...ORLANTH],
    occupations: ['herder', 'noble', 'warrior_heavy_cavalry', 'warrior_light_cavalry'],
  },
  praxTribe({
    id: 'prax_bison', name: 'Prax (Bison Tribe)', culture: 'Bison Tribe', rune: 'air', mount: 'Bison',
    hint: 'The largest Praxian tribe: big, slow, and terrible on the charge.',
    charMods: { siz: 2, dex: -2 },
    weapons: [
      { skill: 'dagger', bonus: 10 }, { skill: 'lance', bonus: 15 }, { skill: 'broadsword', bonus: 10 },
      { skill: 'javelin', bonus: 10 }, { skill: 'shield_medium', bonus: 10 },
    ],
    cults: ['waha', 'daka_fal', 'eiritha', 'storm_bull', ...ORLANTH],
    occupations: ['assistant_shaman', 'herder', 'warrior_heavy_cavalry'],
  }),
  praxTribe({
    id: 'prax_high_llama', name: 'Prax (High Llama Tribe)', culture: 'High Llama Tribe', rune: 'water', mount: 'High Llama',
    hint: 'Smallest of the great tribes, riding towering high llamas.',
    charMods: { siz: 1, dex: -1 },
    weapons: [
      { skill: 'dagger', bonus: 10 }, { skill: 'lance', bonus: 15 }, { skill: 'dagger_axe', bonus: 10 }, { skill: 'pole_lasso', bonus: 10 },
    ],
    cults: ['waha', 'daka_fal', 'eiritha', 'storm_bull'],
    occupations: ['assistant_shaman', 'herder', 'warrior_heavy_cavalry'],
  }),
  praxTribe({
    id: 'prax_impala', name: 'Prax (Impala Tribe)', culture: 'Impala Tribe', rune: 'fire', mount: 'Impala',
    hint: 'Small, quick archers riding swift impalas; the most numerous tribe.',
    charMods: { siz: -2, dex: 2 },
    weapons: [
      { skill: 'dagger', bonus: 5 }, { skill: 'shortsword', bonus: 10 }, { skill: 'composite_bow', bonus: 20 },
      { skill: 'dart', bonus: 10 }, { skill: 'shield_small', bonus: 10 },
    ],
    cults: ['waha', 'daka_fal', 'eiritha', 'storm_bull', 'yelmalio'],
    occupations: ['assistant_shaman', 'herder', 'warrior_light_cavalry'],
  }),
  praxTribe({
    id: 'prax_sable', name: 'Prax (Sable Tribe)', culture: 'Sable Tribe', rune: 'moon', mount: 'Sable Antelope',
    hint: 'Antelope riders who once sided with the Lunar Empire.',
    weapons: [
      // Order kept stable: saved homelandPicks are indexed by position.
      { skill: 'dagger', bonus: 10 }, { skill: 'shield_medium', bonus: 10 },
      { choose: ['kopis', 'battle_axe_1h'], bonus: 15, label: 'Kopis or 1H Axe' },
      { choose: ['lance', 'shortspear_1h'], bonus: 10, label: 'Lance or Short Spear' },
      { choose: ['composite_bow', 'javelin'], bonus: 10, label: 'Composite Bow or Javelin' },
    ],
    cults: ['waha', 'seven_mothers', 'eiritha', 'yelmalio'],
    occupations: ['assistant_shaman', 'herder', 'warrior_heavy_cavalry', 'warrior_light_cavalry'],
  }),
  praxTribe({
    id: 'prax_pol_joni', name: 'Prax (Pol-Joni)', culture: 'Pol-Joni', rune: 'air', mount: 'Horse',
    hint: 'Horse-riding Orlanthi from Dragon Pass who fought their way onto the plains.',
    weapons: [
      { skill: 'dagger', bonus: 10 }, { skill: 'lance', bonus: 10 }, { skill: 'broadsword', bonus: 15 },
      { skill: 'composite_bow', bonus: 10 }, { skill: 'shield_medium', bonus: 15 },
    ],
    cults: [...ORLANTH, 'humakt', 'eiritha', 'storm_bull'],
    occupations: ['assistant_shaman', 'herder', 'warrior_heavy_cavalry', 'warrior_light_cavalry'],
  }),
  {
    id: 'lunar_tarsh',
    name: 'Lunar Tarsh',
    culture: 'Lunar Provincial',
    language: 'New Pelorian',
    rune: 'moon',
    source: 'book',
    hint: 'Loyal province of the Lunar Empire, worshipping the Red Goddess and her Seven Mothers.',
    skills: [
      { skill: 'celestial_lore', bonus: 5 }, { skill: 'dance', bonus: 5 }, { skill: 'farm', bonus: 25 }, { skill: 'intrigue', bonus: 5 },
      { skill: 'speak_other:Tarshite', bonus: 20 }, { skill: 'speak_other:Tradetalk', bonus: 10 }, { skill: 'spirit_combat', bonus: 15 },
      BOW_OR_SLING, { skill: 'dagger', bonus: 10 }, { skill: 'javelin', bonus: 10 }, { skill: 'kopis', bonus: 10 },
      { skill: 'shield_large', bonus: 15 }, { skill: 'shield_medium', bonus: 10 },
      { choose: ['shortspear_1h', 'shortspear_2h'], bonus: 15, label: '1H or 2H Spear' },
    ],
    culturalWeapons: ['composite_bow', 'sling', 'dagger', 'javelin', 'kopis', 'shield_large', 'shield_medium', 'shortspear_1h', 'shortspear_2h'],
    passions: [P('Love', 'family'), P('Loyalty', 'city'), P('Loyalty', 'Red Emperor')],
    cults: ['seven_mothers', 'ernalda', 'chalana_arroy', 'humakt', 'issaries', 'lhankor_mhy', 'yelmalio'],
    occupations: ['noble', 'priest', 'scribe', 'warrior_heavy_infantry', 'warrior_light_infantry', 'warrior_heavy_cavalry', 'warrior_light_cavalry'],
    regions: [
      { id: 'bagnot', name: 'Bagnot', rune: { rune: 'earth', bonus: 10, replacesHomeland: true } },
      { id: 'goldedge', name: 'Goldedge', rune: { rune: 'fire', bonus: 10, replacesHomeland: true } },
    ],
  },
  {
    id: 'old_tarsh',
    name: 'Old Tarsh',
    culture: 'Tarshite',
    language: 'Tarshite',
    rune: 'earth',
    source: 'book',
    hint: 'Highland rebels of the Shaker Temple who never accepted Lunar rule.',
    skills: [
      { skill: 'dance', bonus: 5 }, { skill: 'farm', bonus: 15 }, RIDE_ANY, { skill: 'sing', bonus: 10 },
      { skill: 'speak_other:Tradetalk', bonus: 10 }, { skill: 'spirit_combat', bonus: 15 }, { skill: 'survival', bonus: 5 },
      { skill: 'dagger', bonus: 10 }, { skill: 'battle_axe_1h', bonus: 15 }, { skill: 'broadsword', bonus: 10 }, BOW_OR_SLING,
      { skill: 'javelin', bonus: 10 }, { skill: 'shield_large', bonus: 10 }, { skill: 'shield_medium', bonus: 15 },
      { skill: 'shortspear_1h', bonus: 10 },
    ],
    culturalWeapons: ['dagger', 'battle_axe_1h', 'broadsword', 'composite_bow', 'sling', 'javelin', 'shield_large', 'shield_medium', 'shortspear_1h'],
    passions: [P('Love', 'family'), P('Loyalty', 'clan'), P('Loyalty', 'Shaker Temple')],
    cults: ['maran_gor', ...ORLANTH, 'ernalda', 'odayla'],
    occupations: ['bandit', 'herder', 'hunter', 'warrior_light_infantry', 'warrior_heavy_cavalry', 'warrior_light_cavalry'],
  },
]
