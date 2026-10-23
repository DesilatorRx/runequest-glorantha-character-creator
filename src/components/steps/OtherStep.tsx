import { CHAR_NAMES, birthDate, computeBudget, computeDerived, extraDecades, occupationOf, regionOf, skillChoices, cultGrants, occupationGrants } from '../../engine/calc'
import { RULES } from '../../engine/rules'
import type { OtherInfo } from '../../engine/types'
import { agingRequired } from '../../engine/validate'
import { PoolBadge, Section, SkillSelect, Stepper, type StepProps } from '../ui'

/** Family Heirlooms (book p.83), summarized in our own words. Roll D20 or pick. */
const HEIRLOOMS: [string, string][] = [
  ['1', 'Ancestor worshiped as a hero by your cult: Devotion (deity) or Loyalty (temple) (or +10%), Orate +5%, Reputation +5%.'],
  ['2', 'Famous hero ancestor: Orate +10%, Reputation +5%.'],
  ['3', 'Pot of woad for the Bless Woad spell, 1D6 points of potency.'],
  ['4', '1D3 pots of rhino fat: each gives +1 armor on all locations for an hour (and smells awful).'],
  ['5', 'Votive image of your god: +10% Worship (deity).'],
  ['6', 'Dwarf brooch or buckle: 2-point spell matrix for Heal 2.'],
  ['7', 'Dragonewt figurine: 1-point spell matrix for Find (substance) of your choice.'],
  ['8–11', 'Magic POW storage crystal holding 2D6+3 magic points (or usable as a spirit-binding matrix).'],
  ['12', 'Awakened small animal companion (3D6 INT, 3D6 POW) that speaks your language and knows 3 points of spirit magic.'],
  ['13', '1D6 healing potions, each healing 1D10.'],
  ['14', 'Necklace worth 2D6×100 L.'],
  ['15', 'Ancient gold armband: 2-point spirit magic matrix, worth 2D6×100 L.'],
  ['16', 'Magical musical instrument: +20% Play Instrument.'],
  ['17', 'Fine weapon (+1 HP, double value) with a 2-point matrix for Bladesharp, Bludgeon, Multimissile, or Strength.'],
  ['18', 'Ingot of iron or another Rune metal, 1D3 ENC, ready to forge.'],
  ['19', 'Showy metal helmet (triple value) with a 2-point matrix for Countermagic, Protection, or Spirit Screen.'],
  ['20', 'Roll twice (roll twice more if this comes up again).'],
]
const d20 = () => 1 + Math.floor(Math.random() * 20)
const heirloomFor = (roll: number) => HEIRLOOMS.find(([r]) => {
  const [a, b] = r.split('–').map(Number)
  return roll >= a && roll <= (b || a)
})!

