import type { Occupation, PassionOption } from '../engine/types'
import { CULTS } from './cults'

// Occupations, checked against the core rulebook (Step 5: Occupation, pp.63-73). Starting Reputation follows the
// p.82 guideline (Poor/Destitute +0, Free +5, Noble +10). "Typical cults" list only the cults this app has; cults the
// book names that aren't modeled yet are left out. Wealth is coin plus listed trade goods (dice shown as averages).

const P = (kind: PassionOption['kind'], target: string): PassionOption => ({ kind, target })
const weapon = (bonus: number, label: string) => ({ choose: 'weapon' as const, bonus, label })
const cultural = (bonus: number, label = 'cultural weapon') => ({
  choose: label.includes('missile') ? 'cultural_missile' as const : label.includes('melee') ? 'cultural_melee' as const : 'cultural_weapon' as const,
  bonus, label,
})
const shield = (bonus: number) => ({ choose: 'shield' as const, bonus, label: 'shield' })
/** "Ride (any)": common mounts, with Praxian beasts. */
const RIDE = ['ride:Horse', 'ride:Bison', 'ride:High Llama', 'ride:Impala', 'ride:Sable Antelope']
const ride = (bonus: number, extra: string[] = [], label = 'Ride (any)') => ({ choose: [...RIDE, ...extra], bonus, label })

const WARRIOR_PASSIONS = [P('Honor', ''), P('Loyalty', 'leader'), P('Loyalty', 'unit')]

