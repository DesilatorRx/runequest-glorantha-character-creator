import {
  CATEGORY_NAMES, LOCATION_NAMES, LOCATION_ROLLS, armorByLocation, charValue, computeDerived,
  birthDate, commonRuneSpells, computeBudget, encCarried, encOver, loadedSkill, occupationKit, remaining, cultOf, gearById, homelandOf, knownSpirit, occupationOf, regionOf, runeSpellById, runeValue, skillLines,
  sorceryLines, spiritSpellById,
} from '../../engine/calc'
import type { Character, SkillCategory } from '../../engine/types'
import { CHARS, ELEMENTAL_RUNES, LOCATIONS, POWER_PAIRS } from '../../engine/types'
import type { Issue } from '../../engine/validate'
import { FAN_NOTICE } from '../legal'
import { CharPop, DerivedPop, PassionPop, RunePop, RuneSpellPop, SkillPop, SorcerySpellPop, SpiritSpellPop } from '../pops'

export function SheetStep({ c, issues }: { c: Character; issues: Issue[] }) {
  const d = computeDerived(c)
  const birth = birthDate(c)
  const sorc = sorceryLines(c)
  const lines = skillLines(c)
  const armor = armorByLocation(c)
  const cult = cultOf(c)
  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')
  const weaponGear = c.gear.filter(g => ['melee', 'missile', 'shield'].includes(gearById(g.id)?.category ?? ''))
  const weapons = weaponGear.map(g => gearById(g.id))
  const over = encOver(c)
  const cats = Object.keys(CATEGORY_NAMES) as SkillCategory[]

  return (
    <div className="stack">
      <div className={`card no-print ${errors.length ? 'status-bad' : 'status-good'}`}>
        {errors.length === 0
          ? <strong>Ready for adventure.{warnings.length > 0 && ` (${warnings.length} note${warnings.length > 1 ? 's' : ''})`}</strong>
          : <strong className="warn">{errors.length} rule issue{errors.length > 1 ? 's' : ''} to fix</strong>}
        {issues.length > 0 && (
          <ul className="small">
            {issues.map((i, n) => <li key={n} className={i.severity === 'error' ? 'bad' : 'warn'}>{i.message}</li>)}
          </ul>
        )}
      </div>

      <article className="sheet">
        <header className="sheet-head">
          <div>
            <h1>{c.name || 'Unnamed adventurer'}</h1>
            <div className="dim">{c.concept}</div>
          </div>
          <div className="sheet-meta small">
            <div>{[homelandOf(c)?.name, regionOf(c)?.name, c.info.clan && `${c.info.clan} clan`].filter(Boolean).join(' · ') || '—'} · Age {c.age}</div>
            {(c.info.gender || birth.season) && <div>{[c.info.gender, [birth.day, birth.week, birth.season].filter(Boolean).join(' of ')].filter(Boolean).join(' · ')}</div>}
            <div>{occupationOf(c)?.name ?? '—'}</div>
            <div>{cult ? `Initiate of ${cult.name}` : '—'}</div>
          </div>
        </header>

        <div className="sheet-grid">
          <section>
            <h3>Characteristics</h3>
            <table className="compact">
              <tbody>
                {CHARS.map(ch => <tr key={ch}><th><CharPop c={c} ch={ch} /></th><td className="num">{charValue(c, ch)}</td></tr>)}
              </tbody>
            </table>
            <h3>Attributes</h3>
            <table className="compact">
              <tbody>
                <tr><th><DerivedPop c={c} k="mp" label="Magic points" /></th><td className="num">{d.magicPoints}</td></tr>
                <tr><th><DerivedPop c={c} k="hp" label="Hit points" /></th><td className="num">{d.hp}</td></tr>
                <tr><th><DerivedPop c={c} k="healing" label="Healing rate" /></th><td className="num">{d.healingRate}</td></tr>
                <tr><th><DerivedPop c={c} k="damageBonus" label="Damage bonus" /></th><td className="num">{d.damageBonus}</td></tr>
                <tr><th><DerivedPop c={c} k="spiritDamage" label="Spirit combat dmg" /></th><td className="num">{d.spiritDamage}</td></tr>
                <tr><th><DerivedPop c={c} k="dexSR" label="DEX SR">DEX</DerivedPop> / <DerivedPop c={c} k="sizSR" label="SIZ SR">SIZ SR</DerivedPop></th><td className="num">{d.dexSR} / {d.sizSR}</td></tr>
                <tr><th><DerivedPop c={c} k="maxEnc" label="Max ENC" /></th><td className="num">{d.maxEnc}</td></tr>
                <tr><th><DerivedPop c={c} k="move" label="Move" /></th><td className="num">{d.move}</td></tr>
                {d.runePoints > 0 && <tr><th><DerivedPop c={c} k="runePoints" label="Rune points" /></th><td className="num">{d.runePoints}</td></tr>}
                <tr><th><DerivedPop c={c} k="reputation" label="Reputation" /></th><td className="num">{d.reputation}%</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3>Runes</h3>
            <table className="compact">
              <tbody>
                {ELEMENTAL_RUNES.filter(r => runeValue(c, r) > 0).map(r => <tr key={r}><th><RunePop c={c} r={r} /></th><td className="num">{runeValue(c, r)}%</td></tr>)}
                {POWER_PAIRS.map(([a, z]) => (
                  <tr key={a}><th><RunePop c={c} r={a} /> / <RunePop c={c} r={z} /></th><td className="num">{runeValue(c, a)} / {runeValue(c, z)}</td></tr>
                ))}
              </tbody>
            </table>
            <h3>Passions</h3>
            <ul className="plain small">
              {c.passions.map(p => <li key={p.uid} className="row"><span><PassionPop p={p} /></span><span className="spacer" /><span className="mono">{p.value}%</span></li>)}
            </ul>
          </section>

          <section>
            <h3>Hit locations</h3>
            <table className="compact">
              <thead><tr><th>D20</th><th>Location</th><th className="num">AP</th><th className="num">HP</th></tr></thead>
              <tbody>
                {LOCATIONS.map(l => (
                  <tr key={l}><td className="mono small">{LOCATION_ROLLS[l]}</td><td>{LOCATION_NAMES[l]}</td><td className="num">{armor[l]}</td><td className="num">{d.locations[l]}</td></tr>
                ))}
              </tbody>
            </table>
            <h3>Magic</h3>
            <p className="small">
              <strong>Spirit:</strong> {knownSpirit(c).length ? knownSpirit(c).map((s, i) => <span key={s.id}>{i > 0 && ', '}<SpiritSpellPop id={s.id} points={s.points}>{spiritSpellById(s.id)?.name ?? s.id} ({s.points})</SpiritSpellPop></span>) : '—'}
              <br />
              <strong>Rune{cult ? ` (${cult.name})` : ''}:</strong> {c.runeSpells.length ? c.runeSpells.map((id, i) => <span key={id}>{i > 0 && ', '}<RuneSpellPop id={id}>{runeSpellById(id)?.name ?? id}</RuneSpellPop></span>) : '—'}
              {cult && <><br /><strong>Common Rune magic:</strong> {commonRuneSpells().map((s, i) => <span key={s.id}>{i > 0 && ', '}<RuneSpellPop id={s.id} /></span>)}</>}
              {sorc.length > 0 && <><br /><strong>Sorcery:</strong> {sorc.map((l, i) => <span key={l.id}>{i > 0 && ', '}<SorcerySpellPop id={l.id}>{l.name}</SorcerySpellPop> {l.total}%</span>)}</>}
            </p>
          </section>
        </div>

        {weapons.length > 0 && (
          <section>
            <h3>Weapons</h3>
            <table className="compact">
              <thead><tr><th>Weapon</th><th className="num">%</th><th>Damage</th><th className="num">SR</th><th className="num">HP</th></tr></thead>
              <tbody>
                {weapons.map((w, i) => {
                  const skill = lines.find(l => l.key === w!.skill)
                  const sr = w!.category === 'missile' ? d.dexSR : d.dexSR + d.sizSR + (w!.sr ?? 0)
                  return (
                    <tr key={i}>
                      <td>{w!.name}{weaponGear[i].stowed && <span className="faint small"> (on mount)</span>}</td>
                      <td className="num">{skill ? loadedSkill(c, skill) : '—'}</td>
                      <td className="mono">{w!.damage}{w!.category === 'melee' && d.damageBonus !== '—' ? ` ${d.damageBonus}` : ''}</td>
                      <td className="num">{sr}</td>
                      <td className="num">{w!.hp}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        )}

        <section>
          <h3>Skills</h3>
          <div className="skill-columns">
            {cats.map(cat => {
              const rows = lines.filter(l => l.skill.category === cat)
              if (!rows.length) return null
              return (
                <div key={cat} className="skill-block">
                  <h4>{CATEGORY_NAMES[cat]}</h4>
                  <ul className="plain small">
                    {rows.map(l => <li key={l.key} className="row nowrap"><span><SkillPop c={c} line={l} /></span><span className="spacer" /><span className="mono">{loadedSkill(c, l) !== l.total ? <><span className="faint" title="Before encumbrance">{l.total}→</span><span className="warn" title="With what you carry">{loadedSkill(c, l)}%</span></> : `${l.total}%`}</span></li>)}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h3>Equipment</h3>
          <p className="small">{c.gear.map(g => `${gearById(g.id)?.name ?? g.id}${g.qty > 1 ? ` ×${g.qty}` : ''}`).join(', ') || '—'}</p>
          {occupationKit(c)?.other.length ? <p className="small dim">Also: {occupationKit(c)!.other.join('; ')}</p> : null}
          <p className="small dim">
            Silver left: {Math.round(remaining(computeBudget(c).silver) * 10) / 10} L · ENC carried {encCarried(c)} of {d.maxEnc}
            {over > 0 && <span className="bad"> ({over} over: −{over} MOV, −{5 * over}% to Agility, Manipulation, Stealth, and weapon skills)</span>}
            {c.gear.some(g => g.stowed) && <> · On mount or at home: {c.gear.filter(g => g.stowed).map(g => gearById(g.id)?.name).join(', ')}</>}
          </p>
        </section>

        {(c.info.heirloom || c.info.scars || c.info.father || c.info.mother || c.info.tribe) && (
          <section>
            <h3>Background</h3>
            <p className="small">
              {c.info.tribe && <>Tribe: {c.info.tribe}. </>}
              {(c.info.father || c.info.mother) && <>Parents: {[c.info.father, c.info.mother].filter(Boolean).join(' and ')}. </>}
              {c.info.handedness === 'left' && <>Left-handed. </>}
              {c.info.scars && <>Scars: {c.info.scars}. </>}
              {c.info.heirloom && <><br />Heirloom: {c.info.heirloom}</>}
            </p>
          </section>
        )}

        {c.notes && (
          <section>
            <h3>Notes</h3>
            <p className="small pre">{c.notes}</p>
          </section>
        )}
        <p className="faint small print-only">{FAN_NOTICE}</p>
      </article>
    </div>
  )
}
