import { useState } from 'react'
import { SKILLS } from '../../data'
import { CATEGORY_NAMES, categoryMod, skillChoices, skillLines } from '../../engine/calc'
import { RULES } from '../../engine/rules'
import type { Character, SkillCategory } from '../../engine/types'
import { SkillPop } from '../pops'
import { PoolBadge, Section, SkillSelect, type StepProps } from '../ui'

const signed = (n: number) => (n === 0 ? '' : n > 0 ? `+${n}` : `−${-n}`)

export function SkillsStep({ c, set }: StepProps) {
  const lines = skillLines(c)
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
        <Section title={`Personal +${RULES.personalBig.bonus}%`} aside={<PoolBadge label="Left" total={RULES.personalBig.count} spent={c.personal25.filter(Boolean).length} />}>
          {picker('personal25', RULES.personalBig.count, RULES.personalBig.bonus)}
        </Section>
        <Section title={`Personal +${RULES.personalSmall.bonus}%`} aside={<PoolBadge label="Left" total={RULES.personalSmall.count} spent={c.personal10.filter(Boolean).length} />}>
          {picker('personal10', RULES.personalSmall.count, RULES.personalSmall.bonus)}
        </Section>
      </div>

      <AddSkill c={c} set={set} />

      <Section title="All skills">
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
              const rows = lines.filter(l => l.skill.category === cat)
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
  const [id, setId] = useState(specific[0].id)
  const [subject, setSubject] = useState('')
  const key = `${id}:${subject.trim()}`
  return (
    <Section title="Add a skill">
      <div className="row">
        <select aria-label="Skill" value={id} onChange={e => setId(e.target.value)}>
          {specific.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="text" aria-label="Subject" placeholder={specific.find(s => s.id === id)?.specify} value={subject} onChange={e => setSubject(e.target.value)} />
        <button
          type="button"
          disabled={!subject.trim() || c.extraSkills.includes(key)}
          onClick={() => { set(ch => ({ ...ch, extraSkills: [...ch.extraSkills, key] })); setSubject('') }}
        >Add</button>
      </div>
      <p className="small dim">For another language, craft, lore, instrument, or mount. Once added, it can take a personal bonus.</p>
    </Section>
  )
}
