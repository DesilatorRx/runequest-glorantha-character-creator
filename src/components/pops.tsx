import type { ReactNode } from 'react'
import { CULTS, RUNE_SPELLS, SPIRIT_SPELLS } from '../data'
import { CHAR_INFO, DERIVED_INFO, PASSION_INFO, RUNE_INFO, SKILL_INFO } from '../data/abilityInfo'
import { SORCERY_RUNES, SORCERY_SPELLS, SORCERY_TECHNIQUES } from '../data/sorcery'
import { SORCERY_SPELL_INFO } from '../data/spellInfoSorcery'
import { SPIRIT_SPELL_INFO } from '../data/spellInfoSpirit'
import { RUNE_SPELL_INFO } from '../data/spellInfoRune'
import { charBreakdown, derivedBreakdown, runeBreakdown, skillBreakdown, type DerivedKey } from '../engine/breakdown'
import { CHAR_LONG, CHAR_NAMES, RUNE_NAMES, type SkillLine } from '../engine/calc'
import type { Character, CharId, Passion, RuneId } from '../engine/types'
import { BreakdownView, Pop } from './Pop'

const RANGE: Record<string, string> = { ranged: 'Ranged', touch: 'Touch', self: 'Self', special: 'Special range' }
const DURATION: Record<string, string> = { instant: 'Instant', temporal: 'Temporal', permanent: 'Permanent', special: 'Special duration' }
const Facts = ({ items }: { items: (string | false | undefined)[] }) => (
  <div className="pop-facts">{items.filter(Boolean).map(t => <span key={t as string} className="pill">{t}</span>)}</div>
)

export function CharPop({ c, ch, children }: { c: Character; ch: CharId; children?: ReactNode }) {
  return (
    <Pop label={CHAR_LONG[ch]} title={`${CHAR_LONG[ch]} (${CHAR_NAMES[ch]})`}
      content={() => <BreakdownView b={charBreakdown(c, ch)} summary={CHAR_INFO[ch]?.summary} page={CHAR_INFO[ch]?.page} />}>
      {children ?? CHAR_NAMES[ch]}
    </Pop>
  )
}

export function RunePop({ c, r, children }: { c: Character; r: RuneId; children?: ReactNode }) {
  return (
    <Pop label={`${RUNE_NAMES[r]} Rune`} title={`${RUNE_NAMES[r]} Rune`}
      content={() => <BreakdownView b={runeBreakdown(c, r)} summary={RUNE_INFO[r]?.summary} page={RUNE_INFO[r]?.page} />}>
      {children ?? RUNE_NAMES[r]}
    </Pop>
  )
}

export function SkillPop({ c, line, children }: { c: Character; line: SkillLine; children?: ReactNode }) {
  const info = SKILL_INFO[line.skill.id]
  return (
    <Pop label={line.name} title={line.name}
      content={() => <BreakdownView b={skillBreakdown(c, line)} summary={info?.summary} page={info?.page} />}>
      {children ?? line.name}
    </Pop>
  )
}

export function DerivedPop({ c, k, label, children }: { c: Character; k: DerivedKey; label: string; children?: ReactNode }) {
  const info = DERIVED_INFO[k]
  return (
    <Pop label={label} title={label} content={() => <BreakdownView b={derivedBreakdown(c, k)} summary={info?.summary} page={info?.page} />}>
      {children ?? label}
    </Pop>
  )
}

export function PassionPop({ p, children }: { p: Passion; children?: ReactNode }) {
  const name = `${p.kind}${p.target ? ` (${p.target})` : ''}`
  const info = PASSION_INFO[p.kind]
  return (
    <Pop label={name} title={name} content={() => (
      <BreakdownView
        b={{ rows: [{ label: name, value: `${p.value}%`, strong: true }], note: 'New passions start at 60%; taking one again adds +10%, up to 100% at creation.' }}
        summary={info?.summary} page={info?.page}
      />
    )}>{children ?? name}</Pop>
  )
}

const teachers = (kind: 'spirit' | 'rune', id: string) =>
  CULTS.filter(cu => (kind === 'spirit' ? cu.spiritSpells : cu.runeSpells).includes(id)).map(cu => cu.name)

export function SpiritSpellPop({ id, points, children }: { id: string; points?: number; children?: ReactNode }) {
  const s = SPIRIT_SPELLS.find(x => x.id === id)
  const info = SPIRIT_SPELL_INFO[id]
  if (!s) return <>{children}</>
  return (
    <Pop label={s.name} title={`${s.name}${points ? ` ${points}` : ''}`} content={() => (
      <>
        <Facts items={[s.variable ? 'Variable' : `${s.cost} point${s.cost > 1 ? 's' : ''}`, info?.range && RANGE[info.range], info?.duration && DURATION[info.duration], info?.focused && 'Focused']} />
        {info?.summary && <p className="pop-summary">{info.summary}</p>}
        {teachers('spirit', id).length > 0 && <p className="pop-note">Taught by {teachers('spirit', id).join(', ')}.</p>}
        {info?.page && <p className="pop-page">Rulebook p. {info.page}</p>}
      </>
    )}>{children ?? s.name}</Pop>
  )
}

export function RuneSpellPop({ id, children }: { id: string; children?: ReactNode }) {
  const s = RUNE_SPELLS.find(x => x.id === id)
  const info = RUNE_SPELL_INFO[id]
  if (!s) return <>{children}</>
  const cost = s.variable ? (s.maxCost ? `${s.cost}–${s.maxCost} points` : `${s.cost}+ points`) : `${s.cost} point${s.cost > 1 ? 's' : ''}`
  return (
    <Pop label={s.name} title={s.name} content={() => (
      <>
        <Facts items={[cost, s.stackable && 'Stackable', s.oneUse && 'One-use', s.common && 'Common', info?.range && RANGE[info.range], info?.duration && DURATION[info.duration]]} />
        {info?.summary && <p className="pop-summary">{info.summary}</p>}
        {info?.runes?.length ? <p className="pop-note">Runes: {info.runes.map(r => RUNE_NAMES[r]).join(', ')}</p> : null}
        {!s.common && teachers('rune', id).length > 0 && <p className="pop-note">Taught by {teachers('rune', id).join(', ')}.</p>}
        {info?.page && <p className="pop-page">Rulebook p. {info.page}</p>}
      </>
    )}>{children ?? s.name}</Pop>
  )
}

export function SorcerySpellPop({ id, children }: { id: string; children?: ReactNode }) {
  const s = SORCERY_SPELLS.find(x => x.id === id)
  const info = SORCERY_SPELL_INFO[id]
  if (!s) return <>{children}</>
  const runeName = (r: string) => SORCERY_RUNES.find(x => x.id === r)?.name ?? r
  const techName = (t: string) => SORCERY_TECHNIQUES.find(x => x.id === t)?.name ?? t
  return (
    <Pop label={s.name} title={s.name} content={() => (
      <>
        <Facts items={[`${s.cost} ${s.costUnit === 'pow' ? 'POW' : 'MP'}`, s.range && RANGE[s.range], s.duration && DURATION[s.duration], s.ritual && 'Ritual', s.enchantment && 'Enchantment']} />
        {info?.summary && <p className="pop-summary">{info.summary}</p>}
        <p className="pop-note">Runes: {s.runes.map(runeName).join(', ')}{s.extraRune ? ' + one chosen' : ''} · Technique: {s.techniques.map(techName).join(', ')}</p>
        <p className="pop-page">Rulebook p. {info?.page ?? s.page}</p>
      </>
    )}>{children ?? s.name}</Pop>
  )
}
