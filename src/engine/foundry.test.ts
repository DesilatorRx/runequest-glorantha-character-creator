import { describe, expect, it } from 'vitest'
import { newCharacter } from '../state/store'
import { buildFoundryActor } from './foundry'

type Doc = { _id: string; type: string; name: string; system: Record<string, any>; flags: { rqg?: { documentRqidFlags: { id: string } } } }

const sample = () => {
  const c = newCharacter()
  c.name = 'Vasana'
  c.homeland = 'sartar'
  c.runes = { primary: 'air', secondary: 'moon', tertiary: 'earth' }
  c.powerPicks = ['movement', 'death']
  c.occupation = 'warrior_heavy_infantry'
  c.occupationPicks = { 5: 'broadsword' }
  c.cult = 'orlanth_adventurous'
  c.cultStartPicks = { 3: 'broadsword' }
  c.cultPicks = ['orate', 'sing']
  c.runeSpells = ['lightning', 'flight', 'shield']
  c.spiritMagic = [{ id: 'heal', points: 2 }, { id: 'demoralize', points: 2 }]
  c.gear = [{ uid: 'a', id: 'broadsword', qty: 1 }, { uid: 'b', id: 'shield_medium', qty: 1 }, { uid: 'c', id: 'closed_helm', qty: 1 }, { uid: 'd', id: 'battle_axe', qty: 1, stowed: true }]
  c.passions = [{ uid: 'p', kind: 'Loyalty', target: 'Sartar', value: 70 }]
  return c
}

describe('Foundry VTT export', () => {
  const actor = buildFoundryActor(sample()) as { type: string; system: Record<string, any>; items: Doc[] }
  const items = actor.items

  it('is a character actor with characteristics and items', () => {
    expect(actor.type).toBe('character')
    expect(Object.keys(actor.system.characteristics)).toEqual(['strength', 'constitution', 'size', 'dexterity', 'intelligence', 'power', 'charisma'])
    for (const t of ['hitLocation', 'rune', 'skill', 'passion', 'weapon', 'armor', 'cult', 'runeMagic', 'spiritMagic'])
      expect(items.some(i => i.type === t), t).toBe(true)
  })

  it('gives every item a unique 16-character id and an rqid where Foundry expects one', () => {
    const ids = items.map(i => i._id)
    expect(ids.every(id => /^[A-Za-z0-9]{16}$/.test(id))).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
    for (const i of items.filter(x => ['skill', 'rune', 'hitLocation', 'passion'].includes(x.type)))
      expect(i.flags.rqg?.documentRqidFlags.id, i.name).toBeTruthy()
  })

  it('links Rune spells to the cult item and weapons to skills on the actor', () => {
    const cult = items.find(i => i.type === 'cult')!
    expect(items.filter(i => i.type === 'runeMagic').every(i => i.system.cultId === cult._id)).toBe(true)
    const skillRqids = new Set(items.filter(i => i.type === 'skill').map(i => i.flags.rqg!.documentRqidFlags.id))
    for (const w of items.filter(i => i.type === 'weapon')) {
      const links = Object.values(w.system.usage as Record<string, { skillRqidLink: { rqid: string } | null }>).flatMap(u => (u?.skillRqidLink ? [u.skillRqidLink.rqid] : []))
      expect(links.some(r => skillRqids.has(r)), `${w.name} → ${links.join(', ')}`).toBe(true)
    }
  })

  it('exports skills as base plus gained, and stowed gear as not carried', () => {
    const worship = items.find(i => i.type === 'skill' && i.name === 'Worship (Orlanth)')!
    expect(worship.flags.rqg!.documentRqidFlags.id).toBe('i.skill.worship-orlanth')
    expect(worship.system.gainedChance).toBe(20)
    expect(items.find(i => i.name === 'Battle Axe')!.system.equippedStatus).toBe('notCarried')
    expect(items.find(i => i.type === 'armor')!.system.equippedStatus).toBe('equipped')
  })
})
