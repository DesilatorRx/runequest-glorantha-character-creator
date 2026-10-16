import { CHAR_NAMES, RUNE_NAMES, computeBudget, homelandOf, opposite, runeCharTargets, runeValue } from '../../engine/calc'
import { RULES } from '../../engine/rules'
import type { ElementalRune, PowerRune, RuneId } from '../../engine/types'
import { ELEMENTAL_RUNES, POWER_PAIRS } from '../../engine/types'
import { RunePop } from '../pops'
import { PoolBadge, Section, type StepProps } from '../ui'

type Slot = 'primary' | 'secondary' | 'tertiary'
const SLOTS: { id: Slot; label: string; value: number }[] = [
  { id: 'primary', label: 'Primary', value: RULES.primaryRune },
  { id: 'secondary', label: 'Secondary', value: RULES.secondaryRune },
  { id: 'tertiary', label: 'Tertiary', value: RULES.tertiaryRune },
]

export function RunesStep({ c, set }: StepProps) {
  const b = computeBudget(c)
  const home = homelandOf(c)
  const targets = runeCharTargets(c)

  const setSlot = (slot: Slot, rune: ElementalRune | '') => set(ch => {
    const runes = { ...ch.runes }
    // Picking a rune already used in another slot swaps them.
    for (const s of SLOTS) if (s.id !== slot && runes[s.id] === rune && rune) runes[s.id] = runes[slot]
    runes[slot] = rune
    return { ...ch, runes }
  })

  const togglePower = (r: PowerRune) => set(ch => {
    if (ch.powerPicks.includes(r)) return { ...ch, powerPicks: ch.powerPicks.filter(x => x !== r) }
    // Picking the other side of a pair replaces it.
    const rest = ch.powerPicks.filter(x => x !== opposite(r))
    if (rest.length >= RULES.powerRunePicks) return ch
    return { ...ch, powerPicks: [...rest, r] }
  })

  const setBonus = (r: RuneId, v: number) => set(ch => ({ ...ch, runeBonus: { ...ch.runeBonus, [r]: Math.max(0, v) } }))
  const bonusInput = (r: RuneId) => (
    <input
      type="number" className="num-input" min={0} step={5} aria-label={`Bonus points to ${RUNE_NAMES[r]}`}
      value={c.runeBonus[r] ?? 0}
      onChange={e => setBonus(r, Number(e.target.value) || 0)}
    />
  )

  return (
    <div className="stack">
      <Section title="Elemental runes">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Affinity</th><th>Rune</th></tr>
            </thead>
            <tbody>
              {SLOTS.map(s => (
                <tr key={s.id}>
                  <th scope="row">{s.label} <span className="faint mono small">{s.value}%</span></th>
                  <td>
                    <select aria-label={`${s.label} rune`} value={c.runes[s.id]} onChange={e => setSlot(s.id, e.target.value as ElementalRune | '')}>
                      <option value="">Choose…</option>
                      {ELEMENTAL_RUNES.map(r => <option key={r} value={r}>{RUNE_NAMES[r]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {home && <p className="small dim">{home.name} adds +{RULES.homelandRuneBonus}% to {RUNE_NAMES[home.rune]}.</p>}
        <p className="small dim">
          Your highest elemental rune adds +{RULES.primaryRuneCharBonus} to its characteristic
          {targets.primary && <> (<span className="good">{CHAR_NAMES[targets.primary]}</span>)</>}, the second-highest
          +{RULES.secondaryRuneCharBonus}{targets.secondary && <> (<span className="good">{CHAR_NAMES[targets.secondary]}</span>)</>}.
          Air → STR, Earth → CON, Darkness → SIZ, Water → DEX, Fire/Sky → INT, Moon → POW.
        </p>
      </Section>

      <Section title="Power and Form runes" aside={<PoolBadge label="Picks" total={b.powerPicks.total} spent={b.powerPicks.spent} />}>
        <p className="small dim">
          Each pair starts at {RULES.powerRuneStart}/{RULES.powerRuneStart}. Choose {RULES.powerRunePicks} runes from different pairs to raise
          to {RULES.powerRuneRaised}%; their opposites drop to {100 - RULES.powerRuneRaised}%.
        </p>
        <div className="stack">
          {POWER_PAIRS.map(([a, z]) => (
            <div key={a} className="rune-pick">
              {[a, z].map(r => (
                <button type="button" key={r} className={c.powerPicks.includes(r) ? 'selected' : ''} aria-pressed={c.powerPicks.includes(r)} onClick={() => togglePower(r)}>
                  {RUNE_NAMES[r]} <span className="mono">{runeValue(c, r)}%</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Bonus rune points" aside={<PoolBadge label="Points" total={b.runeBonus.total} spent={b.runeBonus.spent} />}>
        <p className="small dim">
          Add {RULES.runeBonusPoints} more points to any runes. Elemental runes cap at {RULES.maxElementalRune}%; raising a Power or Form rune lowers
          its opposite, and neither side can pass {RULES.maxPairedRune}%.
        </p>
        <div className="table-wrap">
          <table className="compact">
            <thead><tr><th>Rune</th><th className="num">Bonus</th><th className="num">Value</th></tr></thead>
            <tbody>
              {ELEMENTAL_RUNES.map(r => (
                <tr key={r}><td><RunePop c={c} r={r} /></td><td className="num">{bonusInput(r)}</td><td className="num big-num">{runeValue(c, r)}%</td></tr>
              ))}
              {POWER_PAIRS.flat().map(r => (
                <tr key={r}><td><RunePop c={c} r={r} /></td><td className="num">{bonusInput(r)}</td><td className="num big-num">{runeValue(c, r)}%</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="small" onClick={() => set(ch => ({ ...ch, runeBonus: {} }))}>Clear bonus points</button>
      </Section>
    </div>
  )
}
