import { useState } from 'react'
import { SKILLS } from '../../data'
import { CATEGORY_NAMES, categoryMod, isUnraised, startingLimits, skillChoices, skillLines } from '../../engine/calc'
import { RULES } from '../../engine/rules'
import type { Character, SkillCategory } from '../../engine/types'
import { SUBJECT_SUGGESTIONS } from '../../data/subjects'
import { SkillPop } from '../pops'
import { PoolBadge, Section, SkillSelect, type StepProps } from '../ui'

const signed = (n: number) => (n === 0 ? '' : n > 0 ? `+${n}` : `−${-n}`)

export function SkillsStep({ c, set }: StepProps) {
  const lines = skillLines(c)
  const [showAll, setShowAll] = useState(false)
  const hidden = lines.filter(isUnraised).length
  const options = skillChoices(c)
  const cats = Object.keys(CATEGORY_NAMES) as SkillCategory[]

  const picker = (field: 'personal25' | 'personal10', count: number, bonus: number) => (
    <ul className="grant-list">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <span className="good mono grant-bonus">+{bonus}%</span>
          <SkillSelect
            label={`Personal +${bonus}% #${i + 1}`}
            value={c[field][i] ?? ''}
            options={options.filter(o => o.key === c[field][i] || !c[field].includes(o.key))}
            onChange={k => set((ch: Character) => {
              const list = [...ch[field]]
              list[i] = k
              return { ...ch, [field]: list }
            })}
          />
        </li>
      ))}
    </ul>
  )

  return (
    <div className="stack">
      <div className="two-col">
        <Section title={`Personal +${RULES.personalBig.bonus}%`} aside={<PoolBadge label="Left" total={startingLimits(c).personal25} spent={c.personal25.filter(Boolean).length} />}>
          {picker('personal25', startingLimits(c).personal25, RULES.personalBig.bonus)}
        </Section>
        <Section title={`Personal +${RULES.personalSmall.bonus}%`} aside={<PoolBadge label="Left" total={startingLimits(c).personal10} spent={c.personal10.filter(Boolean).length} />}>
          {picker('personal10', startingLimits(c).personal10, RULES.personalSmall.bonus)}
        </Section>
      </div>

      <AddSkill c={c} set={set} />

      <Section title="All skills" aside={hidden > 0 && <label className="row small"><input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />Show {hidden} unraised 00% skills</label>}>
        <div className="table-wrap">
          <table className="skill-table compact">
            <thead>
              <tr>
                <th>Skill</th>
                <th className="num">Base</th>
                <th className="num" title="Skill category modifier">Cat.</th>
                <th className="num">Home</th>
                <th className="num">Occ.</th>
                <th className="num">Cult</th>
                <th className="num" title="Family history, heirloom, and older-adventurer bonuses">Hist.</th>
                <th className="num">Pers.</th>
                <th className="num">Total</th>
                <th />
              </tr>
            </thead>
            {cats.map(cat => {
              const rows = lines.filter(l => l.skill.category === cat && (showAll || !isUnraised(l)))
              if (!rows.length) return null
              return (
                <tbody key={cat}>
                  <tr className="cat-row">
                    <th colSpan={10}>{CATEGORY_NAMES[cat]} <span className="faint mono">{signed(categoryMod(c, cat)) || '±0'}</span></th>
                  </tr>
                  {rows.map(l => (
                    <tr key={l.key}>
                      <td><SkillPop c={c} line={l} /></td>
                      <td className="num dim">{l.base}</td>
                      <td className="num dim">{signed(l.catMod)}</td>
                      <td className="num">{signed(l.homeland)}</td>
                      <td className="num">{signed(l.occupation)}</td>
                      <td className="num">{signed(l.cult)}</td>
                      <td className="num">{signed(l.history)}</td>
                      <td className="num good">{signed(l.personal)}</td>
                      <td className="num"><strong className={l.capped ? 'warn' : ''} title={l.capped ? 'Capped at the starting maximum' : undefined}>{l.total}%</strong></td>
                      <td>
                        {c.extraSkills.includes(l.key) && (
                          <button type="button" className="ghost danger small" aria-label={`Remove ${l.name}`} onClick={() => set(ch => ({ ...ch, extraSkills: ch.extraSkills.filter(k => k !== l.key) }))}>✕</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )
            })}
          </table>
        </div>
      </Section>
    </div>
  )
}

function AddSkill({ c, set }: StepProps) {
  const specific = SKILLS.filter(s => s.specify)
  const [id, setId] = useState('elder_race_lore')
  const [subject, setSubject] = useState('')
  const has = new Set([...c.extraSkills, ...skillLines(c).map(l => l.key)])
  const addKey = (k: string) => set(ch => ({ ...ch, extraSkills: [...ch.extraSkills, k] }))
  const key = `${id}:${subject.trim()}`
  const suggestions = (SUBJECT_SUGGESTIONS[id] ?? []).filter(x => !has.has(`${id}:${x}`))
  return (
    <Section title="Add a skill">
      <div className="row">
        <select aria-label="Skill" value={id} onChange={e => { setId(e.target.value); setSubject('') }}>
          {specific.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="text" aria-label="Subject" list={`add-${id}`} placeholder={specific.find(s => s.id === id)?.specify} value={subject} onChange={e => setSubject(e.target.value)} />
        <datalist id={`add-${id}`}>{suggestions.map(x => <option key={x} value={x} />)}</datalist>
        <button type="button" disabled={!subject.trim() || has.has(key)} onClick={() => { addKey(key); setSubject('') }}>Add</button>
      </div>
      {suggestions.length > 0 && (
        <div className="row small" style={{ marginTop: '0.5rem' }}>
          <span className="dim">Quick add:</span>
          {suggestions.map(x => <button key={x} type="button" className="small" onClick={() => addKey(`${id}:${x}`)}>+ {x}</button>)}
        </div>
      )}
      <p className="small dim">For Elder Race Lore, another language, a craft, a lore, an instrument, or a mount. Once added, it can take a personal bonus.</p>
    </Section>
  )
}
