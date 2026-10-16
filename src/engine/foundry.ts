// Export an adventurer as a Foundry VTT actor for the RuneQuest: Roleplaying in Glorantha system (id 'rqg').
// In Foundry: create a Character actor, right-click it in the Actors sidebar, choose "Import Data", and pick the file.
// Foundry works out category modifiers, hit points per location, and other derived values itself, so skills are
// exported as base chance + points gained (homeland, occupation, cult, history, personal).

import {
  FOUNDRY_ARMOR_RQID, FOUNDRY_CULTS, FOUNDRY_HIT_LOCATIONS, FOUNDRY_HOMELAND, FOUNDRY_OCCUPATION, FOUNDRY_PASSION_RQID,
  FOUNDRY_RUNE_SPELL_RQID, FOUNDRY_RUNES, FOUNDRY_SKILLS, FOUNDRY_SPIRIT_RQID, FOUNDRY_SYSTEM, FOUNDRY_WEAPONS, toFoundryKebab,
} from '../data/foundryMap'
import { RUNE_SPELL_INFO } from '../data/spellInfoRune'
import {
  LOCATION_NAMES, charValue, computeDerived, cultOf, gearById, homelandOf, knownSpirit, occupationOf, parseKey, regionOf,
  runeSpellById, runeValue, skillLines, spiritSpellById,
} from './calc'
import { CHAR_DICE } from './rules'
import type { Character, CharId, RuneId } from './types'
import { CHARS, ELEMENTAL_RUNES, POWER_PAIRS } from './types'

type Doc = Record<string, unknown>

const CHAR_KEYS: Record<CharId, string> = {
  str: 'strength', con: 'constitution', siz: 'size', dex: 'dexterity', int: 'intelligence', pow: 'power', cha: 'charisma',
}

/** Foundry document ids: 16 alphanumeric characters. */
function makeId(seed: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let h = 2166136261
  let out = ''
  for (let i = 0; i < 16; i++) {
    for (const ch of seed + i) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
    out += chars[Math.abs(h) % chars.length]
  }
  return out
}

const rqidFlags = (rqid: string | undefined) => (rqid ? { rqg: { documentRqidFlags: { id: rqid, lang: 'en', priority: '0' } } } : {})
const item = (type: string, name: string, system: Doc, rqid?: string, id?: string): Doc =>
  ({ _id: id ?? makeId(`${type}:${name}`), type, name, system, flags: rqidFlags(rqid) })
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function skillItems(c: Character): Doc[] {
  return skillLines(c).flatMap(l => {
    const f = FOUNDRY_SKILLS[l.skill.id]
    if (!f) return []
    const { subject } = parseKey(l.key)
    const specialization = subject ?? f.specialization ?? ''
    const name = specialization ? `${f.skillName} (${specialization})` : f.name
    // A skill with a subject has the generic rqid plus the subject, e.g. i.skill.worship-orlanth.
    const rqid = subject ? `${f.rqid}-${toFoundryKebab(subject)}` : f.rqid
    // Foundry adds the category modifier itself; send what the adventurer gained on top of the base.
    const gained = Math.max(0, l.total - l.base - l.catMod)
    return [item('skill', name, { category: f.category, skillName: f.skillName, specialization, baseChance: l.base, gainedChance: gained }, rqid, makeId(`skill:${l.key}`))]
  })
}

function runeItems(c: Character): Doc[] {
  const runes = [...ELEMENTAL_RUNES, ...POWER_PAIRS.flat()] as RuneId[]
  return runes.flatMap(r => {
    const f = FOUNDRY_RUNES[r]
    if (!f) return []
    return [item('rune', f.name, {
      rune: f.name.replace(/ \(.*\)$/, ''), chance: runeValue(c, r), runeType: { type: f.runeType, name: f.runeType },
      ...(f.opposing ? { opposingRuneRqidLink: f.opposing } : {}),
    }, f.rqid, makeId(`rune:${r}`))]
  })
}

