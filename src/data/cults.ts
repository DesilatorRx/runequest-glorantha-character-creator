import type { Cult, PassionOption, SkillGrant, SkillKey } from '../engine/types'

// Cults an adventurer can be initiated into at creation, checked against the core rulebook:
// Step 6: Cult (pp.73-79) for starting skills, starting spirit magic, suggested special Rune magic and favored passions;
// the Runes & Cults table (p.47) for Runes; the Rune Cults chapter (pp.288-311) for prohibited spells and restrictions.
// Only Runes the adventurer sheet tracks are listed (Light is shown as Fire; Spirit, Mastery etc. are omitted).
// `starting` are the entry's Cult Starting Skills (fixed bonuses); `skills` is every skill those grants can land on,
// which is where the +20% / +15% initiation picks go. Spells with a size or element limit use the base spell id; the
// limit is in the hint.

const P = (kind: PassionOption['kind'], target: string): PassionOption => ({ kind, target })
const S = (skill: SkillKey, bonus: number): SkillGrant => ({ skill, bonus })
const pick = (choose: SkillKey[], bonus: number, label: string): SkillGrant => ({ choose, bonus, label })

/** Every skill key a starting grant can apply to ('@weapon' / '@cultural_weapon' for open weapon picks). */
const skillsOf = (grants: SkillGrant[]): SkillKey[] => [...new Set(grants.flatMap(g =>
  'skill' in g ? [g.skill] : Array.isArray(g.choose) ? g.choose : typeof g.choose === 'object' ? [] : g.choose === 'cultural_weapon' ? ['@cultural_weapon'] : ['@weapon']))]

type CultDef = Omit<Cult, 'skills'> & { starting: SkillGrant[] }
const cult = (d: CultDef): Cult => ({ ...d, skills: skillsOf(d.starting) })

const SWORDS_1H = ['broadsword', 'kopis', 'rapier', 'shortsword']
const SWORDS = [...SWORDS_1H, 'greatsword', 'rhomphaia', 'sickle_sword']
const AXES_1H = ['battle_axe_1h', 'small_axe']
const ORLANTH = ['orlanth_adventurous', 'orlanth_thunderous', 'vinga']

/** Every spirit spell except the enchantments (for "Cult Spirit Magic: All"). */
const ALL_SPIRIT = ['befuddle', 'bladesharp', 'bludgeon', 'control_entity', 'coordination', 'countermagic', 'darkwall', 'demoralize',
  'detect_enemies', 'detect_life', 'detect_magic', 'detect_spirit', 'detect_substance', 'detect_trap', 'detect_undead', 'dispel_magic',
  'disruption', 'distraction', 'dullblade', 'extinguish', 'fanaticism', 'farsee', 'firearrow', 'fireblade', 'glamour', 'glue', 'heal',
  'ignite', 'ironhand', 'lantern', 'light', 'lightwall', 'mobility', 'multimissile', 'parry', 'protection', 'repair', 'rivereyes',
  'second_sight', 'shimmer', 'silence', 'sleep', 'slow', 'speedart', 'spirit_screen', 'strength', 'summon_entity', 'vigor', 'visibility']

const ORLANTH_STARTING = [S('orate', 15), S('speak_other:Stormspeech', 20), S('sing', 10)]
const ORLANTH_SPIRIT = ['bladesharp', 'demoralize', 'detect_enemies', 'disruption', 'heal', 'mobility', 'protection', 'strength']
const ORLANTH_RUNE = ['dismiss_elemental_type', 'increase_decrease_wind', 'summon_elemental_type', 'summons_of_evil', 'wind_warp']
const ADVENTUROUS_RUNE = [...ORLANTH_RUNE, 'dark_walk', 'earth_shield', 'flight', 'leap', 'lightning', 'mist_cloud', 'shield', 'wind_words']
const ORLANTH_PASSIONS = [P('Devotion', 'Orlanth'), P('Hate', 'Chaos'), P('Honor', ''), P('Loyalty', 'temple')]
const ORLANTH_ASSOCIATED = ['chalana_arroy', 'ernalda', 'eurmal', 'issaries', 'lhankor_mhy', 'odayla', 'storm_bull', 'yinkin']

