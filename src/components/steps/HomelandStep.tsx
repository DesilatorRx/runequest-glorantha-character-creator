import { allHomelands } from '../../data/registry'
import { CHAR_NAMES, RUNE_NAMES, applyRegionPassions, cultById, homelandOf, occupationById, regionOf, skillName } from '../../engine/calc'
import { RULES } from '../../engine/rules'
import type { CharId } from '../../engine/types'
import { homelandPassions, uid } from '../../state/store'
import { ChoiceGrid, Section, type StepProps } from '../ui'
import { GrantPick } from '../GrantPick'
import { GrantSwap } from '../GrantSwap'

export function HomelandStep({ c, set }: StepProps) {
  const h = homelandOf(c)

  const pick = (id: string) => set(ch => {
    if (ch.homeland === id) return ch
    const old = new Set((homelandOf(ch)?.passions ?? []).map(p => `${p.kind}|${p.target}`))
    const kept = ch.passions.filter(p => !old.has(`${p.kind}|${p.target}`))
    return { ...ch, homeland: id, homelandPicks: {}, region: '', regionPicks: {}, passions: [...homelandPassions(id), ...kept] }
  })

  return (
    <div className="stack">
      <Section title="Where were you raised?">
        <ChoiceGrid
          items={allHomelands().map(x => ({ id: x.id, name: x.name, blurb: <>{x.hint}{x.source === 'homebrew' && <><br /><span className="pill homebrew-pill">homebrew</span></>}</> }))}
          value={c.homeland}
          onPick={pick}
        />
      </Section>

      {h && (
        <Section title={h.name}>
          <dl className="glance wide">
            <dt>Culture</dt><dd>{h.culture}</dd>
            <dt>Language</dt><dd>{h.language}</dd>
            <dt>Rune bonus</dt><dd>{RUNE_NAMES[h.rune]} +{RULES.homelandRuneBonus}%</dd>
            {h.charMods && (
              <><dt>Characteristics</dt><dd>{Object.entries(h.charMods).map(([k, v]) => `${v! > 0 ? '+' : ''}${v} ${CHAR_NAMES[k as CharId]}`).join(', ')}</dd></>
            )}
          </dl>
          <h4>Skill modifiers</h4>
          <ul className="tag-list">
            {h.skills.map((g, i) => 'skill' in g && (
              <li key={i} className="tag tag-plain">
                <GrantSwap c={c} set={set} source="homeland" index={i} grant={g} /> <span className="good mono">&nbsp;+{g.bonus}%</span>
              </li>
            ))}
          </ul>
          {h.skills.some(g => 'choose' in g) && (
            <ul className="grant-list">
              {h.skills.map((g, i) => 'choose' in g && (
                <li key={i}>
                  <span className="good mono grant-bonus">+{g.bonus}%</span>
                  <GrantPick c={c} grant={g} value={c.homelandPicks[i] ?? ''} onChange={k => set(ch => ({ ...ch, homelandPicks: { ...ch.homelandPicks, [i]: k } }))} />
                </li>
              ))}
            </ul>
          )}
          <h4>Cultural weapons</h4>
          <p className="small">{h.culturalWeapons.map(w => skillName(c, w)).join(', ')}</p>
          <h4>Common occupations</h4>
          <p className="small">{h.occupations.map(o => occupationById(o)?.name ?? o).join(', ')}</p>
          <h4>Common cults</h4>
          <p className="small">{h.cults.map(o => cultById(o)?.name ?? o).join(', ')}</p>
          <p className="small dim">Starting passions from your homeland are added on the Family & Passions step.</p>
        </Section>
      )}

      {h?.regions && h.regions.length > 0 && <RegionPicker c={c} set={set} />}
    </div>
  )
}

function RegionPicker({ c, set }: StepProps) {
  const h = homelandOf(c)!
  const region = regionOf(c)
  const pick = (id: string) => set(ch => {
    // Undo the old region's passion changes by rebuilding from the current list minus what it added is fragile,
    // so only apply the new region's passions when moving from "none" to a region.
    const passions = ch.region ? ch.passions : applyRegionPassions(ch, id, uid)
    return { ...ch, region: id, regionPicks: {}, passions: id ? passions : ch.passions }
  })
  return (
    <Section title="Tribe, city, or region">
      <label className="row">
        <span>Local modifiers</span>
        <select value={c.region} onChange={e => pick(e.target.value)}>
          <option value="">None</option>
          {h.regions!.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </label>
      {region && (
        <ul className="plain small" style={{ marginTop: '0.6rem' }}>
          {region.skills?.map((g, i) => 'skill' in g && <li key={i}>{skillName(c, g.skill)} <span className="good mono">+{g.bonus}%</span></li>)}
          {region.rune && <li>{RUNE_NAMES[region.rune.rune]} Rune +{region.rune.bonus}%{region.rune.replacesHomeland && ` instead of ${RUNE_NAMES[h.rune]}`}</li>}
          {region.passions?.map(p => <li key={p.kind + p.target}>{p.kind} ({p.target}) {p.value ? `${p.value}%` : ''}{p.bonus ? ` +${p.bonus}%` : ''}</li>)}
          {region.note && <li className="dim">{region.note}</li>}
        </ul>
      )}
      {region?.skills?.some(g => 'choose' in g) && (
        <ul className="grant-list">
          {region.skills.map((g, i) => 'choose' in g && (
            <li key={i}>
              <span className="good mono grant-bonus">+{g.bonus}%</span>
              <GrantPick c={c} grant={g} value={c.regionPicks[i] ?? ''} onChange={k => set(ch => ({ ...ch, regionPicks: { ...ch.regionPicks, [i]: k } }))} />
            </li>
          ))}
        </ul>
      )}
      <p className="small dim">Optional, with your gamemaster's approval. Passion changes are applied when you first pick a region; adjust them on the Family &amp; Passions step if you switch.</p>
    </Section>
  )
}
