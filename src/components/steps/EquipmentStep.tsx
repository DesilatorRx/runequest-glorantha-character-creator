import { useState } from 'react'
import { GEAR } from '../../data'
import { LOCATION_NAMES, computeBudget, computeDerived, encCarried, gearById, homelandOf, occupationOf, skillById } from '../../engine/calc'
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
  const add = (id: string) => set(ch => {
    const has = ch.gear.find(g => g.id === id)
    return has
      ? { ...ch, gear: ch.gear.map(g => (g.id === id ? { ...g, qty: g.qty + 1 } : g)) }
      : { ...ch, gear: [...ch.gear, { uid: uid(), id, qty: 1 }] }
  })

  return (
    <div className="stack">
      <Section title="Owned" aside={<span className="row"><PoolBadge label="Silver" total={b.silver.total} spent={b.silver.spent} unit=" L" /><PoolBadge label="ENC" total={d.maxEnc} spent={encCarried(c)} /></span>}>
        {c.gear.length === 0 && <p className="dim">Nothing yet. Your occupation sets your starting wealth{occupationOf(c)?.wealthNote ? ` (${occupationOf(c)!.wealthNote})` : ''}.</p>}
        <ul className="pick-list">
          {c.gear.map(g => {
            const item = gearById(g.id)
            if (!item) return null
            return (
              <li key={g.uid} className="pick-row">
                <span className="pick-main"><strong>{item.name}</strong> <span className="faint small">{stats(item)}</span></span>
                <span className="row nowrap">
                  <span className="mono small dim">{lunars(item.cost * g.qty)}</span>
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
