import { chooseFavored, resolveKey } from '../engine/calc'
import { RULES } from '../engine/rules'
import type { PassionOption } from '../engine/types'
import { uid } from '../state/store'
import type { StepProps } from './ui'

/** Pick one favored passion for the occupation or cult; shows what it did, and lets you switch or clear it. */
export function FavoredPicker({ c, set, slot, options }: StepProps & { slot: 'occupation' | 'cult'; options: PassionOption[] }) {
  const taken = c.favored[slot]
  const held = taken && c.passions.find(p => p.uid === taken.uid)
  const label = (p: { kind: string; target: string }) => `${p.kind}${p.target ? ` (${p.target})` : ''}`
  return (
    <div className="favored">
      <p className="small dim">Pick one: a new passion starts at {RULES.basePassion}%, or one you already have gains +{RULES.passionRepeat}%.</p>
      <div className="rune-pick" role="radiogroup" aria-label="Favored passion">
        {options.map(o => {
          const name = label({ kind: o.kind, target: resolveKey(c, o.target) })
          const on = !!taken && label(taken) === name
          return (
            <button type="button" role="radio" aria-checked={on} key={name} className={on ? 'selected' : ''}
              onClick={() => set(ch => chooseFavored(ch, slot, o, uid))}>
              {on ? '✓ ' : ''}{name}
            </button>
          )
        })}
      </div>
      {taken && held && (
        <p className="small good">
          {taken.mode === 'new'
            ? `${label(taken)} starts at ${held.value}%.`
            : `${label(taken)} ${held.value - (taken.delta ?? RULES.passionRepeat)}% → ${held.value}%.`}
          {' '}Click it again to undo. See all passions on the Family &amp; Passions step.
        </p>
      )}
    </div>
  )
}