export function OtherStep({ c, set }: StepProps) {
  const field = (k: keyof OtherInfo) => ({
    value: c.info[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(ch => ({ ...ch, info: { ...ch.info, [k]: e.target.value } })),
  })
  const setInfo = (patch: Partial<OtherInfo>) => set(ch => ({ ...ch, info: { ...ch.info, ...patch } }))
  const birth = birthDate(c)
  const d = computeDerived(c)
  const b = computeBudget(c)
  const decades = extraDecades(c)
  const aging = agingRequired(c)
  const region = regionOf(c)
  const occ = occupationOf(c)
  const olderOptions = skillChoices(c, [...new Set([...occupationGrants(c), ...cultGrants(c)].map(g => g.key))])

  return (
    <div className="stack">
      <Section title="Personal details">
        <div className="form-grid">
          <label><span className="dim small">Gender</span><input type="text" placeholder="as you like" {...field('gender')} /></label>
          <label>
            <span className="dim small">Handedness</span>
            <select value={c.info.handedness} onChange={e => setInfo({ handedness: e.target.value as OtherInfo['handedness'] })}>
              <option value="right">Right-handed</option>
              <option value="left">Left-handed (thought unlucky)</option>
            </select>
          </label>
          <label><span className="dim small">Tribe or city</span><input type="text" placeholder={region?.name ?? 'e.g. Colymar'} {...field('tribe')} /></label>
          <label><span className="dim small">Clan</span><input type="text" placeholder="e.g. Ernaldori" {...field('clan')} /></label>
          <label><span className="dim small">Father</span><input type="text" {...field('father')} /></label>
          <label><span className="dim small">Mother</span><input type="text" {...field('mother')} /></label>
          <label className="span-2"><span className="dim small">Scars</span><input type="text" placeholder="where and how you got them" {...field('scars')} /></label>
        </div>
        <p className="small dim">Name lists for each homeland are in the Homelands chapter.</p>
      </Section>

      <Section title="Birth">
        <dl className="glance wide">
          <dt>Season</dt><dd>{birth.season ?? <span className="faint">from your highest elemental rune (not Moon)</span>}</dd>
          <dt>Week</dt><dd>{birth.week ?? <span className="faint">tied Power runes: pick one</span>}</dd>
          <dt>Day</dt>
          <dd className="row">
            <select aria-label="Day of the week" value={c.info.birthDay} onChange={e => setInfo({ birthDay: Number(e.target.value) })}>
              <option value={0}>—</option>
              {['Freezeday', 'Waterday', 'Clayday', 'Windsday', 'Fireday', 'Wildday', 'Godsday'].map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
            </select>
            <button type="button" className="small" onClick={() => setInfo({ birthDay: 1 + Math.floor(Math.random() * 7) })}>Roll</button>
          </dd>
          <dt>Year</dt><dd className="mono">{1625 - c.age}</dd>
        </dl>
        <p className="small dim">Play starts in 1625. Change your age on the Concept step.</p>
      </Section>

      <Section title="Family heirloom">
        <div className="row">
          <input type="text" className="grow" aria-label="Heirloom" placeholder="Roll or describe your heirloom" {...field('heirloom')} />
          <button type="button" onClick={() => { const r = d20(); setInfo({ heirloom: `${r}: ${heirloomFor(r)[1]}` }) }}>Roll D20</button>
        </div>
        <details className="small">
          <summary className="dim">Heirloom table: roll, or choose one with your gamemaster's approval</summary>
          <ul className="pick-list heirloom-list">
            {HEIRLOOMS.filter(([r]) => r !== '20').map(([r, t]) => {
              const on = c.info.heirloom.startsWith(`${r}: `)
              return (
                <li key={r} className={`pick-row ${on ? 'chosen' : ''}`}>
                  <span className="pick-main"><span className="mono faint">{r}</span> {t}</span>
                  <button type="button" className="pick-add small" onClick={() => setInfo({ heirloom: on ? '' : `${r}: ${t}` })}>{on ? 'Clear' : 'Choose'}</button>
                </li>
              )
            })}
          </ul>
        </details>
        <p className="small dim">Add any skill, passion, or Reputation bonus it gives on the Family & Passions step.</p>
      </Section>

      <Section title="Reputation">
        <dl className="glance wide">
          <dt>Clan member</dt><dd className="mono">{RULES.startingReputation}%</dd>
          <dt>Occupation</dt><dd className="mono">+{occ?.reputation ?? 0}%</dd>
          <dt>Family history &amp; heirloom</dt><dd className="mono">+{c.reputation}%</dd>
          <dt><strong>Total</strong></dt><dd className="mono"><strong>{d.reputation}%</strong></dd>
        </dl>
      </Section>

      {(decades > 0 || aging > 0) && (
        <Section title={`Older adventurer (age ${c.age})`}>
          {decades > 0 && (
            <>
              <p className="small dim">
                For {decades} decade{decades > 1 ? 's' : ''} over {RULES.startingAge}: +{RULES.olderRunePoints * decades} Rune points
                and +{RULES.olderSpiritMagic * decades} point{decades > 1 ? 's' : ''} of spirit magic (added automatically), and +{RULES.olderSkillBonus}% to
                {' '}{RULES.olderSkillPicks * decades} occupation or cult skills:
              </p>
              <span className="row"><PoolBadge label="Picks" total={b.olderPicks.total} spent={b.olderPicks.spent} /></span>
              <ul className="grant-list">
                {Array.from({ length: b.olderPicks.total }, (_, i) => (
                  <li key={i}>
                    <span className="good mono grant-bonus">+{RULES.olderSkillBonus}%</span>
                    <SkillSelect
                      label={`Older adventurer bonus ${i + 1}`}
                      value={c.olderPicks[i] ?? ''}
                      options={olderOptions}
                      onChange={k => set(ch => { const list = [...ch.olderPicks]; list[i] = k; return { ...ch, olderPicks: list } })}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
          {aging > 0 && (
            <>
              <p className="small dim">Aging: take {aging} point{aging > 1 ? 's' : ''} off STR, CON, or DEX (one per two years or part over {RULES.agingFromAge}).</p>
              <div className="row">
                {(['str', 'con', 'dex'] as const).map(ch => (
                  <label key={ch} className="row small">
                    {CHAR_NAMES[ch]}
                    <Stepper label={`${CHAR_NAMES[ch]} lost to age`} value={c.agingLoss[ch] ?? 0} onChange={v => set(x => ({ ...x, agingLoss: { ...x.agingLoss, [ch]: v } }))} />
                  </label>
                ))}
              </div>
            </>
          )}
        </Section>
      )}
    </div>
  )
}
