// Starting kit per occupation, from the "Equipment:" lines in Step 5: Occupation (pp.63-73).
// Item ids refer to GEAR (gear.ts). Everyone also has the common kit listed on p.64
// (tunic, skirt/breeches, sandals/boots, loincloth, warm cloak, hat, belt knife, fire-making gear, water skin).

export interface KitItem { id: string; qty?: number }
/** Pick one option; an option may be several GearItem ids joined with '+' (a set, e.g. 'disk_plate+studded_skirts'). */
export interface KitChoice { label: string; options: string[] }
export interface OccupationKit {
  items: KitItem[]
  choices?: KitChoice[]
  weapons?: 'appropriate' | 'cultural' | 'none'
  other: string[]
}

const WARRIOR_EXTRAS: KitItem[] = [{ id: 'sleeping_roll' }, { id: 'good_clothing' }]
// "Heavy scale hauberk or disk plate cuirass and studded leather skirt"
// An option joined with '+' is a set: disk plate comes with a studded leather skirt.
const HEAVY_BODY: KitChoice = { label: 'Body armor', options: ['heavy_scale_hauberk', 'disk_plate+studded_skirts'] }

export const OCCUPATION_KITS: Record<string, OccupationKit> = {
  assistant_shaman: {
    items: [{ id: 'herbs_powders' }, { id: 'statuette', qty: 3 }, { id: 'loincloth' }, { id: 'robe' }],
    weapons: 'cultural',
    other: ['statuettes of the shaman’s power animal or ancestors', 'crafted goods worth 25 L', '5 L in coin'],
  },
  bandit: {
    items: [{ id: 'leather_skirts' }, { id: 'heavy_leather_cuirass' }, { id: 'sleeping_roll' }],
    weapons: 'cultural',
    other: ['booty worth 1D100 L'],
  },
  chariot_driver: {
    items: [
      { id: 'whip' }, { id: 'linen_linothorax' }, { id: 'leather_greaves' }, { id: 'leather_vambraces' },
      { id: 'composite_helm' }, { id: 'wineskin' },
    ],
    weapons: 'cultural',
    other: ['1D6 distinctive scars', 'largess from leader or temple worth 150 L', 'the chariot belongs to the leader or temple'],
  },
  crafter: {
    items: [{ id: 'craft_tools' }],
    weapons: 'cultural',
    other: ['crafted goods worth 100 L', '20 L in coin'],
  },
  entertainer: {
    items: [],
    choices: [{
      label: 'Musical instrument',
      options: ['bagpipes', 'castanets', 'cymbals', 'drum', 'flute', 'nose_flute', 'lur', 'kithara', 'lute', 'lyre', 'reed_pipes', 'rattle'],
    }],
    weapons: 'cultural',
    other: ['costume, if appropriate', '50 L in coin', 'goods worth 70 L'],
  },
  farmer: {
    items: [{ id: 'sickle' }, { id: 'hammer' }, { id: 'composite_helm' }],
    weapons: 'cultural',
    other: ['two draft oxen', 'foodstuffs and livestock worth 120 L'],
  },
  fisher: {
    items: [
      { id: 'bobbin' }, { id: 'boat_three' }, { id: 'fishing_nets' }, { id: 'fish_hooks' },
      { id: 'baskets' }, { id: 'gaff' },
    ],
    weapons: 'cultural',
    other: ['200 m of rope or line', 'salted or dried fish worth 60 L'],
  },
  healer: {
    items: [{ id: 'healers_kit' }],
    weapons: 'none',
    other: ['20 L in coin', 'miscellaneous items worth 100 L'],
  },
  herder: {
    items: [{ id: 'quarterstaff' }],
    weapons: 'cultural',
    other: ['cultural weapons include a missile weapon', 'herding animal (usually a shadowcat or dog)', 'herd animals worth 120 L'],
  },
  hunter: {
    items: [{ id: 'snares' }],
    weapons: 'cultural',
    other: ['cultural weapons include a missile weapon', 'hunting animal (usually a shadowcat or dog)', 'furs worth 120 L'],
  },
  merchant: {
    items: [
      { id: 'tools_writing' }, { id: 'statuette' }, { id: 'broad_brimmed_hat' }, { id: 'leather_greaves' },
      { id: 'leather_vambraces' }, { id: 'linen_linothorax' }, { id: 'quarterstaff' },
    ],
    weapons: 'cultural',
    other: ['statuette is of the trade god', 'fine clothes worth 40 L', 'goods worth 500 L', '150 L in coin'],
  },
  noble: {
    items: [{ id: 'bronze_cuirass' }, { id: 'bronze_greaves' }, { id: 'bronze_vambraces' }, { id: 'closed_helm' }],
    weapons: 'cultural',
    other: ['two riding animals', 'noble clothing worth 60 L', '200 L in coin', 'jewelry, vessels, and luxury goods worth 450 L'],
  },
  philosopher: {
    items: [
      { id: 'tools_writing' }, { id: 'writing_case' }, { id: 'philosophical_work' }, { id: 'dagger' },
      { id: 'quarterstaff' }, { id: 'portable_platform' }, { id: 'robe' },
    ],
    weapons: 'none',
    other: ['blank parchments worth 50 L', 'one or two philosophical works; staff is a walking staff', '50 L in coin'],
  },
  priest: {
    items: [
      { id: 'open_helm' }, { id: 'heavy_scale_hauberk' }, { id: 'cuirboilli_greaves' }, { id: 'cuirboilli_vambraces' },
      { id: 'regalia' },
    ],
    weapons: 'cultural',
    other: ['one riding animal', 'noble clothing worth 60 L', '160 L in coin', 'jewelry, vessels, and luxury goods worth 450 L'],
  },
  scribe: {
    items: [{ id: 'tools_writing' }, { id: 'writing_case' }, { id: 'calendar_disk' }, { id: 'dagger' }],
    weapons: 'none',
    other: [
      'three bundles of reports and notes worth 100 L', 'blank parchments worth 50 L',
      'old letter of introduction from a senior scribe', '80 L in coin',
    ],
  },
  thief: {
    items: [
      { id: 'lock_picks' }, { id: 'jimmy' }, { id: 'mask' }, { id: 'climbers_pack' }, { id: 'sack_small' },
      { id: 'hooded_lantern' },
    ],
    choices: [{
      label: 'Light one-handed weapon',
      options: ['dagger', 'shortsword', 'light_mace', 'singlestick', 'small_axe', 'club'],
    }],
    weapons: 'none',
    other: ['other tools of the trade', 'secret thieves’ mark', '30 L in coin'],
  },
  warrior_heavy_infantry: {
    items: [{ id: 'bronze_greaves' }, { id: 'bronze_vambraces' }, { id: 'closed_helm' }, ...WARRIOR_EXTRAS],
    choices: [HEAVY_BODY],
    weapons: 'appropriate',
    other: ['1D3 distinctive scars', '20 L in coin', 'war booty worth 2D100 L'],
  },
  warrior_light_infantry: {
    items: [
      { id: 'linen_linothorax' }, { id: 'cuirboilli_greaves' }, { id: 'cuirboilli_vambraces' }, { id: 'composite_helm' },
      ...WARRIOR_EXTRAS,
    ],
    weapons: 'appropriate',
    other: ['1D3 distinctive scars', 'war booty worth 2D100 L'],
  },
  warrior_heavy_cavalry: {
    items: [{ id: 'bronze_greaves' }, { id: 'bronze_vambraces' }, { id: 'closed_helm' }, ...WARRIOR_EXTRAS],
    choices: [HEAVY_BODY],
    weapons: 'appropriate',
    other: [
      'riding animal', '1D3 distinctive scars', '20 L in coin',
      'war booty worth 2D100 L',
    ],
  },
  warrior_light_cavalry: {
    items: [
      { id: 'linen_linothorax' }, { id: 'cuirboilli_greaves' }, { id: 'cuirboilli_vambraces' }, { id: 'open_helm' },
      ...WARRIOR_EXTRAS,
    ],
    weapons: 'appropriate',
    other: ['riding animal', '1D3 distinctive scars', 'war booty worth 2D100 L'],
  },
}
