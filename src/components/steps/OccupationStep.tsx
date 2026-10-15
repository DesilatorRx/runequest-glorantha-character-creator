import { OCCUPATIONS } from '../../data'
import { cultById, homelandOf, occupationOf, resolveKey, skillChoices, skillName, takePassion } from '../../engine/calc'
import { RULES } from '../../engine/rules'
import { uid } from '../../state/store'
import { ChoiceGrid, Section, SkillSelect, type StepProps } from '../ui'

const STANDARD: Record<string, string> = { destitute: 'Destitute', poor: 'Poor', free: 'Free', noble: 'Noble', petty_king: 'Petty King' }

export function OccupationStep({ c, set }: StepProps) {
  const home = homelandOf(c)
  const occ = occupationOf(c)
  const suggested = (id: string) => !!home?.occupations.includes(id)
  const list = [...OCCUPATIONS].sort((a, b) => Number(suggested(b.id)) - Number(suggested(a.id)))

  return (
    <div className="stack">
      <Section
        title="What did you do before adventuring?"
      >
        <ChoiceGrid
          items={list.map(o => ({ id: o.id, name: o.name, blurb: <>{suggested(o.id) && <><span className="pill accent">suggested for {home!.name}</span><br /></>}{o.hint}{o.source !== 'wiki' && o.source !== 'book' && <><br /><span className="pill warn-pill">{o.source === 'community' ? 'fan transcription' : 'numbers unverified'}</span></>}</> }))}
          value={c.occupation}
          onPick={id => set(ch => (ch.occupation === id ? ch : { ...ch, occupation: id, occupationPicks: {} }))}
        />
      </Section>

      {occ && (
        <Section title={occ.name}>
          {occ.source !== 'wiki' && occ.source !== 'book' && (
            <p className="small warn">
              {occ.source === 'community'
                ? "These numbers come from a fan transcription of the rulebook and haven't been checked against the book yet."
                : "These skill bonuses and wealth figures are placeholders that haven't been checked against the rulebook."}
            </p>
          )}
          <dl className="glance wide">
            <dt>Standard of living</dt><dd>{STANDARD[occ.standard]}</dd>
            <dt>Starting wealth</dt><dd className="mono">{occ.wealth} L{occ.wealthNote && <span className="faint"> · {occ.wealthNote}</span>}</dd>
            {occ.income && <><dt>Income</dt><dd className="mono">{occ.income}</dd></>}
            {occ.ransom && <><dt>Ransom</dt><dd className="mono">{occ.ransom} L</dd></>}
            {occ.reputation && <><dt>Reputation</dt><dd className="mono">+{occ.reputation}%</dd></>}
            <dt>Typical cults</dt><dd>{occ.cults.map(id => cultById(id)?.name ?? id).join(', ')}</dd>
          </dl>
          <h4>Skill bonuses</h4>
          <ul className="grant-list">
            {occ.skills.map((g, i) => (
              <li key={i}>
                <span className="good mono grant-bonus">+{g.bonus}%</span>
                {'skill' in g
                  ? <span>{skillName(c, g.skill)}</span>
                  : (
                    <SkillSelect
                      label={g.label ?? 'Skill choice'}
                      placeholder={`Choose ${g.label ?? 'a skill'}…`}
                      value={c.occupationPicks[i] ?? ''}
                      options={skillChoices(c, g.choose)}
                      onChange={k => set(ch => ({ ...ch, occupationPicks: { ...ch.occupationPicks, [i]: k } }))}
                    />
                  )}
              </li>
            ))}
          </ul>
          <h4>Passion</h4>
          <p className="small dim">Take one: new at {RULES.basePassion}%, or +{RULES.passionRepeat}% to one you already have.</p>
          <div className="row">
            {occ.passions.map(p => {
              const label = `${p.kind}${p.target ? ` (${resolveKey(c, p.target)})` : ''}`
              return <button type="button" key={label} className="small" onClick={() => set(ch => ({ ...ch, passions: takePassion(ch, p, uid()) }))}>+ {label}</button>
            })}
          </div>
        </Section>
      )}
    </div>
  )
}