function passionItems(c: Character): Doc[] {
  return c.passions.map(p => item('passion', p.target ? `${p.kind} (${p.target})` : p.kind,
    { passion: p.kind, subject: p.target, chance: p.value }, FOUNDRY_PASSION_RQID[p.kind], makeId(`passion:${p.uid}`)))
}

function hitLocationItems(): Doc[] {
  return FOUNDRY_HIT_LOCATIONS.map(h => item('hitLocation', h.name, h.system, h.rqid, makeId(`hit:${h.name}`)))
}

const locationLink = (loc: keyof typeof LOCATION_NAMES) => {
  const h = FOUNDRY_HIT_LOCATIONS.find(x => x.name.toLowerCase() === LOCATION_NAMES[loc].toLowerCase())
  return h ? { name: h.name, rqid: h.rqid } : { name: LOCATION_NAMES[loc], rqid: '' }
}

function gearItems(c: Character): Doc[] {
  return c.gear.flatMap(g => {
    const it = gearById(g.id)
    if (!it) return []
    const status = g.stowed ? 'notCarried' : it.category === 'armor' ? 'equipped' : 'carried'
    const id = makeId(`gear:${g.uid}`)
    if (it.category === 'melee' || it.category === 'missile' || it.category === 'shield') {
      const f = FOUNDRY_WEAPONS[g.id]
      // Some of our items share a Foundry template (hide and wicker shields use the wooden one): keep our name and price.
      if (f) return [item('weapon', it.name, { ...f.system, quantity: g.qty, price: { real: it.cost, estimated: 0 }, equippedStatus: status }, f.rqid, id)]
    }
    if (it.category === 'armor') {
      return [item('armor', it.name, {
        hitLocationRqidLinks: (it.covers ?? []).map(locationLink),
        armorType: it.name, material: '', absorbs: it.ap ?? 0, encumbrance: it.enc, price: { real: it.cost, estimated: 0 },
        moveQuietlyPenalty: it.mqPenalty ?? 0, physicalItemType: 'unique', equippedStatus: status,
      }, FOUNDRY_ARMOR_RQID[g.id], id)]
    }
    return [item('gear', it.name, {
      quantity: g.qty, price: { real: it.cost, estimated: 0 }, encumbrance: it.enc, physicalItemType: 'unique', equippedStatus: status,
    }, undefined, id)]
  })
}

/** Fist, Grapple, and Kick: every adventurer has them, as Foundry's own pregenerated adventurers do. */
function naturalWeapons(): Doc[] {
  const natural = (name: string, skill: { rqid: string; name: string }, damage: string, maneuver: string, damageType: string, hitPointLocation: string) =>
    item('weapon', name, {
      usage: {
        oneHand: { skillRqidLink: skill, combatManeuvers: [{ name: maneuver, damageType }], damage, strikeRank: 4 },
        offHand: { skillRqidLink: null, combatManeuvers: [], strikeRank: 4 },
        twoHand: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0, strikeRank: 0 },
        missile: { skillRqidLink: null, combatManeuvers: [], minStrength: 0, minDexterity: 0 },
      },
      hitPoints: { value: null, max: null }, hitPointLocation, encumbrance: 0, physicalItemType: 'unique', quantity: 1, isContainer: false,
      price: { real: 0, estimated: 0 }, isNatural: true, equippedStatus: 'equipped', range: 0,
      isProjectile: false, isProjectileWeapon: false, isThrownWeapon: false, isRangedWeapon: false,
    }, `i.weapon.${toFoundryKebab(name)}`, makeId(`natural:${name}`))
  const sk = (id: string) => ({ rqid: FOUNDRY_SKILLS[id].rqid, name: FOUNDRY_SKILLS[id].name })
  return [
    natural('Fist', sk('fist'), '1d3+db', 'Punch', 'crush', 'arm'),
    natural('Grapple', sk('grapple'), '', 'Grapple', 'special', 'arm'),
    natural('Kick', sk('kick'), '1d6+db', 'Kick', 'crush', 'leg'),
  ]
}