export const CULTS: Cult[] = [
  cult({
    id: 'argan_argar', name: 'Argan Argar', runes: ['darkness', 'harmony'], source: 'book',
    hint: 'Troll god of the surface world, go-between for trolls and humans. Darkness elementals small or medium only; Enchant Lead is his Enchant (metal).',
    starting: [S('speak_other:Darktongue', 20), S('read_write:Darktongue', 15), S('sing', 10)],
    spiritSpells: ['darkwall', 'detect_magic', 'glamour', 'protection', 'vigor'],
    prohibitedSpirit: ['light', 'lightwall'],
    runeSpells: ['create_shadow', 'dark_walk', 'dismiss_elemental_type', 'enchant_metal', 'safe', 'summon_elemental_type', 'suppress_lodril'],
    passions: [P('Devotion', 'Argan Argar'), P('Loyalty', 'temple')],
    associated: ['ernalda'],
  }),
  cult({
    id: 'babeester_gor', name: 'Babeester Gor', runes: ['earth', 'death'], source: 'book',
    hint: 'Axe-wielding avenger and guardian of the Earth temples. Women only. Earth elementals small only.',
    starting: [pick(AXES_1H, 15, '1H Axe'), pick(['battle_axe_2h', 'great_axe', 'dagger_axe'], 20, '2H Axe'), S('intimidate', 10), S('speak_other:Earthtongue', 10)],
    spiritSpells: ['bladesharp', 'demoralize', 'detect_enemies', 'disruption', 'heal', 'strength', 'vigor'],
    runeSpells: ['axe_trance', 'berserker', 'dismiss_elemental_type', 'earth_shield', 'shield', 'slash', 'summon_elemental_type'],
    passions: [P('Devotion', 'Babeester Gor'), P('Loyalty', 'temple'), P('Hate', 'Oathbreakers')],
    associated: ['ernalda', 'maran_gor'],
  }),
  cult({
    id: 'chalana_arroy', name: 'Chalana Arroy', runes: ['fertility', 'harmony'], source: 'book',
    hint: 'The Healer. Initiates vow never to harm an intelligent being, go vegetarian, and give half their income to the cult. Her cult lacks the common Warding spell; its Summon Cult Spirit calls healing spirits (Summon Healing Spirit, 1 pt).',
    starting: [S('first_aid', 20), pick(['treat_disease', 'treat_poison'], 15, 'Treat Disease or Treat Poison'), S('sing', 10)],
    spiritSpells: ['befuddle', 'dullblade', 'heal', 'light', 'shimmer', 'sleep'],
    prohibitedSpirit: ['bladesharp', 'bludgeon', 'control_entity', 'demoralize', 'disruption', 'fanaticism', 'firearrow', 'fireblade', 'ironhand', 'multimissile', 'speedart'],
    runeSpells: ['comfort_song', 'cure_all_disease', 'cure_chaos_wound', 'cure_poison', 'harmony', 'heal_body', 'healing_trance', 'regrow_limb',
      'restore_health', 'resurrect'],
    passions: [P('Loyalty', 'temple')],
    associated: ['ernalda', 'eurmal', 'issaries', 'lhankor_mhy', ...ORLANTH, 'storm_bull', 'yelm'],
  }),
  cult({
    id: 'daka_fal', name: 'Daka Fal', runes: ['man'], source: 'book',
    hint: 'Judge of the Dead and god of ancestor worship (also has the Spirit Rune). Teaches all spirit magic. Initiates follow a family shaman and cannot call on divine intervention.',
    starting: [S('speak_other:Spiritspeech', 20), S('spirit_combat', 15), S('sing', 10)],
    spiritSpells: ALL_SPIRIT,
    runeSpells: ['axis_mundi', 'discorporation', 'free_ghost', 'incarnate_ancestor', 'restore_health', 'resurrect', 'spirit_guardian',
      'spirit_melding', 'summon_ancestor', 'summon_specific_ancestor', 'summon_spirit_teacher'],
    passions: [P('Love', 'family'), P('Loyalty', 'shaman')],
    associated: ['odayla', 'yinkin'],
  }),
  cult({
    id: 'eiritha', name: 'Eiritha', runes: ['fertility', 'beast'], source: 'book', freeSpirit: [{ id: 'ignite', points: 1 }],
    hint: 'Mother of the Herds, the women\'s cult of the Praxian nomads. Female Praxians only. Ignite is a free extra spell. Earth elementals: Dismiss small or medium, Summon small.',
    starting: [S('understand_herd_beast', 20), S('herd', 15), S('sing', 10)],
    spiritSpells: ['farsee', 'heal', 'slow', 'spirit_screen', 'ignite'],
    prohibitedSpirit: ['bladesharp', 'bludgeon', 'disruption', 'fanaticism', 'firearrow', 'fireblade', 'ironhand', 'multimissile', 'protection', 'speedart'],
    runeSpells: ['bless_animals', 'dismiss_elemental_type', 'speak_with_herd_beasts', 'summon_elemental_type'],
    passions: [P('Love', 'family'), P('Loyalty', 'temple'), P('Loyalty', 'tribe')],
    associated: ['ernalda', 'storm_bull', 'waha'],
  }),
  cult({
    id: 'engizi', name: 'Engizi', runes: ['water', 'movement'], source: 'book',
    hint: 'The Sky River Titan, god of the Creek-Stream. Initiates must swim at 50%. Water elementals small or medium only. Its Summon Cult Spirit calls naiads (Summon Naiad, 2 pts).',
    starting: [S('boat', 20), S('speak_other:Boatspeech', 15), S('swim', 10)],
    spiritSpells: ['coordination', 'extinguish', 'heal', 'mobility', 'rivereyes', 'shimmer'],
    runeSpells: ['breathe_air_water', 'dismiss_elemental_type', 'fireshield', 'strongnet', 'summon_elemental_type'],
    passions: [P('Loyalty', 'temple'), P('Devotion', 'river god')],
    associated: ['orlanth_thunderous'],
  }),
  cult({
    id: 'ernalda', name: 'Ernalda', runes: ['earth', 'fertility', 'harmony'], source: 'book', freeSpirit: [{ id: 'ignite', points: 1 }],
    hint: 'The Earth Queen, mother of life and the clan. Ignite is a free extra spell. Her Command spell covers snakes and swine; earth elementals of any size.',
    starting: [S('dance', 20), pick(['animal_lore', 'plant_lore'], 15, 'Animal Lore or Plant Lore'), S('sing', 10), S('speak_other:Earthtongue', 20)],
    spiritSpells: ['befuddle', 'demoralize', 'heal', 'second_sight', 'shimmer', 'slow', 'strength', 'vigor', 'ignite'],
    runeSpells: ['absorption', 'arouse_passion', 'bless_champion', 'bless_crops', 'bless_pregnancy', 'charisma', 'command_species',
      'dismiss_elemental_type', 'earthpower', 'gnome_to_gargoyle', 'heal_body', 'inviolable', 'regrow_limb', 'reproduce', 'restore_health',
      'summon_elemental_type', 'summon_household_guardian'],
    passions: [P('Devotion', 'Ernalda'), P('Loyalty', 'temple'), P('Loyalty', 'high priestess')],
    associated: ['argan_argar', 'babeester_gor', 'chalana_arroy', 'eiritha', 'maran_gor', ...ORLANTH, 'storm_bull', 'yelm', 'yelmalio'],
  }),
  cult({
    id: 'eurmal', name: 'Eurmal', runes: ['disorder', 'illusion', 'movement'], source: 'book',
    hint: 'The Trickster. Initiates must accept being outlaws. Spirit magic and one extra Rune spell vary by shrine; the listed spirit spells are the most common.',
    starting: [S('dodge', 20), S('fast_talk', 15), S('charm', 10)],
    spiritSpells: ['disruption', 'glamour', 'ignite', 'shimmer', 'silence'],
    runeSpells: ['illusory_motion', 'illusory_odor', 'illusory_sight', 'illusory_sound', 'illusory_substance', 'illusory_taste', 'reflection'],
    passions: [P('Hate', 'Authority')],
    associated: ['chalana_arroy', 'issaries', 'lhankor_mhy', ...ORLANTH],
  }),
  cult({
    id: 'foundchild', name: 'Foundchild', runes: ['death', 'harmony'], source: 'book',
    hint: 'The Hunting God. Initiates must kill prey each season for their community and always use the Peaceful Cut.',
    starting: [S('track', 15), S('peaceful_cut', 20), S('sing', 10)],
    spiritSpells: ['disruption', 'mobility', 'multimissile', 'slow', 'speedart'],
    runeSpells: ['beastmaster', 'draw_beast', 'sureshot'],
    passions: [P('Love', 'family'), P('Loyalty', 'temple')],
    associated: ['odayla', 'waha', 'yinkin'],
  }),
  cult({
    id: 'humakt', name: 'Humakt', runes: ['death', 'truth'], source: 'book', freeSpirit: [{ id: 'bladesharp', points: 4 }],
    hint: 'God of Death and War. Initiates take one of Humakt\'s gifts with its geas (up to three pairs) and get Bladesharp 4 free. Humakti can never be raised from the dead. True (Weapon) is his True Sword.',
    starting: [pick(SWORDS_1H, 20, '1H Sword'), { choose: 'weapon', bonus: 10, label: 'Other weapon' }, S('intimidate', 15)],
    spiritSpells: ['bladesharp', 'coordination', 'demoralize', 'detect_enemies', 'detect_undead', 'disruption', 'fireblade', 'heal', 'parry',
      'protection', 'repair', 'strength', 'vigor'],
    prohibitedSpirit: ['bludgeon', 'dullblade'],
    runeSpells: ['bind_ghost', 'detect_truth', 'morale', 'oath', 'sever_spirit', 'shield', 'sword_trance', 'true_weapon', 'turn_undead'],
    passions: [P('Honor', ''), P('Loyalty', 'temple'), P('Devotion', 'Humakt')],
    associated: [],
  }),
  cult({
    id: 'issaries', name: 'Issaries', runes: ['harmony', 'movement'], source: 'book',
    hint: 'God of communication, trade, and roads.',
    starting: [S('bargain', 15), S('speak_other:Tradetalk', 20), S('sing', 10)],
    spiritSpells: ['countermagic', 'detect_enemies', 'farsee', 'glamour', 'glue', 'mobility', 'repair'],
    runeSpells: ['create_market', 'lock', 'passage', 'path_watch', 'spell_trading'],
    passions: [P('Loyalty', 'temple')],
    associated: ['chalana_arroy', 'eurmal', 'lhankor_mhy', ...ORLANTH],
  }),
  cult({
    id: 'lhankor_mhy', name: 'Lhankor Mhy', runes: ['truth', 'stasis'], source: 'book', sorcery: true,
    hint: 'Lord of Knowledge: sages, scribes, and lawspeakers. Teaches every Detect spell and Farsee; may start with up to three cult sorcery spells instead of spirit magic.',
    starting: [{ choose: { subject: 'read_write' }, bonus: 20, label: 'Read/Write (any)' }, { choose: { subject: 'lore' }, bonus: 15, label: 'Lore (any)' }, S('sing', 10)],
    spiritSpells: ['detect_enemies', 'detect_life', 'detect_magic', 'detect_spirit', 'detect_substance', 'detect_trap', 'detect_undead', 'farsee'],
    runeSpells: ['analyze_magic', 'clairvoyance', 'find_substance', 'knowledge', 'mind_read', 'reconstruction', 'translate', 'truespeak'],
    passions: [P('Loyalty', 'temple')],
    associated: ['chalana_arroy', 'eurmal', 'issaries', ...ORLANTH],
  }),
  cult({
    id: 'maran_gor', name: 'Maran Gor', runes: ['earth', 'death', 'disorder'], source: 'book',
    hint: 'The Earthshaker. Open to all, but only women become priestesses. Her Command spell is for dinosaurs; earth elementals small or medium.',
    starting: [pick([...AXES_1H, 'club', 'heavy_mace', 'light_mace', 'singlestick'], 20, '1H Axe or 1H Mace'), S('dance', 20), S('intimidate', 10),
      S('speak_other:Earthtongue', 10)],
    spiritSpells: ['befuddle', 'bladesharp', 'bludgeon', 'demoralize', 'disruption', 'dullblade', 'heal', 'ironhand', 'strength', 'vigor'],
    runeSpells: ['blast_earth', 'command_species', 'create_fissure', 'dismiss_elemental_type', 'shake_earth', 'summon_elemental_type'],
    passions: [P('Devotion', 'Maran Gor'), P('Loyalty', 'temple')],
    associated: ['babeester_gor', 'ernalda'],
  }),
  cult({
    id: 'odayla', name: 'Odayla', runes: ['air', 'beast'], source: 'book',
    hint: 'The Bear God, son of Orlanth and hunter. Initiation means hunting, killing, and skinning a bear.',
    starting: [S('track', 15), S('peaceful_cut', 20), S('sing', 10)],
    spiritSpells: ['detect_life', 'disruption', 'heal', 'mobility', 'protection', 'slow', 'speedart', 'spirit_screen', 'strength'],
    runeSpells: ['bears_skin', 'bears_strength', 'claws'],
    passions: [P('Love', 'family')],
    associated: ['daka_fal', 'foundchild', ...ORLANTH, 'yinkin'],
  }),
  cult({
    id: 'orlanth_adventurous', name: 'Orlanth Adventurous', deity: 'Orlanth', runes: ['air', 'movement'], source: 'book',
    hint: 'The Storm King\'s warrior subcult. Adds +10% to any sword skill. Air elementals small or medium only.',
    starting: [...ORLANTH_STARTING, pick(SWORDS, 10, 'Any sword')],
    spiritSpells: [...ORLANTH_SPIRIT, 'fanaticism'],
    runeSpells: ADVENTUROUS_RUNE,
    passions: ORLANTH_PASSIONS,
    associated: ORLANTH_ASSOCIATED,
  }),
  cult({
    id: 'orlanth_thunderous', name: 'Orlanth Thunderous', deity: 'Orlanth', runes: ['air', 'movement'], source: 'book',
    hint: 'The Storm King\'s priest subcult of rain and farms. Adds +10% to Dance. Air elementals of any size.',
    starting: [...ORLANTH_STARTING, S('dance', 10)],
    spiritSpells: [...ORLANTH_SPIRIT, 'extinguish', 'second_sight'],
    runeSpells: [...ORLANTH_RUNE, 'cloud_call', 'cloud_clear', 'thunderbolt'],
    passions: ORLANTH_PASSIONS,
    associated: ORLANTH_ASSOCIATED,
  }),
  cult({
    id: 'vinga', name: 'Vinga Adventurous', deity: 'Orlanth', runes: ['air', 'movement'], source: 'book',
    hint: 'All-female variant of Orlanth Adventurous worshipping Orlanth in female form; initiates dye their hair red. Same benefits plus Fearless.',
    starting: [...ORLANTH_STARTING, pick(SWORDS, 10, 'Any sword')],
    spiritSpells: [...ORLANTH_SPIRIT, 'fanaticism'],
    runeSpells: [...ADVENTUROUS_RUNE, 'fearless'],
    passions: ORLANTH_PASSIONS,
    associated: ORLANTH_ASSOCIATED,
  }),
  cult({
    id: 'seven_mothers', name: 'The Seven Mothers', deity: 'Seven Mothers', runes: ['moon', 'fertility', 'death'], source: 'book', doubleSpiritExcept: ['befuddle', 'glamour'],
    hint: 'Missionary cult of the Lunar Empire. Befuddle and Glamour at normal cost; every other spirit spell costs double. Elementals small only and never air; Lunes any size. Associated with the Red Goddess.',
    starting: [S('speak_other:New Pelorian', 20), S('read_write:New Pelorian', 15), S('sing', 10)],
    spiritSpells: ALL_SPIRIT,
    runeSpells: ['dismiss_elemental_type', 'madness', 'mindblast', 'reflection', 'regrow_limb', 'summon_elemental_type'],
    passions: [P('Loyalty', 'temple'), P('Loyalty', 'Red Emperor')],
    associated: [],
  }),
  cult({
    id: 'storm_bull', name: 'Storm Bull', runes: ['air', 'death', 'beast'], source: 'book',
    hint: 'The Chaos Killer. Air elementals small only.',
    starting: [{ choose: 'cultural_weapon', bonus: 15, label: 'Cultural weapon' }, S('sense_chaos', 20), S('intimidate', 10)],
    spiritSpells: ['demoralize', 'detect_enemies', 'dispel_magic', 'fanaticism', 'heal', 'protection'],
    runeSpells: ['berserker', 'dismiss_elemental_type', 'face_chaos', 'impede_chaos', 'summon_elemental_type'],
    passions: [P('Devotion', 'Storm Bull'), P('Hate', 'Chaos'), P('Loyalty', 'Storm Khan')],
    associated: ['chalana_arroy', 'eiritha', 'ernalda', ...ORLANTH, 'waha'],
  }),
  cult({
    id: 'waha', name: 'Waha', runes: ['man', 'death'], source: 'book',
    hint: 'The Butcher, founder of Praxian survival. Male Praxians only; initiates may not learn more than 1 point of Heal. Earth elementals small only.',
    starting: [S('peaceful_cut', 20), S('spirit_combat', 15), S('sing', 10)],
    spiritSpells: ['countermagic', 'detect_spirit', 'distraction', 'heal', 'protection', 'second_sight', 'slow', 'speedart', 'spirit_screen', 'vigor'],
    runeSpells: ['axis_mundi', 'discorporation', 'dismiss_elemental_type', 'shield', 'summon_spirit_of_law', 'summon_elemental_type'],
    passions: [P('Devotion', 'Waha'), P('Loyalty', 'khan')],
    associated: ['eiritha', 'storm_bull'],
  }),
  cult({
    id: 'yelm', name: 'Yelm', runes: ['fire', 'death', 'fertility'], source: 'book',
    hint: 'The Sun Horse (Yu-Kargzant). Male Pure Horse People only; they ride and herd only horses and never farm. His Command spell is for horses; fire elementals small only.',
    starting: [S('ride:Horse', 20), S('speak_other:Firespeech', 20), S('sing', 10)],
    spiritSpells: ['befuddle', 'coordination', 'detect_enemies', 'disruption', 'extinguish', 'farsee', 'firearrow', 'fireblade', 'heal', 'ignite',
      'light', 'lightwall', 'mobility', 'multimissile', 'slow', 'speedart'],
    runeSpells: ['cloud_clear', 'command_species', 'dismiss_elemental_type', 'fight_disease', 'shield', 'summon_elemental_type', 'sureshot'],
    passions: [P('Honor', ''), P('Love', 'family'), P('Loyalty', 'temple'), P('Devotion', 'Yelm')],
    associated: ['chalana_arroy', 'ernalda', 'yelmalio'],
  }),
  cult({
    id: 'yelmalio', name: 'Yelmalio', runes: ['fire', 'truth'], source: 'book',
    hint: 'Sun God of the Frontier (Light Rune). An initiate may take one gift with its geas. His Detect spell is Detect Gold.',
    starting: [S('celestial_lore', 15), S('speak_other:Firespeech', 20), S('sing', 10)],
    spiritSpells: ['coordination', 'detect_substance', 'farsee', 'lantern', 'light', 'lightwall', 'repair'],
    prohibitedSpirit: ['bludgeon', 'darkwall', 'fireblade', 'firearrow'],
    runeSpells: ['catseye', 'sunbright'],
    passions: [P('Honor', ''), P('Loyalty', 'temple'), P('Devotion', 'Yelmalio')],
    associated: ['ernalda', 'yelm'],
  }),
  cult({
    id: 'yinkin', name: 'Yinkin', runes: ['air', 'beast'], source: 'book',
    hint: 'The Shadowcat, Orlanth\'s half-brother; a hunting and ancestor cult.',
    starting: [S('speak_other:Beastspeech', 15), S('track', 20)],
    spiritSpells: ['coordination', 'detect_life', 'disruption', 'glamour', 'heal', 'mobility', 'silence', 'slow'],
    runeSpells: ['catseye', 'charisma', 'claws', 'identify_scent'],
    passions: [P('Love', 'family'), P('Loyalty', 'tribe')],
    associated: ['daka_fal', 'foundchild', 'odayla', ...ORLANTH],
  }),
]
