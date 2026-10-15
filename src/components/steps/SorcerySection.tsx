import { SORCERY_RULES, SORCERY_RUNES, SORCERY_SPELLS, SORCERY_TECHNIQUES, maxMasteries } from '../../data/sorcery'
import { charValue, isPhilosopher, knownSpirit, sorceryCultOf, sorceryLines, sorceryMasteries } from '../../engine/calc'
import type { Character } from '../../engine/types'
import { PoolBadge, Section, type StepProps } from '../ui'

type Field = 'runes' | 'techniques' | 'spells' | 'cultSpells'

/** Sorcery on the Magic step: for Philosophers (p.70) and initiates of a cult that teaches sorcery (p.73). */
export function SorcerySection({ c, set }: StepProps) {
  const philosopher = isPhilosopher(c)
  const sCult = sorceryCultOf(c)
  if (!philosopher && !sCult) return null

  const int = charValue(c, 'int')
  const m = sorceryMasteries(c)
  const lines = sorceryLines(c)
  const spiritPts = knownSpirit(c).reduce((t, s) => t + s.points, 0)
  const toggle = (field: Field, id: string, max: number) => set((ch: Character) => {
    const list = ch.sorcery[field]
    const next = list.includes(id) ? list.filter(x => x !== id) : list.length < max ? [...list, id] : list
    // Cult sorcery is taken instead of cult spirit magic.
    const spiritMagic = field === 'cultSpells' && next.length ? [] : ch.spiritMagic
    return { ...ch, spiritMagic, sorcery: { ...ch.sorcery, [field]: next } }
  })
  const chip = (field: Field, id: string, name: string, max: number, note?: string) => {
    const on = c.sorcery[field].includes(id)
    return (
      <button type="button" key={id} className={on ? 'selected' : ''} aria-pressed={on} disabled={!on && c.sorcery[field].length >= max} onClick={() => toggle(field, id, max)}>
        {name}{note && <span className="faint small"> {note}</span>}
      </button>
    )
  }
  const spellNote = (id: string) => {
    const s = SORCERY_SPELLS.find(x => x.id === id)!
    return `${s.cost}${s.costUnit === 'pow' ? ' POW' : ' MP'}`
  }

  return (
    <Section title="Sorcery" aside={<span className="row"><PoolBadge label="Free INT" total={int} spent={lines.length + spiritPts} /></span>}>
      <p className="small dim">
        Sorcery needs INT {SORCERY_RULES.minIntForSorcery}+ (yours is {int}); you can master {maxMasteries(int)} Runes and techniques in total.
        Each spell is its own skill: your Magic modifier plus any starting bonus, never above your best Read/Write.
        Memorized spells plus spirit magic points can't exceed INT.
      </p>

      {philosopher && (
        <>
          <h4>Philosopher: master {SORCERY_RULES.philosopherRunesMastered} Rune</h4>
          <div className="rune-pick">{SORCERY_RUNES.map(r => chip('runes', r.id, r.name, SORCERY_RULES.philosopherRunesMastered))}</div>
          <h4>…and {SORCERY_RULES.philosopherTechniquesMastered} technique</h4>
          <div className="rune-pick">{SORCERY_TECHNIQUES.map(t => chip('techniques', t.id, t.name, SORCERY_RULES.philosopherTechniquesMastered))}</div>
          <h4>…and {SORCERY_RULES.philosopherSpellsKnown} spells (+{SORCERY_RULES.philosopherSpellBonuses.join('%, +')}% in the order chosen)</h4>
          <div className="rune-pick">{SORCERY_SPELLS.map(s => chip('spells', s.id, s.name, SORCERY_RULES.philosopherSpellsKnown, spellNote(s.id)))}</div>
        </>
      )}

      {sCult && (
        <>
          <h4>{sCult.name} cult sorcery (instead of spirit magic)</h4>
          <p className="small dim">
            Take up to {SORCERY_RULES.cultSpellsMax} spells (+{sCult.spellBonuses?.join('%, +')}% in the order chosen); you then start with no cult spirit magic,
            and with {sCult.startingRunes.join(', ')} and {sCult.startingTechniques.join(', ')} mastered.
          </p>
          <div className="rune-pick">
            {sCult.spells.map(id => chip('cultSpells', id, SORCERY_SPELLS.find(s => s.id === id)?.name ?? id, SORCERY_RULES.cultSpellsMax, spellNote(id)))}
          </div>
        </>
      )}

      {lines.length > 0 && (
        <>
          <h4>Known</h4>
          <table className="compact">
            <thead><tr><th>Spell</th><th className="num">Bonus</th><th className="num">%</th><th className="num">Cost</th></tr></thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.id}>
                  <td>{l.name}</td><td className="num">+{l.bonus}</td><td className="num">{l.total}</td>
                  <td className="num">{l.costMultiplier > 1 ? <span className="warn">×{l.costMultiplier}</span> : '×1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small dim">
            Mastered: {[...m.runes, ...m.techniques].join(', ') || 'none'}. Spells using an unmastered Rune or technique cost double (×4 if both).
          </p>
        </>
      )}
    </Section>
  )
}
