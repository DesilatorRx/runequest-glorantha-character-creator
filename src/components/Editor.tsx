import { useEffect, useMemo, useState } from 'react'
import { track } from '../analytics'
import {
  CHAR_NAMES, charValue, computeBudget, computeDerived, cultOf, homelandOf, occupationOf, remaining, type Pool,
} from '../engine/calc'
import type { Character } from '../engine/types'
import { CHARS } from '../engine/types'
import { validate, type StepId } from '../engine/validate'
import { exportCharacter } from '../engine/export'
import { downloadJson } from '../state/storage'
import { CharacteristicsStep } from './steps/CharacteristicsStep'
import { ConceptStep } from './steps/ConceptStep'
import { CultStep } from './steps/CultStep'
import { EquipmentStep } from './steps/EquipmentStep'
import { HomelandStep } from './steps/HomelandStep'
import { MagicStep } from './steps/MagicStep'
import { OccupationStep } from './steps/OccupationStep'
import { OtherStep } from './steps/OtherStep'
import { PassionsStep } from './steps/PassionsStep'
import { RunesStep } from './steps/RunesStep'
import { SheetStep } from './steps/SheetStep'
import { SkillsStep } from './steps/SkillsStep'
import type { Setter } from './ui'

const STEPS: { id: StepId; label: string }[] = [
  { id: 'concept', label: 'Concept' },
  { id: 'homeland', label: 'Homeland' },
  { id: 'runes', label: 'Runes' },
  { id: 'characteristics', label: 'Characteristics' },
  { id: 'passions', label: 'Family & Passions' },
  { id: 'occupation', label: 'Occupation' },
  { id: 'cult', label: 'Cult' },
  { id: 'skills', label: 'Skills' },
  { id: 'magic', label: 'Magic' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'other', label: 'Other Information' },
  { id: 'sheet', label: 'Adventurer Sheet' },
]

