import { allOccupations } from '../../data/registry'
import { cultById, homelandOf, occupationOf, undoFavored, withKit } from '../../engine/calc'
import { uid } from '../../state/store'
import { FavoredPicker } from '../FavoredPicker'
import { ChoiceGrid, Section, type StepProps } from '../ui'
import { GrantPick } from '../GrantPick'
import { GrantSwap } from '../GrantSwap'

const STANDARD: Record<string, string> = { destitute: 'Destitute', poor: 'Poor', free: 'Free', noble: 'Noble', petty_king: 'Petty King' }

export function OccupationStep({ c, set }: StepProps) {
  const home = homelandOf(c)
  const occ = occupationOf(c)
  const suggested = (id: string) => !!home?.occupations.includes(id)
  const list = [...allOccupations()].sort((a, b) => Number(suggested(b.id)) - Number(suggested(a.id)))

  return (
    <div className="stack">
      <Section
        title="What did you do before adventuring?"
      >
        <ChoiceGrid
          items={list.map(o => ({ id: o.id, name: o.name, blurb: <>{suggested(o.id) && <><span className="pill accent">suggested for {home!.name}</span><br /></>}{o.hint}{o.source === 'homebrew' && <><br /><span className="pill homebrew-pill">homebrew</span></>}</> }))}
          value={c.occupation}
          onPick={id => set(ch => (ch.occupation === id ? ch : { ...withKit(undoFavored(ch, 'occupation'), id, uid), occupation: id, occupationPicks: {} }))}
        />
      </Section>

      {occ && (
        <Section title={occ.name}>
          {occ.source !== 'wiki' && occ.source !== 'book' && occ.source !== 'homebrew' && (
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
                  ? <GrantSwap c={c} set={set} source="occupation" index={i} grant={g} />
                  : (
                    <GrantPick c={c} grant={g} value={c.occupationPicks[i] ?? ''} onChange={k => set(ch => ({ ...ch, occupationPicks: { ...ch.occupationPicks, [i]: k } }))} />
                  )}
              </li>
            ))}
          </ul>
          <h4>Favored passion</h4>
          <FavoredPicker c={c} set={set} slot="occupation" options={occ.passions} />
        </Section>
      )}
    </div>
  )
}
