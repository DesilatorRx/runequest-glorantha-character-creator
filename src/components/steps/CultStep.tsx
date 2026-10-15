import { useState } from 'react'
import { CULTS } from '../../data'
import { RUNE_NAMES, charValue, computeDerived, cultById, cultOf, cultStartingKeys, homelandOf, occupationOf, resolveKey, runeSpellById, skillChoices, skillName, spiritSpellById, takePassion } from '../../engine/calc'
import { RULES } from '../../engine/rules'
import { uid } from '../../state/store'
import { ChoiceGrid, Section, SkillSelect, Stepper, type StepProps } from '../ui'

export function CultStep({ c, set }: StepProps) {
  const home = homelandOf(c)
  const occ = occupationOf(c)
  const [all, setAll] = useState(false)
  const cult = cultOf(c)
  const common = new Set([...(home?.cults ?? []), ...(occ?.cults ?? [])])
  const list = (home || occ) && !all ? CULTS.filter(x => common.has(x.id) || x.id === c.cult) : CULTS

  const pick = (id: string) => set(ch => (ch.cult === id ? ch : { ...ch, cult: id, cultStartPicks: {}, cultPicks: [], powSacrifice: 0, runeSpells: [], spiritMagic: [] }))

  return (
    <div className="stack">
      <Section
        title="Which god do you serve?"
        aside={(home || occ) && (
          <label className="row small">
            <input type="checkbox" checked={all} onChange={e => setAll(e.target.checked)} />
            Show all cults
          </label>
        )}
      >
        <ChoiceGrid
          items={list.map(x => ({ id: x.id, name: x.name, blurb: <>{x.runes.map(r => RUNE_NAMES[r]).join(' · ')}{x.hint && <><br />{x.hint}</>}</> }))}
          value={c.cult}
          onPick={pick}
        />
      </Section>

      {cult && (
        <>
          <Section title="Cult starting skills">
            {cult.starting && cult.starting.length > 0 ? (
              <ul className="grant-list">
                {cult.starting.map((g, i) => (
                  <li key={i}>
                    <span className="good mono grant-bonus">+{g.bonus}%</span>
                    {'skill' in g
                      ? <span>{skillName(c, resolveKey(c, g.skill))}</span>
                      : (
                        <SkillSelect label={g.label ?? 'Starting skill choice'} placeholder={`Choose ${g.label ?? 'a skill'}…`}
                          value={c.cultStartPicks[i] ?? ''} options={skillChoices(c, g.choose)}
                          onChange={k => set(ch => ({ ...ch, cultStartPicks: { ...ch.cultStartPicks, [i]: k }, cultPicks: [] }))} />
                      )}
                  </li>
                ))}
                {RULES.cultFixedBonuses.map(g => (
                  <li key={g.skill}><span className="good mono grant-bonus">+{g.bonus}%</span><span>{skillName(c, resolveKey(c, g.skill))}</span></li>
                ))}
              </ul>
            ) : <p className="small dim">This cult has no listed starting skills.</p>}
            <h4>Initiation bonuses</h4>
            <p className="small dim">Add +{RULES.cultSkillBonuses.join('% and +')}% to two different cult starting skills.</p>
            <ul className="grant-list">
              {RULES.cultSkillBonuses.map((bonus, i) => (
                <li key={i}>
                  <span className="good mono grant-bonus">+{bonus}%</span>
                  <SkillSelect
                    label={`Cult skill +${bonus}%`}
                    value={c.cultPicks[i] ?? ''}
                    options={(cult.starting ? skillChoices(c, cultStartingKeys(c)) : skillChoices(c, cult.skills)).filter(o => o.key === c.cultPicks[i] || !c.cultPicks.includes(o.key))}
                    onChange={k => set(ch => {
                      const picks = [...ch.cultPicks]
                      picks[i] = k
                      return { ...ch, cultPicks: picks }
                    })}
                  />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Rune points">
            <label className="row">
              <span>POW sacrificed for extra Rune points</span>
              <Stepper label="POW sacrificed" value={c.powSacrifice} max={Math.max(0, charValue(c, 'pow') + c.powSacrifice - 1)} onChange={v => set(ch => ({ ...ch, powSacrifice: v }))} />
            </label>
            <p className="small dim">
              You start with {RULES.startingRunePoints} Rune points in {cult.name}. Each point of POW you sacrifice adds one Rune point and one more special
              Rune spell. Your POW is now {charValue(c, 'pow')} and you have {computeDerived(c).runePoints} Rune points.
            </p>
            {cult.source !== 'wiki' && cult.source !== 'book' && (
              <p className="small warn">
                {cult.source === 'community'
                  ? "This cult's skills, spells, and passions come from a fan transcription and haven't been checked against the book yet."
                  : "This cult's skills and spells are incomplete or guessed; check them against the book."}
              </p>
            )}
            <h4>Favored passion</h4>
            <p className="small dim">Take one: new at {RULES.basePassion}%, or +{RULES.passionRepeat}% to one you already have.</p>
            <div className="row">
              {cult.passions.map(p => {
                const label = `${p.kind}${p.target ? ` (${p.target})` : ''}`
                return <button type="button" key={label} className="small" onClick={() => set(ch => ({ ...ch, passions: takePassion(ch, p, uid()) }))}>+ {label}</button>
              })}
            </div>
          </Section>
          <Section title="What the cult teaches">
            <h4>Spirit magic</h4>
            <p className="small">{cult.spiritSpells.map(id => spiritSpellById(id)?.name ?? id).join(', ')}</p>
            {cult.prohibitedSpirit && cult.prohibitedSpirit.length > 0 && (
              <p className="small warn">Prohibited: {cult.prohibitedSpirit.map(id => spiritSpellById(id)?.name ?? id).join(', ')}</p>
            )}
            {cult.associated && cult.associated.length > 0 && (
              <p className="small dim">Associated cults (you may learn their spirit magic): {cult.associated.map(id => cultById(id)?.name ?? id).join(', ')}</p>
            )}
            <h4>Special Rune magic</h4>
            <p className="small">{cult.runeSpells.map(id => runeSpellById(id)?.name ?? id).join(', ')}, plus all common Rune magic</p>
          </Section>
        </>
      )}
    </div>
  )
}
