import { describe, expect, it } from 'vitest'
import { newCharacter, normalize } from '../state/store'
import { computeDerived, skillLines } from './calc'
import { exportCharacter } from './export'

const sample = () => {
  const c = newCharacter()
  c.name = 'Vasana'
  c.homeland = 'sartar'
  c.runes = { primary: 'air', secondary: 'moon', tertiary: 'earth' }
  c.powerPicks = ['movement', 'death']
  c.occupation = 'warrior_heavy_infantry'
  c.occupationPicks = { 5: 'broadsword' }
  c.personal25 = ['broadsword']
  c.gear = [{ uid: 'w', id: 'broadsword', qty: 1 }]
  return c
}

describe('JSON export', () => {
  it('includes final values that match the app', () => {
    const c = sample()
    const file = JSON.parse(JSON.stringify(exportCharacter(c)))
    expect(file.sheet.format).toBe('rqg-character-creator/sheet')
    expect(file.sheet.characteristics.STR).toBe(c.chars.str + 2) // Air is the highest rune
    expect(file.sheet.attributes.hitPoints).toBe(computeDerived(c).hp)
    const broadsword = skillLines(c).find(l => l.key === 'broadsword')!
    const exported = file.sheet.skills.find((s: { key: string }) => s.key === 'broadsword')
    expect(exported.value).toBe(broadsword.total)
    expect(exported.sources.personal).toBe(25)
    expect(file.sheet.weapons[0]).toMatchObject({ name: 'Broadsword', value: broadsword.total })
    expect(file.sheet.runes.Air).toBe(70)
  })

  it('ignores the computed sheet on import and rebuilds from choices', () => {
    const c = sample()
    const file = JSON.parse(JSON.stringify(exportCharacter(c)))
    const back = normalize({ ...file, kitFor: 'warrior_heavy_infantry' })
    expect('sheet' in back).toBe(false)
    expect(skillLines(back).find(l => l.key === 'broadsword')!.total).toBe(skillLines(c).find(l => l.key === 'broadsword')!.total)
  })
})
