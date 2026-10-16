import { useState } from 'react'
import { RUNE_SPELLS, SPIRIT_SPELLS } from '../../data'
import {
  availableSpiritSpells, charValue, commonRuneSpells, computeBudget, computeDerived, cultById, cultOf, knownSpirit, occupationOf, spiritSpellById,
} from '../../engine/calc'
import { RULES } from '../../engine/rules'
import type { LearnedSpirit, RuneSpell } from '../../engine/types'
import { PoolBadge, Section, Stepper, type StepProps } from '../ui'
import { RuneSpellPop, SpiritSpellPop } from '../pops'
import { SorcerySection } from './SorcerySection'

const runeCost = (s: RuneSpell) =>
  `${s.variable ? (s.maxCost ? `${s.cost}–${s.maxCost}` : `${s.cost}+`) : s.cost} pt${s.cost > 1 || s.variable ? 's' : ''}${s.stackable ? ', stackable' : ''}${s.oneUse ? ', one-use' : ''}`

export function MagicStep({ c, set }: StepProps) {
  const cult = cultOf(c)
  const b = computeBudget(c)
  const [anySpirit, setAnySpirit] = useState(false)
  if (!cult) return <p className="dim">Choose a cult first; your starting magic comes from it.</p>

  const cha = charValue(c, 'cha')
  const allowed = availableSpiritSpells(c)
  const prohibited = new Set(cult.prohibitedSpirit ?? [])
  const free = new Map((cult.freeSpirit ?? []).map(s => [s.id, s.points]))
  const spiritList = SPIRIT_SPELLS.filter(s => !prohibited.has(s.id) && (anySpirit || allowed.has(s.id)))
  const known = new Map(c.spiritMagic.map(s => [s.id, s]))
  const costMult = (id: string) => (cult.doubleSpiritExcept && !cult.doubleSpiritExcept.includes(id) ? 2 : 1)
  const setSpirit = (id: string, points: number) => set(ch => {
    const rest = ch.spiritMagic.filter(s => s.id !== id)
    return { ...ch, spiritMagic: points > 0 ? [...rest, { id, points } satisfies LearnedSpirit] : rest }
  })
  const knownTotal = knownSpirit(c).reduce((t, s) => t + s.points, 0)
  const spiritLeft = Math.min(b.spiritMagic.total - b.spiritMagic.spent, cha - knownTotal)
  const usingSorcery = c.sorcery.cultSpells.length > 0

  const special = RUNE_SPELLS.filter(s => cult.runeSpells.includes(s.id))
  const toggleRune = (id: string) => set(ch => ({
    ...ch, runeSpells: ch.runeSpells.includes(id) ? ch.runeSpells.filter(x => x !== id) : [...ch.runeSpells, id],
  }))
  const occ = occupationOf(c)

  return (
    <div className="stack">
      <Section
        title="Spirit magic"
        aside={<PoolBadge label="Points" total={b.spiritMagic.total} spent={b.spiritMagic.spent} />}
      >
        <p className="small dim">
          Choose {b.spiritMagic.total} points from {cult.name}
          {cult.associated?.length ? ` or its associated cults (${cult.associated.map(id => cultById(id)?.name ?? id).join(', ')})` : ''}.
          {occ?.spiritMagic ? ` Your occupation adds ${occ.spiritMagic}.` : ''} Total spirit magic known can't exceed your CHA ({cha}).
          Variable spells can be learned at more than 1 point.
          {cult.doubleSpiritExcept && ` ${cult.name} teaches every spell except ${cult.doubleSpiritExcept.map(id => spiritSpellById(id)?.name).join(' and ')} at double cost.`}
        </p>
        {free.size > 0 && (
          <p className="small good">Free for initiates: {[...free].map(([id, pts]) => `${spiritSpellById(id)?.name ?? id} ${pts}`).join(', ')}.</p>
        )}
        {usingSorcery && <p className="small warn">You took cult sorcery instead of spirit magic.</p>}
        <label className="row small">
          <input type="checkbox" checked={anySpirit} onChange={e => setAnySpirit(e.target.checked)} />
          Show spells from other cults and spirit teachers
        </label>
        <ul className="pick-list">
          {spiritList.map(s => {
            const k = known.get(s.id)
            const mult = costMult(s.id)
            return (
              <li key={s.id} className={`pick-row ${k || free.has(s.id) ? 'chosen' : ''}`}>
                <span className="pick-main">
                  <strong><SpiritSpellPop id={s.id} /></strong>{' '}
                  <span className="faint small">{s.variable ? 'variable' : `${s.cost} pt${s.cost > 1 ? 's' : ''}`}{mult > 1 && ' (double cost)'}</span>
                  {free.has(s.id) && <span className="pill small good">free {free.get(s.id)}</span>}
                  {!allowed.has(s.id) && <span className="pill small">not {cult.name}</span>}
                </span>
                {s.variable
                  ? <Stepper label={s.name} value={k?.points ?? 0} max={99} onChange={v => setSpirit(s.id, v)} disabledUp={spiritLeft < mult} />
                  : (
                    <button type="button" className="pick-add" disabled={!k && spiritLeft < s.cost * mult} onClick={() => setSpirit(s.id, k ? 0 : s.cost)}>
                      {k ? 'Remove' : 'Learn'}
                    </button>
                  )}
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title="Rune magic" aside={<PoolBadge label="Special spells" total={b.runeSpells.total} spent={b.runeSpells.spent} />}>
        <p className="small dim">
          You have {computeDerived(c).runePoints} Rune points in {cult.name}. You know all common Rune magic, and choose {b.runeSpells.total} special Rune
          spells from the cult's list ({RULES.startingRuneSpells}, plus one for each point of POW sacrificed on the Cult step).
        </p>
        <h4>Special Rune magic</h4>
        <ul className="pick-list">
          {special.map(s => {
            const on = c.runeSpells.includes(s.id)
            return (
              <li key={s.id} className={`pick-row ${on ? 'chosen' : ''}`}>
                <span className="pick-main"><strong><RuneSpellPop id={s.id} /></strong> <span className="faint small">{runeCost(s)}</span></span>
                <button type="button" className="pick-add" disabled={!on && b.runeSpells.spent >= b.runeSpells.total} onClick={() => toggleRune(s.id)}>
                  {on ? 'Remove' : 'Choose'}
                </button>
              </li>
            )
          })}
        </ul>
        <h4>Common Rune magic (known)</h4>
        <p className="small">{commonRuneSpells().map((s, i) => <span key={s.id}>{i > 0 && ', '}<RuneSpellPop id={s.id} /> ({runeCost(s)})</span>)}</p>
      </Section>

      <SorcerySection c={c} set={set} />
    </div>
  )
}
