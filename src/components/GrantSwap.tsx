import { SKILLS } from '../data'
import { isSwappable, isWeaponSkill, resolveKey, skillName } from '../engine/calc'
import type { SkillGrant } from '../engine/types'
import type { StepProps } from './ui'

/**
 * A fixed skill bonus from the homeland or occupation. Weapon bonuses can be moved to another weapon with the
 * gamemaster's approval (e.g. an Esrolian noble trading the battle axe for a small axe); the sheet lists swaps.
 */
export function GrantSwap({ c, set, source, index, grant }: StepProps & { source: 'homeland' | 'occupation' | 'region'; index: number; grant: Extract<SkillGrant, { skill: string }> }) {
  const original = resolveKey(c, grant.skill)
  const key = `${source}:${index}`
  const swapped = c.swaps?.[key]
  if (!isSwappable(grant)) return <span>{skillName(c, original)}</span>
  return (
    <span className="row nowrap grant-swap">
      <span className={swapped ? 'faint strike' : ''}>{skillName(c, original)}</span>
      {swapped && <span>→ {skillName(c, swapped)}</span>}
      <select className="swap-select" aria-label={`Swap ${skillName(c, original)} for another weapon`} value=""
        onChange={e => {
          const v = e.target.value
          set(ch => {
            const swaps = { ...ch.swaps }
            if (v === '__undo' || v === original) delete swaps[key]
            else swaps[key] = v
            return { ...ch, swaps }
          })
        }}>
        <option value="">{swapped ? 'change…' : 'swap…'}</option>
        {swapped && <option value="__undo">Undo swap</option>}
        {SKILLS.filter(s => isWeaponSkill(s) && s.id !== original).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </span>
  )
}
