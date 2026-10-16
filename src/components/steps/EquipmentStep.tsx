import { useState } from 'react'
import { GEAR } from '../../data'
import {
  LOCATION_NAMES, computeBudget, computeDerived, encCarried, gearById, homelandOf, kitGear, kitWeaponSkills, occupationKit, occupationOf, skillById, skillName,
  weaponsForSkill,
} from '../../engine/calc'
import type { GearCategory, GearItem } from '../../engine/types'
import { uid } from '../../state/store'
import { PoolBadge, Section, Stepper, type StepProps } from '../ui'

const CATS: { id: GearCategory; name: string }[] = [
  { id: 'melee', name: 'Melee weapons' },
  { id: 'missile', name: 'Missile weapons' },
  { id: 'shield', name: 'Shields' },
  { id: 'armor', name: 'Armor' },
  { id: 'gear', name: 'Equipment' },
]

function stats(g: GearItem): string {
  if (g.category === 'armor') return `${g.ap} AP · ${(g.covers ?? []).map(l => LOCATION_NAMES[l]).join(', ')}`
  return [g.damage, g.sr !== undefined && `SR ${g.sr}`, g.hp && `${g.hp} HP`, g.range && `${g.range} m`].filter(Boolean).join(' · ')
}

/** Lunars with clacks as a decimal (1 L = 10 clacks), without floating-point noise. */
const lunars = (n: number) => `${Math.round(n * 10) / 10} L`

