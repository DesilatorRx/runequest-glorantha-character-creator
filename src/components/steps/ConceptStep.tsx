import { RQG_OPTIONS, type TableOptions } from '../../engine/rules'
import { Section, type StepProps } from '../ui'

export function ConceptStep({ c, set }: StepProps) {
  const setOpt = (patch: Partial<TableOptions>) => set(ch => ({ ...ch, options: { ...ch.options, ...patch } }))

  return (
    <div className="stack">
      <Section title="Who is your adventurer?">
        <div className="form-grid">
          <label><span className="dim small">Name</span><input type="text" placeholder="e.g. Vasana" value={c.name} onChange={e => set(ch => ({ ...ch, name: e.target.value }))} /></label>
          <label>
            <span className="dim small">Age</span>
            <input type="number" min={12} max={99} value={c.age} onChange={e => set(ch => ({ ...ch, age: Number(e.target.value) || 0 }))} />
          </label>
          <label className="span-2"><span className="dim small">Concept</span><input type="text" placeholder="e.g. Sartarite noble's daughter, sworn to avenge her father" value={c.concept} onChange={e => set(ch => ({ ...ch, concept: e.target.value }))} /></label>
          <label className="span-2">
            <span className="dim small">Notes & family history</span>
            <textarea rows={5} value={c.notes} onChange={e => set(ch => ({ ...ch, notes: e.target.value }))} />
          </label>
        </div>
      </Section>

      <Section
        title="Table rules"
        aside={<button type="button" className="small" onClick={() => setOpt(RQG_OPTIONS)}>Rules as written</button>}
      >
        <p className="small dim">
          Defaults follow the RuneQuest: Roleplaying in Glorantha core rulebook. Change these only if your gamemaster uses house rules.
        </p>
        <div className="stack">
          <label className="row">
            <span>Characteristics</span>
            <select value={c.options.charMethod} onChange={e => setOpt({ charMethod: e.target.value as TableOptions['charMethod'] })}>
              <option value="roll">Roll dice (rules as written)</option>
              <option value="assign">Distribute points (house rule)</option>
            </select>
            {c.options.charMethod === 'assign' && (
              <>
                <span className="dim small">pool</span>
                <input type="number" min={49} max={126} style={{ width: '5rem' }} value={c.options.assignPoints} onChange={e => setOpt({ assignPoints: Number(e.target.value) || 0 })} />
              </>
            )}
          </label>
        </div>
      </Section>
    </div>
  )
}
