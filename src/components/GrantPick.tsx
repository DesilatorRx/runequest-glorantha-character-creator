import { skillById, skillChoices } from '../engine/calc'
import type { Character, SkillGrant } from '../engine/types'
import { SUBJECT_SUGGESTIONS } from '../data/subjects'
import { SkillSelect } from './ui'

/** A skill with a subject the player names (Lore (any), Read/Write (any), ...): free text with suggestions. */
export function SubjectInput({ skill, value, onChange, label }: { skill: string; value: string; onChange: (key: string) => void; label: string }) {
  const subject = value.startsWith(`${skill}:`) ? value.slice(skill.length + 1) : ''
  const listId = `subjects-${skill}`
  const s = skillById(skill)
  return (
    <span className="row nowrap subject-input">
      <span className="dim">{s?.name ?? skill} (</span>
      <input type="text" list={listId} aria-label={label} placeholder={s?.specify ?? 'subject'} value={subject}
        onChange={e => onChange(e.target.value.trim() ? `${skill}:${e.target.value}` : '')} />
      <span className="dim">)</span>
      <datalist id={listId}>{(SUBJECT_SUGGESTIONS[skill] ?? []).map(x => <option key={x} value={x} />)}</datalist>
    </span>
  )
}

/** The pick for a "choose" skill bonus: a dropdown, or a subject to name. */
export function GrantPick({ c, grant, value, onChange }: { c: Character; grant: Extract<SkillGrant, { choose: unknown }>; value: string; onChange: (key: string) => void }) {
  const label = grant.label ?? 'Skill choice'
  if (typeof grant.choose === 'object' && !Array.isArray(grant.choose))
    return <SubjectInput skill={grant.choose.subject} value={value} onChange={onChange} label={label} />
  return <SkillSelect label={label} placeholder={`Choose ${grant.label ?? 'a skill'}…`} value={value} options={skillChoices(c, grant.choose)} onChange={onChange} />
}