export const OCCUPATIONS: Occupation[] = [
  {
    id: 'assistant_shaman', name: 'Assistant Shaman', source: 'book', standard: 'poor', spiritMagic: 2,
    hint: 'Helps a shaman with rituals. Also starts with Second Sight on top of the 2 extra spirit magic points, and does +1 spirit combat damage (apply by hand).',
    skills: [
      { skill: 'speak_other:Spiritspeech', bonus: 20 }, { skill: 'sing', bonus: 10 }, { skill: 'spirit_combat', bonus: 30 },
      { skill: 'animal_lore', bonus: 15 }, { skill: 'spirit_dance', bonus: 10 }, { skill: 'first_aid', bonus: 15 },
      { skill: 'spirit_lore', bonus: 20 }, { skill: 'plant_lore', bonus: 20 }, { skill: 'spirit_travel', bonus: 20 },
      { skill: 'meditate', bonus: 20 },
    ],
    wealth: 30, wealthNote: '5 L coin and crafted goods worth 25 L; healing herbs, spirit statuettes, robe', income: '20 L', ransom: 250,
    passions: [P('Loyalty', 'shaman')],
    cults: ['daka_fal', 'waha', 'yelm'],
  },
  {
    id: 'bandit', name: 'Bandit', source: 'book', standard: 'destitute',
    hint: 'Outlaw preying on settled folk from the margins.',
    skills: [
      { skill: 'intimidate', bonus: 10 }, { skill: 'hide', bonus: 30 }, { skill: 'first_aid', bonus: 10 },
      cultural(30, 'primary weapon (cultural)'), { choose: ['animal_lore', 'plant_lore'], bonus: 10, label: 'Animal or Plant Lore' },
      cultural(10, 'secondary weapon (cultural)'), { skill: 'survival', bonus: 30 }, shield(10), { skill: 'track', bonus: 10 },
    ],
    wealth: 50, wealthNote: 'Booty worth 1D100 L (average shown); leather armor, bedroll', income: 'none',
    passions: [P('Love', 'family'), P('Loyalty', 'band'), P('Hate', 'authority')],
    cults: ['babeester_gor', 'eurmal', 'maran_gor', 'odayla', 'orlanth_adventurous', 'orlanth_thunderous', 'seven_mothers', 'storm_bull'],
  },
  {
    id: 'chariot_driver', name: 'Chariot Driver', source: 'book', standard: 'free', reputation: 5,
    hint: 'Drives a war chariot for a noble or temple, which owns the chariot.',
    skills: [
      { skill: 'battle', bonus: 20 }, { skill: 'first_aid', bonus: 10 }, { skill: 'drive:Chariot', bonus: 40 }, { skill: 'whip', bonus: 25 },
      cultural(20, 'cultural melee weapon'), { skill: 'dance', bonus: 15 }, cultural(20, 'cultural missile weapon'),
      { skill: 'scan', bonus: 15 },
    ],
    wealth: 150, wealthNote: 'Gifts from leader or temple worth 150 L; whip, linothorax and light armor, helm', income: '60 L', ransom: 500,
    passions: [P('Honor', ''), P('Loyalty', 'leader'), P('Loyalty', 'temple')],
    cults: ['orlanth_adventurous', 'seven_mothers'],
  },
  {
    id: 'crafter', name: 'Crafter', source: 'book', standard: 'free', reputation: 5,
    hint: 'Maker or tradesperson: brewer, carpenter, jeweler, mason, potter, redsmith, weaver, and so on.',
    skills: [
      { skill: 'art', bonus: 10 }, { skill: 'evaluate', bonus: 10 }, { skill: 'bargain', bonus: 10 }, { skill: 'craft:Primary', bonus: 30 },
      { skill: 'insight', bonus: 10 }, { skill: 'craft:Secondary', bonus: 20 }, { skill: 'lore:Any', bonus: 10 }, { skill: 'devise', bonus: 15 },
      { skill: 'manage_household', bonus: 30 }, cultural(15),
    ],
    wealth: 120, wealthNote: '20 L coin and crafted goods worth 100 L; tools of the trade',
    income: 'by craft: 60 L (carpenter, leatherworker, weaver) to 160 L (jeweler)', ransom: 500,
    passions: [P('Love', 'family'), P('Loyalty', 'guild'), P('Loyalty', 'patron')],
    cults: ['ernalda', 'issaries'],
  },
  {
    id: 'entertainer', name: 'Entertainer', source: 'book', standard: 'free', reputation: 5,
    hint: 'Poet, singer, dancer, or musician.',
    skills: [
      { skill: 'dance', bonus: 30 }, { skill: 'customs:Any', bonus: 10 }, { skill: 'orate', bonus: 10 }, { skill: 'insight', bonus: 10 },
      { skill: 'sing', bonus: 30 }, { skill: 'lore:Any', bonus: 10 }, { skill: 'speak_own:{language}', bonus: 30 }, cultural(15),
      { skill: 'play_instrument:Instrument', bonus: 30 },
    ],
    wealth: 120, wealthNote: '50 L coin and 70 L in goods; instrument, costume', income: '100 L (Sing) or 80 L (Dance, Play)', ransom: 500,
    passions: [P('Love', 'person'), P('Loyalty', 'patron'), P('Loyalty', 'tribe')],
    cults: ['ernalda', 'eurmal', 'orlanth_adventurous', 'orlanth_thunderous', 'seven_mothers'],
  },
  {
    id: 'farmer', name: 'Farmer', source: 'book', standard: 'free', reputation: 5,
    hint: 'Works local fields and livestock with an ox-drawn plow.',
    skills: [
      { skill: 'homeland_lore:{place}', bonus: 15 }, { choose: ['jump', 'climb'], bonus: 10, label: 'Jump or Climb' },
      { skill: 'farm', bonus: 30 }, { skill: 'craft:Any', bonus: 15 }, { skill: 'first_aid', bonus: 10 }, { skill: 'scan', bonus: 10 },
      { skill: 'herd', bonus: 15 }, cultural(15), { skill: 'manage_household', bonus: 30 }, shield(15),
    ],
    wealth: 120, wealthNote: 'Food and livestock worth 120 L; two draft oxen, farm tools, helm', income: '80 L (40 L as a tenant)', ransom: 500,
    passions: [P('Love', 'family'), P('Loyalty', 'clan'), P('Loyalty', 'tribe')],
    cults: ['ernalda', 'orlanth_adventurous', 'orlanth_thunderous', 'seven_mothers', 'yelmalio'],
  },
  {
    id: 'fisher', name: 'Fisher', source: 'book', standard: 'poor',
    hint: 'Lives off rivers and lakes with nets, lines, and spears. The book also allows Thrown Net instead of Javelin or Self Bow.',
    skills: [
      { skill: 'boat', bonus: 30 }, { choose: ['javelin', 'self_bow'], bonus: 20, label: 'Javelin or Self Bow' },
      { skill: 'swim', bonus: 30 }, { choose: ['shortspear_1h', 'shortspear_2h'], bonus: 10, label: 'Short Spear' },
      { skill: 'first_aid', bonus: 10 }, shield(10), { skill: 'lore:River', bonus: 30 }, { skill: 'scan', bonus: 10 },
    ],
    wealth: 60, wealthNote: 'Dried or salted fish worth 60 L; small boat, nets, lines, rope', income: '60 L', ransom: 200,
    passions: [P('Love', 'family'), P('Loyalty', 'clan')],
    cults: ['orlanth_adventurous', 'orlanth_thunderous'],
  },
  {
    id: 'healer', name: 'Healer', source: 'book', standard: 'free', reputation: 5,
    hint: 'Treats wounds, sickness, and childbirth; often a peacemaker.',
    skills: [
      { skill: 'orate', bonus: 10 }, { skill: 'treat_disease', bonus: 30 }, { skill: 'alchemy', bonus: 10 }, { skill: 'treat_poison', bonus: 10 },
      { skill: 'first_aid', bonus: 30 }, { skill: 'devise', bonus: 10 }, { skill: 'plant_lore', bonus: 30 }, { skill: 'insight', bonus: 10 },
    ],
    wealth: 120, wealthNote: '20 L coin and assorted items worth 100 L; healer\'s kit', income: '80 L', ransom: 500,
    passions: [P('Love', 'family'), P('Loyalty', 'clan'), P('Loyalty', 'tribe')],
    cults: ['chalana_arroy', 'eiritha', 'ernalda', 'seven_mothers'],
  },
  {
    id: 'herder', name: 'Herder', source: 'book', standard: 'poor',
    hint: 'Tends the community\'s herd beasts, on foot or mounted.',
    skills: [
      { choose: ['jump', 'climb'], bonus: 10, label: 'Jump or Climb' }, { skill: 'scan', bonus: 10 }, { skill: 'animal_lore', bonus: 10 },
      { skill: 'track', bonus: 10 }, { skill: 'homeland_lore:{place}', bonus: 10 }, cultural(30, 'cultural missile weapon'),
      { skill: 'first_aid', bonus: 10 }, cultural(10), { skill: 'herd', bonus: 30 }, shield(10), { skill: 'peaceful_cut', bonus: 30 },
    ],
    wealth: 120, wealthNote: 'Herd animals worth 120 L; staff, herding dog or shadowcat', income: '60 L', ransom: 500,
    passions: [P('Love', 'family'), P('Loyalty', 'clan'), P('Loyalty', 'tribe')],
    cults: ['eiritha', 'orlanth_adventurous', 'orlanth_thunderous', 'waha', 'yelm', 'yinkin'],
  },
  {
    id: 'hunter', name: 'Hunter', source: 'book', standard: 'poor',
    hint: 'Stalks and traps wild animals for meat and hides.',
    skills: [
      { skill: 'animal_lore', bonus: 30 }, { skill: 'scan', bonus: 10 }, { skill: 'homeland_lore:{place}', bonus: 10 },
      { skill: 'track', bonus: 30 }, { skill: 'conceal', bonus: 10 }, { skill: 'hide', bonus: 10 }, { skill: 'listen', bonus: 10 },
      cultural(30, 'cultural missile weapon'),
    ],
    wealth: 120, wealthNote: 'Furs worth 120 L; snares, hunting dog or shadowcat', income: '40 L', ransom: 250,
    passions: [P('Love', 'family'), P('Loyalty', 'clan')],
    cults: ['odayla', 'orlanth_adventurous', 'orlanth_thunderous', 'waha', 'yelm', 'yinkin'],
  },
  {
    id: 'merchant', name: 'Merchant', source: 'book', standard: 'free', reputation: 5,
    hint: 'Trader on the routes between the Lunar Empire and the Holy Country.',
    skills: [
      ride(10, [], 'Ride'), { skill: 'customs:Any', bonus: 10 }, { skill: 'bargain', bonus: 30 }, { skill: 'insight', bonus: 10 },
      { skill: 'speak_other:Any', bonus: 10 }, { skill: 'read_write:Any', bonus: 10 }, { skill: 'speak_other:Tradetalk', bonus: 30 },
      { skill: 'manage_household', bonus: 30 }, { skill: 'evaluate', bonus: 30 },
    ],
    wealth: 650, wealthNote: '150 L coin and 500 L in trade goods; fine clothes, writing kit, light armor, staff',
    income: 'special (from trade goods)', ransom: 500,
    passions: [P('Love', 'family'), P('Loyalty', 'clan'), P('Loyalty', 'tribe')],
    cults: ['issaries', 'argan_argar', 'seven_mothers'],
  },
  {
    id: 'noble', name: 'Noble', source: 'book', standard: 'noble', reputation: 10,
    hint: 'Leads and protects a community that supports them.',
    skills: [
      ride(10, ['drive:Chariot'], 'Ride (any) or Drive Chariot'), { skill: 'insight', bonus: 10 },
      { skill: 'intrigue', bonus: 10 }, { skill: 'read_write:{language}', bonus: 10 }, { skill: 'orate', bonus: 30 },
      { skill: 'manage_household', bonus: 30 }, { skill: 'speak_own:{language}', bonus: 10 }, cultural(30),
      { skill: 'customs:{homeland}', bonus: 10 }, shield(30),
    ],
    wealth: 650, wealthNote: '200 L coin and 450 L in jewelry and luxuries; heavy bronze armor, two mounts, fine clothes',
    income: 'variable (land holdings)', ransom: 1000,
    passions: [P('Honor', ''), P('Loyalty', 'leader'), P('Loyalty', 'tribe')],
    cults: ['ernalda', 'orlanth_adventurous', 'orlanth_thunderous', 'seven_mothers', 'waha', 'yelm'],
  },
  {
    id: 'philosopher', name: 'Philosopher', source: 'book', standard: 'free', reputation: 5,
    hint: 'Urban scholar and sorcerer. Starts with one Rune and one technique mastered and three sorcery spells, with +10%, +20% and +10% to three of them; sorcery isn\'t supported yet.',
    skills: [
      { skill: 'read_write:Any', bonus: 50 }, { skill: 'orate', bonus: 25 }, { skill: 'lore:Any', bonus: 30 },
      { skill: 'library_use', bonus: 10 }, { skill: 'lore:Second', bonus: 10 }, { skill: 'meditate', bonus: 20 },
    ],
    wealth: 100, wealthNote: '50 L coin and blank parchments worth 50 L; writing kit, philosophical texts, dagger, staff',
    income: '60 L', ransom: 150,
    passions: [P('Love', 'wisdom')],
    cults: ['lhankor_mhy', 'seven_mothers'],
  },
  {
    id: 'priest', name: 'Priest', source: 'book', standard: 'noble', reputation: 10,
    hint: 'Raised to temple service. Must meet the cult\'s God-talker, Rune Priest, or Rune Lord requirements; otherwise an assistant priest or a Rune Master\'s favored kin.',
    skills: [
      { choose: 'cult', bonus: 10, label: 'one cult skill' }, { skill: 'cult_lore:{deity}', bonus: 30 }, { skill: 'dance', bonus: 10 },
      { skill: 'read_write:{language}', bonus: 10 }, { skill: 'orate', bonus: 10 }, { skill: 'manage_household', bonus: 10 },
      { skill: 'sing', bonus: 30 }, { skill: 'worship:{deity}', bonus: 30 }, { skill: 'meditate', bonus: 10 },
    ],
    wealth: 610, wealthNote: '160 L coin and 450 L in jewelry and luxuries; armor, regalia, mount, fine clothes',
    income: 'variable (temple resources)', ransom: 1000,
    passions: [P('Devotion', '{deity}'), P('Loyalty', 'temple')],
    cults: CULTS.map(c => c.id).filter(id => !['daka_fal', 'eurmal', 'waha'].includes(id)),
  },
  {
    id: 'scribe', name: 'Scribe', source: 'book', standard: 'free', reputation: 5,
    hint: 'Literate professional: clerk, lawyer, teacher, accountant, or scholar.',
    skills: [
      { skill: 'speak_other:Any', bonus: 10 }, { skill: 'lore:Any', bonus: 30 }, { skill: 'bureaucracy', bonus: 30 },
      { skill: 'lore:Second', bonus: 10 }, { skill: 'customs:Any', bonus: 30 }, { skill: 'read_write:Other', bonus: 30 },
      { skill: 'library_use', bonus: 10 }, { skill: 'read_write:{language}', bonus: 50 }, { skill: 'evaluate', bonus: 10 },
    ],
    wealth: 230, wealthNote: '80 L coin, reports worth 100 L, blank parchments worth 50 L; writing kit, dagger',
    income: '200 L (Bureaucracy), 160 L (Alchemy, Customs), 120 L (Read/Write)', ransom: 1000,
    passions: [P('Loyalty', 'temple'), P('Loyalty', 'tribe')],
    cults: ['lhankor_mhy', 'seven_mothers'],
  },
  {
    id: 'thief', name: 'Thief', source: 'book', standard: 'poor',
    hint: 'Burglar, cutpurse, smuggler, or racketeer. Ransom may be none.',
    skills: [
      { skill: 'climb', bonus: 10 }, { skill: 'devise', bonus: 10 }, { skill: 'disguise', bonus: 30 }, { skill: 'sleight', bonus: 30 },
      { skill: 'fast_talk', bonus: 30 }, { skill: 'hide', bonus: 10 }, { skill: 'homeland_lore:{place}', bonus: 10 },
      { skill: 'move_quietly', bonus: 30 }, cultural(15),
    ],
    wealth: 30, wealthNote: '30 L coin; lock picks and tools, mask, rope and grapple, lantern', income: '30 L', ransom: 250,
    passions: [P('Love', 'family'), P('Loyalty', 'gang')],
    cults: ['eurmal', 'orlanth_adventurous', 'orlanth_thunderous'],
  },
  {
    id: 'warrior_heavy_infantry', name: 'Warrior (Heavy Infantry)', source: 'book', standard: 'free', reputation: 5,
    hint: 'Phalanx fighter. Unit weapons are a 1H weapon and Large Shield, or a 2H weapon instead (then move the shield bonus with your GM); Yelmalio cultists may use pike and shield.',
    skills: [
      { skill: 'sing', bonus: 10 }, { skill: 'scan', bonus: 10 }, { skill: 'battle', bonus: 30 }, { skill: 'first_aid', bonus: 15 },
      { skill: 'listen', bonus: 10 }, weapon(25, 'unit weapon (1H, or 2H)'), { skill: 'shield_large', bonus: 25 },
      weapon(25, 'other weapon'), weapon(15, 'tertiary weapon'),
    ],
    wealth: 121, wealthNote: '20 L coin and war booty worth 2D100 L (average shown); heavy armor, bedroll', income: '60 L', ransom: 500,
    passions: WARRIOR_PASSIONS,
    cults: ['argan_argar', 'babeester_gor', 'humakt', 'seven_mothers', 'yelmalio'],
  },
  {
    id: 'warrior_light_infantry', name: 'Warrior (Light Infantry)', source: 'book', standard: 'free', reputation: 5,
    hint: 'Skirmisher and scout. Unit sets: Sling + Small Shield, or Javelin, Self Bow, or Throwing Axe + Medium Shield, each with a 1H weapon.',
    skills: [
      { skill: 'battle', bonus: 30 }, { skill: 'hide', bonus: 10 }, { skill: 'first_aid', bonus: 15 }, { skill: 'move_quietly', bonus: 10 },
      { skill: 'survival', bonus: 10 },
      { choose: ['sling', 'javelin', 'self_bow', 'thrown_axe'], bonus: 25, label: 'unit missile weapon' },
      { choose: 'melee', bonus: 25, label: 'unit 1H weapon' },
      { choose: ['shield_small', 'shield_medium'], bonus: 25, label: 'unit shield' },
      { skill: 'listen', bonus: 10 }, weapon(25, 'other weapon'), { skill: 'scan', bonus: 10 },
    ],
    wealth: 101, wealthNote: 'War booty worth 2D100 L (average shown); light armor, bedroll', income: '60 L', ransom: 500,
    passions: WARRIOR_PASSIONS,
    cults: ['babeester_gor', 'humakt', 'maran_gor', 'orlanth_adventurous', 'orlanth_thunderous', 'storm_bull'],
  },
  {
    id: 'warrior_heavy_cavalry', name: 'Warrior (Heavy Cavalry)', source: 'book', standard: 'free', reputation: 5,
    hint: 'Shock cavalry. Unit sets: Lance and a 1H weapon, plus Composite Bow, Medium Shield, or Javelin.',
    skills: [
      { skill: 'battle', bonus: 30 }, { skill: 'first_aid', bonus: 10 }, ride(35), { skill: 'listen', bonus: 10 },
      { skill: 'lance', bonus: 25 }, { choose: 'melee', bonus: 25, label: 'unit 1H weapon' },
      { choose: ['composite_bow', 'shield_medium', 'javelin'], bonus: 25, label: 'unit bow, shield, or javelin' },
      { skill: 'scan', bonus: 10 }, weapon(20, 'other weapon'), { skill: 'sing', bonus: 10 },
    ],
    wealth: 121, wealthNote: '20 L coin and war booty worth 2D100 L (average shown); heavy armor, mount, bedroll', income: '60 L', ransom: 500,
    passions: WARRIOR_PASSIONS,
    cults: ['humakt', 'orlanth_adventurous', 'orlanth_thunderous', 'seven_mothers', 'storm_bull', 'waha', 'yelm'],
  },
  {
    id: 'warrior_light_cavalry', name: 'Warrior (Light Cavalry)', source: 'book', standard: 'free', reputation: 5,
    hint: 'Mounted skirmisher. Unit sets (each with a 1H weapon): Bow + Small Shield, Bow + Lance, Javelin + Medium Shield, Lance + Small or Medium Shield.',
    skills: [
      ride(35, [], 'Ride'), { skill: 'listen', bonus: 10 }, { skill: 'sing', bonus: 10 }, { skill: 'scan', bonus: 10 },
      { skill: 'battle', bonus: 30 },
      { choose: ['composite_bow', 'javelin', 'lance'], bonus: 25, label: 'unit bow, javelin, or lance' },
      { choose: 'melee', bonus: 25, label: 'unit 1H weapon' },
      { choose: ['shield_small', 'shield_medium', 'lance'], bonus: 25, label: 'unit shield or lance' },
      { skill: 'first_aid', bonus: 10 }, weapon(20, 'other weapon'),
    ],
    wealth: 101, wealthNote: 'War booty worth 2D100 L (average shown); light armor, mount, bedroll', income: '60 L', ransom: 500,
    passions: WARRIOR_PASSIONS,
    cults: ['humakt', 'orlanth_adventurous', 'orlanth_thunderous', 'seven_mothers', 'storm_bull', 'waha', 'yelm', 'yelmalio'],
  },
]