export function Editor({ c, set, onClose }: { c: Character; set: Setter; onClose: () => void }) {
  const [step, setStep] = useState<StepId>('concept')
  const issues = useMemo(() => validate(c), [c])
  const idx = STEPS.findIndex(s => s.id === step)
  const errorCount = issues.filter(i => i.severity === 'error').length
  useEffect(() => { track(`step/${step}`, `Reached step: ${STEPS.find(s => s.id === step)?.label}`, true) }, [step])
  useEffect(() => {
    if (step === 'sheet' && errorCount === 0) track('sheet-ready', 'Viewed a ready-for-adventure sheet', true)
  }, [step, errorCount])

  const props = { c, set }
  const body = {
    concept: <ConceptStep {...props} />,
    homeland: <HomelandStep {...props} />,
    runes: <RunesStep {...props} />,
    characteristics: <CharacteristicsStep {...props} />,
    passions: <PassionsStep {...props} />,
    occupation: <OccupationStep {...props} />,
    cult: <CultStep {...props} />,
    skills: <SkillsStep {...props} />,
    magic: <MagicStep {...props} />,
    equipment: <EquipmentStep {...props} />,
    other: <OtherStep {...props} />,
    sheet: <SheetStep c={c} issues={issues} />,
  }[step]

  const stepIssues = issues.filter(i => i.step === step && step !== 'sheet')

  return (
    <div className="editor">
      <header className="topbar no-print">
        <button type="button" className="ghost" onClick={onClose}>← Adventurers</button>
        <strong className="topbar-name">{c.name || 'New adventurer'}</strong>
        {homelandOf(c) && <span className="pill">{homelandOf(c)!.name}</span>}
        <span className="spacer" />
        <button type="button" onClick={() => { track('export-json', 'Exported an adventurer'); downloadJson(`${(c.name || 'adventurer').replace(/[^\w-]+/g, '_')}.rqg.json`, exportCharacter(c)) }}>Export JSON</button>
        <button type="button" onClick={() => { setStep('sheet'); setTimeout(() => window.print(), 50) }}>Print</button>
      </header>

      <div className="editor-body">
        <nav className="steps no-print" aria-label="Creation steps">
          <ol>
            {STEPS.map((s, i) => {
              const errs = issues.filter(x => x.step === s.id && x.severity === 'error').length
              const warns = issues.filter(x => x.step === s.id && x.severity === 'warning').length
              return (
                <li key={s.id}>
                  <button type="button" className={`step ${step === s.id ? 'current' : ''}`} aria-label={`Step ${i + 1}: ${s.label}`} title={s.label} aria-current={step === s.id ? 'step' : undefined} onClick={() => setStep(s.id)}>
                    <span className="step-num mono">{i + 1}</span>
                    <span className="step-label">{s.label}</span>
                    {errs > 0 ? <span className="badge bad" title={`${errs} errors`}>{errs}</span>
                      : warns > 0 ? <span className="badge warn" title={`${warns} warnings`}>{warns}</span>
                        : null}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        <main className="step-main">
          <h2 className="no-print">{STEPS[idx].label}</h2>
          {stepIssues.length > 0 && (
            <ul className="issue-list no-print">
              {stepIssues.map((i, n) => <li key={n} className={i.severity === 'error' ? 'bad' : 'warn'}>{i.severity === 'error' ? '✖' : '!'} {i.message}</li>)}
            </ul>
          )}
          {body}
          <div className="row step-nav no-print">
            <button type="button" disabled={idx === 0} onClick={() => setStep(STEPS[idx - 1].id)}>← {STEPS[idx - 1]?.label ?? 'Back'}</button>
            <span className="spacer" />
            {idx < STEPS.length - 1 && <button type="button" className="primary" onClick={() => setStep(STEPS[idx + 1].id)}>{STEPS[idx + 1].label} →</button>}
          </div>
        </main>

        <BudgetPanel c={c} />
      </div>
    </div>
  )
}

function BudgetPanel({ c }: { c: Character }) {
  const b = computeBudget(c)
  const d = computeDerived(c)
  const row = (label: string, p: Pool, unit = '') => {
    const left = remaining(p)
    const pct = p.total > 0 ? Math.min(100, (p.spent / p.total) * 100) : 0
    return (
      <div className="budget-row" key={label}>
        <div className="row">
          <span className="dim small">{label}</span>
          <span className="spacer" />
          <span className={`mono ${left < 0 ? 'bad' : left === 0 ? 'good' : ''}`}>{left}{unit}</span>
        </div>
        <div className="bar"><div className={`bar-fill ${left < 0 ? 'over' : ''}`} style={{ width: `${pct}%` }} /></div>
      </div>
    )
  }
  return (
    <aside className="budget no-print" aria-label="Remaining choices">
      <h3>Remaining</h3>
      {row('Power rune picks', b.powerPicks)}
      {row('Rune bonus points', b.runeBonus)}
      {c.options.charMethod === 'assign' && row('Characteristic points', b.assign)}
      {b.topUp.total > 0 && row('Low-roll points', b.topUp)}
      {b.occupationPicks.total > 0 && row('Occupation picks', b.occupationPicks)}
      {b.cultPicks.total > 0 && row('Cult skill bonuses', b.cultPicks)}
      {row('Personal +25%', b.personal25)}
      {row('Personal +10%', b.personal10)}
      {b.spiritMagic.total > 0 && row('Spirit magic points', b.spiritMagic)}
      {b.runeSpells.total > 0 && row('Rune spells', b.runeSpells)}
      {b.silver.total > 0 && row('Silver', b.silver, ' L')}
      <h3>At a glance</h3>
      <dl className="glance">
        <dt>Occupation</dt><dd>{occupationOf(c)?.name ?? '—'}</dd>
        <dt>Cult</dt><dd>{cultOf(c)?.name ?? '—'}</dd>
        {CHARS.map(ch => (
          <div key={ch} className="glance-pair">
            <dt>{CHAR_NAMES[ch]}</dt><dd className="mono">{charValue(c, ch)}</dd>
          </div>
        ))}
        <dt>Hit points</dt><dd className="mono">{d.hp}</dd>
        <dt>Magic points</dt><dd className="mono magic">{d.magicPoints}</dd>
        <dt>Damage bonus</dt><dd className="mono">{d.damageBonus}</dd>
        <dt>DEX / SIZ SR</dt><dd className="mono">{d.dexSR} / {d.sizSR}</dd>
        {d.runePoints > 0 && <><dt>Rune points</dt><dd className="mono magic">{d.runePoints}</dd></>}
      </dl>
    </aside>
  )
}
