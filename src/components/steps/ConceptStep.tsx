import { EXPERIENCED_OPTIONS, RQG_OPTIONS, type TableOptions } from '../../engine/rules'

const BOOK_POWER: Partial<TableOptions> = { extraPersonal25: 0, extraPersonal10: 0, extraRunePoints: 0, extraSpiritMagic: 0, skillCap: 100 }
import { Section, type StepProps } from '../ui'

export function ConceptStep({ c, set }: StepProps) {
  const setOpt = (patch: Partial<TableOptions>) => set(ch => ({ ...ch, options: { ...ch.options, ...patch } }))
  /** True when every setting in the preset matches the adventurer's current options. */
  const presetIs = (preset: Partial<TableOptions>) =>
    (Object.keys(preset) as (keyof TableOptions)[]).every(k => (c.options[k] ?? RQG_OPTIONS[k]) === preset[k])

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
        title="Starting power"
        aside={
          <span className="row">
            {!presetIs(BOOK_POWER) && !presetIs(EXPERIENCED_OPTIONS) && <span className="pill">custom</span>}
            <button type="button" className={`small preset ${presetIs(BOOK_POWER) ? 'selected' : ''}`} aria-pressed={presetIs(BOOK_POWER)} onClick={() => setOpt(BOOK_POWER)}>Book default</button>
            <button type="button" className={`small preset ${presetIs(EXPERIENCED_OPTIONS) ? 'selected' : ''}`} aria-pressed={presetIs(EXPERIENCED_OPTIONS)} onClick={() => setOpt(EXPERIENCED_OPTIONS)}>Experienced</button>
          </span>
        }
      >
        <p className="small dim">
          <strong>By the book:</strong> make your adventurer older. Each 10 years over 21 adds +5% to four occupation or cult skills,
          +3 Rune points, and +1 point of spirit magic; from age 40 you lose characteristic points to age (p.81).
          Set the age above, then assign the bonuses on the Other Information step.
        </p>
        <p className="small dim"><strong>House rules:</strong> if your gamemaster wants a stronger start, add extras here. They show on the sheet's breakdowns.</p>
        <div className="form-grid house-rules">
          {([
            ['extraPersonal25', 'Extra personal +25% bonuses'],
            ['extraPersonal10', 'Extra personal +10% bonuses'],
            ['extraRunePoints', 'Extra Rune points (and special Rune spells)'],
            ['extraSpiritMagic', 'Extra spirit magic points'],
          ] as const).map(([k, label]) => (
            <label key={k}>
              <span className="dim small">{label}</span>
              <input type="number" min={0} max={20} value={c.options[k] ?? 0} onChange={e => setOpt({ [k]: Math.max(0, Number(e.target.value) || 0) })} />
            </label>
          ))}
          <label>
            <span className="dim small">Highest starting skill (book: 100%)</span>
            <input type="number" min={50} max={200} step={5} value={c.options.skillCap ?? 100} onChange={e => setOpt({ skillCap: Number(e.target.value) || 100 })} />
          </label>
        </div>
      </Section>

      <Section
        title="Table rules"
        aside={(() => {
          const asWritten = c.options.charMethod === RQG_OPTIONS.charMethod
          return (
            <button type="button" className={`small preset ${asWritten ? 'selected' : ''}`} aria-pressed={asWritten}
              onClick={() => setOpt({ charMethod: RQG_OPTIONS.charMethod, assignPoints: RQG_OPTIONS.assignPoints })}>Rules as written</button>
          )
        })()}
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
          <label className="row">
            <input type="checkbox" checked={!!c.options.cultBonusOnCultSkills} onChange={e => setOpt({ cultBonusOnCultSkills: e.target.checked })} />
            <span>Cult +20%/+15% initiation bonuses may also go to Cult Lore, Worship, or Meditate (Chaosium Q&amp;A, with GM approval)</span>
          </label>
        </div>
      </Section>
    </div>
  )
}