function magicItems(c: Character): Doc[] {
  const cult = cultOf(c)
  if (!cult) return []
  const f = FOUNDRY_CULTS[cult.id]
  const cultId = makeId(`cult:${cult.id}`)
  const runePoints = computeDerived(c).runePoints
  const cultItem = item('cult', f?.name ?? cult.name, {
    deity: f?.deity ?? cult.deity ?? cult.name,
    joinedCults: [{ cultName: cult.name, tagline: '', rank: 'initiate' }],
    runePoints: { value: runePoints, max: runePoints },
    runeRqidLinks: f?.runeRqidLinks ?? [],
  }, f?.rqid, cultId)
  const runeSpells = c.runeSpells.flatMap(id => {
    const s = runeSpellById(id)
    if (!s) return []
    const runes = (RUNE_SPELL_INFO[id]?.runes ?? []).flatMap(r => (FOUNDRY_RUNES[r] ? [{ rqid: FOUNDRY_RUNES[r].rqid, name: FOUNDRY_RUNES[r].name }] : []))
    return [item('runeMagic', s.name, {
      points: s.cost, isStackable: !!s.stackable, isOneUse: !!s.oneUse, runeRqidLinks: runes, cultId,
    }, FOUNDRY_RUNE_SPELL_RQID[id], makeId(`rune-magic:${id}`))]
  })
  const spirit = knownSpirit(c).flatMap(k => {
    const s = spiritSpellById(k.id)
    if (!s) return []
    return [item('spiritMagic', s.name, { points: k.points, isVariable: !!s.variable }, FOUNDRY_SPIRIT_RQID[k.id], makeId(`spirit:${k.id}`))]
  })
  return [cultItem, ...runeSpells, ...spirit]
}

/** The adventurer as a Foundry VTT actor document for the 'rqg' system. */
export function buildFoundryActor(c: Character): Doc {
  const d = computeDerived(c)
  const occ = occupationOf(c)
  const notes = [c.concept, c.notes, c.info.heirloom && `Heirloom: ${c.info.heirloom}`, c.info.scars && `Scars: ${c.info.scars}`]
    .filter(Boolean).map(t => `<p>${escapeHtml(String(t))}</p>`).join('')
  return {
    name: c.name || 'Unnamed adventurer',
    type: 'character',
    system: {
      characteristics: Object.fromEntries(CHARS.map(ch => {
        const dice = CHAR_DICE[ch]
        return [CHAR_KEYS[ch], { value: charValue(c, ch), formula: `${dice.n}d6${dice.bonus ? `+${dice.bonus}` : ''}` }]
      })),
      background: {
        species: 'Homo sapiens sapiens',
        occupation: FOUNDRY_OCCUPATION[c.occupation] ?? '',
        homeland: FOUNDRY_HOMELAND[c.homeland] ?? '',
        age: c.age,
        gender: c.info.gender,
        tribe: c.info.tribe || regionOf(c)?.name || '',
        clan: c.info.clan,
        reputation: d.reputation,
        ransom: occ?.ransom ?? null,
        biography: notes,
      },
      attributes: {
        magicPoints: { value: d.magicPoints },
        hitPoints: { value: d.hp },
      },
    },
    items: [
      ...hitLocationItems(), ...runeItems(c), ...skillItems(c), ...passionItems(c), ...naturalWeapons(), ...gearItems(c), ...magicItems(c),
    ],
    flags: {
      'rqg-character-creator': {
        exportedFrom: 'https://desilatorrx.github.io/runequest-glorantha-character-creator/',
        system: `${FOUNDRY_SYSTEM.id} ${FOUNDRY_SYSTEM.testedVersion}`,
        homeland: homelandOf(c)?.name ?? null,
      },
    },
  }
}