export function EquipmentStep({ c, set }: StepProps) {
  const [cat, setCat] = useState<GearCategory>('melee')
  const [query, setQuery] = useState('')
  const b = computeBudget(c)
  const d = computeDerived(c)
  const cultural = new Set(homelandOf(c)?.culturalWeapons ?? [])
  // Buying merges with a bought stack of the same item, never with a free kit item.
  const add = (id: string) => set(ch => {
    const has = ch.gear.find(g => g.id === id && !g.kit)
    return has
      ? { ...ch, gear: ch.gear.map(g => (g === has ? { ...g, qty: g.qty + 1 } : g)) }
      : { ...ch, gear: [...ch.gear, { uid: uid(), id, qty: 1 }] }
  })

  return (
    <div className="stack">
      <StartingKit c={c} set={set} />

      <Section title="Owned" aside={<span className="row"><PoolBadge label="Silver left" total={b.silver.total} spent={b.silver.spent} unit=" L" /><PoolBadge label="ENC left" total={d.maxEnc} spent={encCarried(c)} /></span>}>
        {c.gear.length === 0 && <p className="dim">Nothing yet. Your occupation sets your starting wealth{occupationOf(c)?.wealthNote ? ` (${occupationOf(c)!.wealthNote})` : ''}.</p>}
        <ul className="pick-list">
          {c.gear.map(g => {
            const item = gearById(g.id)
            if (!item) return null
            return (
              <li key={g.uid} className="pick-row">
                <span className="pick-main">
                  <strong>{item.name}</strong> {g.kit && <span className="pill good">starting gear · free</span>}{' '}
                  <span className="faint small">{stats(item)}</span>
                </span>
                <span className="row nowrap">
                  <span className="mono small dim">{g.kit ? 'free' : lunars(item.cost * g.qty)}</span>
                  <Stepper label={item.name} value={g.qty} min={0} onChange={v => set(ch => ({
                    ...ch, gear: v > 0 ? ch.gear.map(x => (x.uid === g.uid ? { ...x, qty: v } : x)) : ch.gear.filter(x => x.uid !== g.uid),
                  }))} />
                </span>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title="Buy">
        <div className="seg" role="tablist">
          {CATS.map(x => <button type="button" role="tab" aria-selected={cat === x.id} key={x.id} className={cat === x.id ? 'selected' : ''} onClick={() => setCat(x.id)}>{x.name}</button>)}
        </div>
        <input type="search" className="gear-search" placeholder="Search…" aria-label="Search equipment" value={query} onChange={e => setQuery(e.target.value)} />
        <ul className="pick-list" style={{ marginTop: '0.75rem' }}>
          {GEAR.filter(g => g.category === cat && g.name.toLowerCase().includes(query.trim().toLowerCase())).map((g, i, list) => (
            <li key={g.id} className="pick-row-wrap">
              {g.group && g.group !== list[i - 1]?.group && <h4 className="gear-group-head">{g.group}</h4>}
              <div className="pick-row">
              <span className="pick-main">
                <strong>{g.name}</strong>{' '}
                {g.skill && cultural.has(g.skill) && <span className="pill accent small">cultural</span>}{' '}
                <span className="faint small">{[stats(g), g.skill && g.category !== 'shield' && skillById(g.skill)?.name, g.enc ? `ENC ${g.enc}` : '', g.mqPenalty ? `Move Quietly −${g.mqPenalty}%` : ''].filter(Boolean).join(' · ')}</span>
              </span>
              <span className="row nowrap">
                <span className="mono small dim">{lunars(g.cost)}{g.costMax ? `–${lunars(g.costMax)}` : ''}</span>
                <button type="button" className="pick-add" onClick={() => add(g.id)}>Add</button>
              </span>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}

/** The occupation's free starting kit: catalog items, either/or picks, free weapons for trained skills, and the rest. */
function StartingKit({ c, set }: StepProps) {
  const occ = occupationOf(c)
  const kit = occupationKit(c)
  if (!occ || !kit) return null
  const kitItems = c.gear.filter(g => g.kit && !g.kitSkill)
  const expected = kitGear(c.occupation, c.kitPicks, uid)
  const missing = expected.filter(e => !kitItems.some(g => g.id === e.id))
  const weaponSkills = kitWeaponSkills(c)
  const restore = () => set(ch => ({ ...ch, gear: [...kitGear(ch.occupation, ch.kitPicks, uid), ...ch.gear.filter(g => !g.kit || g.kitSkill)] }))
  const pickChoice = (i: number, id: string) => set(ch => {
    const picks = { ...ch.kitPicks, [i]: id }
    return { ...ch, kitPicks: picks, gear: [...kitGear(ch.occupation, picks, uid), ...ch.gear.filter(g => !g.kit || g.kitSkill)] }
  })
  const takeWeapon = (skill: string, id: string) => set(ch => ({
    ...ch, gear: [...ch.gear.filter(g => g.kitSkill !== skill), ...(id ? [{ uid: uid(), id, qty: 1, kit: true, kitSkill: skill }] : [])],
  }))

  return (
    <Section title={`Starting kit: ${occ.name}`} aside={missing.length > 0 && <button type="button" className="small" onClick={restore}>Restore kit</button>}>
      <p className="small dim">Your occupation's equipment is yours free; it doesn't cost any of your starting silver. Remove anything you don't want below.</p>
      {kit.choices?.map((ch, i) => (
        <label key={i} className="row">
          <span>{ch.label}</span>
          <select value={c.kitPicks[i] ?? ch.options[0]} onChange={e => pickChoice(i, e.target.value)}>
            {ch.options.map(id => <option key={id} value={id}>{id.split('+').map(x => gearById(x)?.name ?? x).join(' + ')}</option>)}
          </select>
        </label>
      ))}
      {weaponSkills.length > 0 && (
        <>
          <h4>{kit.weapons === 'appropriate' ? 'Your weapons' : 'Cultural weapons'} (free, one per skill)</h4>
          <ul className="grant-list">
            {weaponSkills.map(skill => {
              const options = weaponsForSkill(skill)
              const taken = c.gear.find(g => g.kitSkill === skill)
              return (
                <li key={skill}>
                  <span className="kit-skill">{skillName(c, skill)}</span>
                  {options.length
                    ? (
                      <select aria-label={`Free weapon for ${skillName(c, skill)}`} value={taken?.id ?? ''} onChange={e => takeWeapon(skill, e.target.value)}>
                        <option value="">— none —</option>
                        {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    )
                    : <span className="faint small">no catalog item</span>}
                </li>
              )
            })}
          </ul>
          <p className="small dim">
            {kit.weapons === 'appropriate'
              ? 'The book gives "appropriate weapons": one for each weapon skill your occupation trains.'
              : 'The book gives your cultural weapons: one for each cultural weapon skill your occupation trains (or any cultural weapon if it trains none).'}
          </p>
        </>
      )}
      {kit.other.length > 0 && (
        <>
          <h4>Also in your kit</h4>
          <ul className="plain small kit-other">{kit.other.map(t => <li key={t}>{t}</li>)}</ul>
        </>
      )}
    </Section>
  )
}
