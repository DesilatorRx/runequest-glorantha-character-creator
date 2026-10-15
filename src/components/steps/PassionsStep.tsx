import { homelandOf, skillChoices } from '../../engine/calc'
import { RULES } from '../../engine/rules'
import type { Passion, PassionKind } from '../../engine/types'
import { homelandPassions, uid } from '../../state/store'
import { Section, SkillSelect, Stepper, type StepProps } from '../ui'

const KINDS: PassionKind[] = ['Devotion', 'Fear', 'Hate', 'Honor', 'Love', 'Loyalty']

export function PassionsStep({ c, set }: StepProps) {
  const update = (id: string, patch: Partial<Passion>) =>
    set(ch => ({ ...ch, passions: ch.passions.map(p => (p.uid === id ? { ...p, ...patch } : p)) }))

  return (
    <div className="stack">
      <Section
        title="Passions"
        aside={
          <span className="row">
            {homelandOf(c) && (
              <button type="button" className="small" onClick={() => set(ch => ({ ...ch, passions: homelandPassions(ch.homeland) }))}>
                Reset to {homelandOf(c)!.name} defaults
              </button>
            )}
            <button type="button" className="small" onClick={() => set(ch => ({ ...ch, passions: [...ch.passions, { uid: uid(), kind: 'Love', target: '', value: RULES.basePassion }] }))}>
              + Passion
            </button>
          </span>
        }
      >
        {c.passions.length === 0 && <p className="dim">Choose a homeland to get its starting passions, or add your own.</p>}
        <div className="table-wrap">
          <table>
            <tbody>
              {c.passions.map(p => (
                <tr key={p.uid}>
                  <td>
                    <select aria-label="Passion" value={p.kind} onChange={e => update(p.uid, { kind: e.target.value as PassionKind })}>
                      {KINDS.map(k => <option key={k}>{k}</option>)}
                    </select>
                  </td>
                  <td><input type="text" aria-label="Passion target" placeholder={p.kind === 'Honor' ? '(none needed)' : 'family, clan, a deity, an enemy…'} value={p.target} onChange={e => update(p.uid, { target: e.target.value })} /></td>
                  <td className="num nowrap"><Stepper label={`${p.kind} ${p.target}`} value={p.value} min={0} max={100} onChange={v => update(p.uid, { value: v })} /><span className="faint">%</span></td>
                  <td className="nowrap">
                    <button type="button" className="ghost small" onClick={() => update(p.uid, { value: Math.min(100, p.value + 10) })}>+10</button>
                    <button type="button" className="ghost small" onClick={() => update(p.uid, { value: Math.max(0, p.value - 10) })}>−10</button>
                    <button type="button" className="ghost danger small" aria-label="Remove passion" onClick={() => set(ch => ({ ...ch, passions: ch.passions.filter(x => x.uid !== p.uid) }))}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small dim">
          Family history events raise, lower, or add passions; apply them here as you roll through your family's past.
          Your cult adds Devotion when you are initiated.
        </p>
      </Section>

      <Section title="Family history">
        <p className="small dim">
          Roll your grandparent's, parent's, and your own history with the year-by-year tables in the book (Step 2), then record the
          results here: passions above, and any skill or Reputation bonuses below. Family history is optional. To skip it, add up to
          three more passions at {RULES.basePassion}%, then +20% to one passion and +10% to another.
        </p>
        <h4>Skill bonuses from history or heirloom</h4>
        <ul className="grant-list">
          {c.historySkills.map(h => (
            <li key={h.uid}>
              <Stepper label="History bonus" value={h.bonus} min={1} max={50} onChange={v => set(ch => ({ ...ch, historySkills: ch.historySkills.map(x => (x.uid === h.uid ? { ...x, bonus: v } : x)) }))} />
              <SkillSelect label="History skill" value={h.key} options={skillChoices(c)}
                onChange={k => set(ch => ({ ...ch, historySkills: ch.historySkills.map(x => (x.uid === h.uid ? { ...x, key: k } : x)) }))} />
              <input type="text" aria-label="Source" placeholder="e.g. famous ancestor" value={h.note}
                onChange={e => set(ch => ({ ...ch, historySkills: ch.historySkills.map(x => (x.uid === h.uid ? { ...x, note: e.target.value } : x)) }))} />
              <button type="button" className="ghost danger small" aria-label="Remove bonus" onClick={() => set(ch => ({ ...ch, historySkills: ch.historySkills.filter(x => x.uid !== h.uid) }))}>✕</button>
            </li>
          ))}
        </ul>
        <button type="button" className="small" onClick={() => set(ch => ({ ...ch, historySkills: [...ch.historySkills, { uid: uid(), key: 'orate', bonus: 5, note: '' }] }))}>+ Skill bonus</button>
        <h4>Reputation from history or heirloom</h4>
        <label className="row">
          <Stepper label="Reputation bonus" value={c.reputation} min={0} max={100} onChange={v => set(ch => ({ ...ch, reputation: v }))} />
          <span className="faint">%</span>
          <span className="small dim">on top of {RULES.startingReputation}% for clan membership and your occupation's bonus</span>
        </label>
      </Section>
    </div>
  )
}
