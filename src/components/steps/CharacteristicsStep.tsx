import {
  BASE_CATEGORIES, CATEGORY_NAMES, CHAR_LONG, CHAR_NAMES, LOCATION_NAMES, categoryMod, charBase, charRange, charValue,
  computeBudget, computeDerived, homelandOf, rankedElementals, rollChar, rolledTotal, runeCharBonus, topUpAllowed, RUNE_NAMES,
} from '../../engine/calc'
import { CHAR_DICE, RULES, RUNE_CHAR } from '../../engine/rules'
import type { CharId } from '../../engine/types'
import { CHARS, LOCATIONS } from '../../engine/types'
import { CharPop } from '../pops'
import { PoolBadge, Section, Stepper, type StepProps } from '../ui'

const dice = (ch: CharId) => `${CHAR_DICE[ch].n}D6${CHAR_DICE[ch].bonus ? `+${CHAR_DICE[ch].bonus}` : ''}`
const signed = (n: number) => (n > 0 ? `+${n}` : n === 0 ? '±0' : `−${-n}`)

export function CharacteristicsStep({ c, set }: StepProps) {
  const assign = c.options.charMethod === 'assign'
  const b = computeBudget(c)
  const d = computeDerived(c)
  const setChar = (ch: CharId, v: number) => set(x => ({ ...x, chars: { ...x.chars, [ch]: v } }))
  const rollAll = () => set(x => ({ ...x, topUp: {}, chars: Object.fromEntries(CHARS.map(ch => [ch, rollChar(ch)])) as typeof x.chars }))
  const lowRoll = topUpAllowed(c) || b.topUp.spent > 0
  const homeMods = homelandOf(c)?.charMods
  const ranked = rankedElementals(c)

  return (
    <div className="stack">
      <Section
        title="Characteristics"
        aside={assign
          ? <PoolBadge label="Points" total={b.assign.total} spent={b.assign.spent} />
          : <button type="button" className="primary" onClick={rollAll}>Roll all</button>}
      >
        <div className="table-wrap">
          <table className="attr-table">
            <thead>
              <tr>
                <th>Characteristic</th>
                <th className="num">{assign ? 'Range' : 'Dice'}</th>
                <th className="num">{assign ? 'Points' : 'Rolled'}</th>
                {lowRoll && <th className="num" title="Points added to a low roll">Low roll</th>}
                <th className="num">Rune</th>
                {homeMods && <th className="num">Homeland</th>}
                {(c.powSacrifice > 0 || Object.values(c.agingLoss).some(Boolean)) && <th className="num" title="Aging and POW sacrificed">Other</th>}
                <th className="num">Value</th>
                {!assign && <th />}
              </tr>
            </thead>
            <tbody>
              {CHARS.map(ch => {
                const r = charRange(ch)
                const rb = runeCharBonus(c, ch)
                return (
                  <tr key={ch}>
                    <th scope="row"><CharPop c={c} ch={ch} /> <span className="faint small">{CHAR_LONG[ch]}</span></th>
                    <td className="num dim">{assign ? `${r.min}–${r.max}` : dice(ch)}</td>
                    <td className="num">
                      {assign
                        ? <Stepper label={CHAR_NAMES[ch]} value={c.chars[ch]} min={r.min} max={r.max} onChange={v => setChar(ch, v)} disabledUp={b.assign.spent >= b.assign.total} />
                        : (
                          <input
                            type="number" className="num-input" min={r.min} max={r.max} value={c.chars[ch]}
                            aria-label={`${CHAR_NAMES[ch]} rolled`}
                            onChange={e => setChar(ch, Number(e.target.value) || 0)}
                          />
                        )}
                    </td>
                    {lowRoll && (
                      <td className="num">
                        <Stepper
                          label={`${CHAR_NAMES[ch]} low-roll points`} value={c.topUp[ch] ?? 0}
                          onChange={v => set(x => ({ ...x, topUp: { ...x.topUp, [ch]: v } }))}
                          disabledUp={b.topUp.spent >= b.topUp.total || charBase(c, ch) >= RULES.topUpMax}
                        />
                      </td>
                    )}
                    <td className="num">{rb ? <span className="good">+{rb}</span> : <span className="faint">—</span>}</td>
                    {homeMods && <td className="num">{homeMods[ch] ? <span className={homeMods[ch]! > 0 ? 'good' : 'bad'}>{homeMods[ch]! > 0 ? '+' : ''}{homeMods[ch]}</span> : <span className="faint">—</span>}</td>}
                    {(c.powSacrifice > 0 || Object.values(c.agingLoss).some(Boolean)) && (
                      <td className="num">{(c.agingLoss[ch] ?? 0) + (ch === 'pow' ? c.powSacrifice : 0) ? <span className="bad">−{(c.agingLoss[ch] ?? 0) + (ch === 'pow' ? c.powSacrifice : 0)}</span> : <span className="faint">—</span>}</td>
                    )}
                    <td className="num"><strong className="big-num">{charValue(c, ch)}</strong></td>
                    {!assign && <td><button type="button" className="ghost small" onClick={() => setChar(ch, rollChar(ch))}>Roll</button></td>}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="small dim">
          {assign
            ? 'Distribute your pool among the characteristics, each within its normal dice range.'
            : `Roll here, or type in rolls made at the table. If the rolls total ${RULES.lowRollTotal} or less (yours: ${rolledTotal(c)}), add up to ${RULES.topUpPoints} points, none above ${RULES.topUpMax}.`}{' '}
          Your highest elemental rune adds +{RULES.primaryRuneCharBonus} and your second-highest +{RULES.secondaryRuneCharBonus}, each to its own characteristic or to CHA.
          The human maximum is {RULES.speciesMax}.
        </p>
      </Section>

      {ranked.length > 0 && (
        <Section title="Rune modifiers">
          {(['primary', 'secondary'] as const).map((slot, i) => {
            const rune = ranked[i]
            if (!rune) return null
            const bonus = slot === 'primary' ? RULES.primaryRuneCharBonus : RULES.secondaryRuneCharBonus
            const other = slot === 'primary' ? 'secondary' : 'primary'
            return (
              <label key={slot} className="row">
                <span>{slot === 'primary' ? 'Highest' : 'Second-highest'}: {RUNE_NAMES[rune]} +{bonus} to</span>
                <select value={c.runeCharToCha[slot] ? 'cha' : 'rune'} onChange={e => set(x => ({ ...x, runeCharToCha: { ...x.runeCharToCha, [slot]: e.target.value === 'cha' } }))}>
                  <option value="rune">{CHAR_NAMES[RUNE_CHAR[rune]]}</option>
                  <option value="cha" disabled={!!c.runeCharToCha[other] && !c.runeCharToCha[slot]}>CHA</option>
                </select>
              </label>
            )
          })}
          <p className="small dim">CHA can take only one of the two. Ties for highest follow your primary / secondary / tertiary order.</p>
        </Section>
      )}

      <div className="two-col">
        <Section title="Derived">
          <dl className="glance wide">
            <dt>Hit points</dt><dd className="mono">{d.hp}</dd>
            <dt>Magic points</dt><dd className="mono">{d.magicPoints}</dd>
            <dt>Damage bonus</dt><dd className="mono">{d.damageBonus}</dd>
            <dt>Spirit combat damage</dt><dd className="mono">{d.spiritDamage}</dd>
            <dt>Healing rate</dt><dd className="mono">{d.healingRate}</dd>
            <dt>DEX strike rank</dt><dd className="mono">{d.dexSR}</dd>
            <dt>SIZ strike rank</dt><dd className="mono">{d.sizSR}</dd>
            <dt>Max ENC</dt><dd className="mono">{d.maxEnc}</dd>
            <dt>Movement</dt><dd className="mono">{d.move}</dd>
          </dl>
        </Section>
        <Section title="Skill category modifiers">
          <dl className="glance wide">
            {BASE_CATEGORIES.map(cat => (
              <div key={cat} className="glance-pair">
                <dt>{CATEGORY_NAMES[cat]}</dt><dd className="mono">{signed(categoryMod(c, cat))}</dd>
              </div>
            ))}
          </dl>
          <h4>Hit points by location</h4>
          <dl className="glance wide">
            {LOCATIONS.map(l => (
              <div key={l} className="glance-pair"><dt>{LOCATION_NAMES[l]}</dt><dd className="mono">{d.locations[l]}</dd></div>
            ))}
          </dl>
        </Section>
      </div>
    </div>
  )
}
