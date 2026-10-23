import { useRef, useState, type ReactNode } from 'react'
import { RUNE_SPELLS, SKILLS, SPIRIT_SPELLS } from '../data'
import { allCults, allHomelands, allOccupations, type Homebrew } from '../data/registry'
import { CATEGORY_NAMES, CHAR_NAMES, RUNE_NAMES, isWeaponSkill, skillById } from '../engine/calc'
import type {
  CharId, Cult, Homeland, Occupation, PassionDef, PassionKind, PassionOption, RuneId, SkillGrant, StandardOfLiving,
} from '../engine/types'
import { CHARS, ELEMENTAL_RUNES, POWER_PAIRS } from '../engine/types'
import { asHomebrew, mergeHomebrew } from '../state/homebrew'
import { downloadJson } from '../state/storage'
import { uid } from '../state/store'
import { Section } from './ui'

type Kind = 'homelands' | 'occupations' | 'cults'
type Entry = Homeland | Occupation | Cult
const KIND_NAMES: Record<Kind, string> = { homelands: 'Homeland', occupations: 'Occupation', cults: 'Cult' }
const PASSION_KINDS: PassionKind[] = ['Devotion', 'Fear', 'Hate', 'Honor', 'Love', 'Loyalty']
const RUNES = [...ELEMENTAL_RUNES, ...POWER_PAIRS.flat()] as RuneId[]
const STANDARDS: StandardOfLiving[] = ['destitute', 'poor', 'free', 'noble', 'petty_king']
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'entry'
const newId = (name: string) => `hb-${slug(name)}-${uid().slice(0, 5)}`

const blank: Record<Kind, () => Entry> = {
  homelands: () => ({
    id: '', name: 'New homeland', culture: '', language: '', rune: 'air', skills: [], culturalWeapons: [],
    passions: [{ kind: 'Love', target: 'family', value: 60 }], cults: [], occupations: [], source: 'homebrew',
  }) as Homeland,
  occupations: () => ({
    id: '', name: 'New occupation', skills: [], standard: 'free', wealth: 100, passions: [], cults: [], source: 'homebrew', reputation: 5,
  }) as Occupation,
  cults: () => ({
    id: '', name: 'New cult', runes: [], skills: [], starting: [], spiritSpells: [], runeSpells: [], passions: [], associated: [], source: 'homebrew',
  }) as Cult,
}

/** Cult skills for the +20%/+15% picks: every skill the starting skills name, with open picks as tokens. */
function cultSkillsFrom(starting: SkillGrant[]): string[] {
  return [...new Set(starting.flatMap(g => ('skill' in g ? [g.skill]
    : Array.isArray(g.choose) ? g.choose : typeof g.choose === 'object' ? [] : g.choose === 'cultural_weapon' ? ['@cultural_weapon'] : ['@weapon'])))]
}

export function HomebrewPage({ homebrew, onChange, onClose }: { homebrew: Homebrew; onChange: (h: Homebrew) => void; onClose: () => void }) {
  const [editing, setEditing] = useState<{ kind: Kind; entry: Entry; isNew: boolean } | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const save = (kind: Kind, entry: Entry) => {
    const fixed = { ...entry, source: 'homebrew' } as Entry
    if (!fixed.id) fixed.id = newId(fixed.name)
    if (kind === 'homelands') {
      const h = fixed as Homeland
      h.culture ||= h.name
      h.language ||= h.culture
    }
    if (kind === 'cults') (fixed as Cult).skills = cultSkillsFrom((fixed as Cult).starting ?? [])
    const list = homebrew[kind] as Entry[]
    onChange({ ...homebrew, [kind]: list.some(x => x.id === fixed.id) ? list.map(x => (x.id === fixed.id ? fixed : x)) : [...list, fixed] })
    setEditing(null)
  }
  const remove = (kind: Kind, id: string) => {
    if (!confirm('Delete this homebrew entry? Adventurers using it will need to pick again.')) return
    onChange({ ...homebrew, [kind]: (homebrew[kind] as Entry[]).filter(x => x.id !== id) })
  }
  const copyOf = (e: Entry): Entry => ({ ...structuredClone(e), id: '', name: `${e.name} (homebrew)`, source: 'homebrew' } as Entry)
  const importFile = async (file: File) => {
    setError('')
    try {
      const pack = asHomebrew(JSON.parse(await file.text()))
      if (!pack) throw new Error('No homelands, occupations, or cults found')
      onChange(mergeHomebrew(homebrew, pack))
    } catch (e) {
      setError(`Couldn't import ${file.name}: ${(e as Error).message}`)
    }
  }

  if (editing) {
    const props = { onCancel: () => setEditing(null) }
    return (
      <div className="roster">
        {editing.kind === 'homelands' && <HomelandEditor value={editing.entry as Homeland} onSave={e => save('homelands', e)} {...props} />}
        {editing.kind === 'occupations' && <OccupationEditor value={editing.entry as Occupation} onSave={e => save('occupations', e)} {...props} />}
        {editing.kind === 'cults' && <CultEditor value={editing.entry as Cult} onSave={e => save('cults', e)} {...props} />}
      </div>
    )
  }

  const books: Record<Kind, Entry[]> = {
    homelands: allHomelands().filter(x => x.source !== 'homebrew'),
    occupations: allOccupations().filter(x => x.source !== 'homebrew'),
    cults: allCults().filter(x => x.source !== 'homebrew'),
  }
  return (
    <div className="roster">
      <header className="row">
        <button type="button" className="ghost" onClick={onClose}>← Adventurers</button>
        <h2 style={{ margin: 0 }}>Homebrew</h2>
        <span className="spacer" />
        <button type="button" onClick={() => downloadJson(`${slug(homebrew.name)}.rqg-homebrew.json`, homebrew)}>Export pack</button>
        <button type="button" onClick={() => fileRef.current?.click()}>Import pack…</button>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={e => { const f = e.target.files?.[0]; if (f) importFile(f); e.target.value = '' }} />
      </header>
      {error && <p className="bad small">{error}</p>}
      <p className="dim small">
        Make your own homelands, occupations, and cults, or start from a copy of one in the book. They appear in the creation
        steps marked <span className="pill homebrew-pill">homebrew</span>. Export the pack to share it with your players; an
        exported adventurer also carries any homebrew it uses. Homebrew is saved in this browser.
      </p>
      <label className="row small">
        <span className="dim">Pack name</span>
        <input type="text" value={homebrew.name} onChange={e => onChange({ ...homebrew, name: e.target.value })} />
      </label>

      {(['homelands', 'occupations', 'cults'] as Kind[]).map(kind => (
        <Section key={kind} title={`${KIND_NAMES[kind]}s`} aside={
          <span className="row">
            <select aria-label={`Copy a book ${KIND_NAMES[kind].toLowerCase()}`} value="" onChange={e => {
              const src = books[kind].find(x => x.id === e.target.value)
              if (src) setEditing({ kind, entry: copyOf(src), isNew: true })
            }}>
              <option value="">Copy from the book…</option>
              {books[kind].map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
            <button type="button" className="primary small" onClick={() => setEditing({ kind, entry: blank[kind](), isNew: true })}>New {KIND_NAMES[kind].toLowerCase()}</button>
          </span>
        }>
          {(homebrew[kind] as Entry[]).length === 0 && <p className="dim small">None yet.</p>}
          <ul className="pick-list">
            {(homebrew[kind] as Entry[]).map(e => (
              <li key={e.id} className="pick-row">
                <span className="pick-main"><strong>{e.name}</strong> <span className="faint small">{e.hint}</span></span>
                <span className="row nowrap">
                  <button type="button" className="small" onClick={() => setEditing({ kind, entry: structuredClone(e), isNew: false })}>Edit</button>
                  <button type="button" className="small" onClick={() => setEditing({ kind, entry: copyOf(e), isNew: true })}>Duplicate</button>
                  <button type="button" className="ghost danger small" onClick={() => remove(kind, e.id)}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editors

function EditorShell({ title, onSave, onCancel, canSave, children }: { title: string; onSave: () => void; onCancel: () => void; canSave: boolean; children: ReactNode }) {
  return (
    <div className="stack">
      <header className="row">
        <h2 style={{ margin: 0 }}>{title}</h2>
        <span className="spacer" />
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="button" className="primary" disabled={!canSave} onClick={onSave}>Save</button>
      </header>
      {children}
    </div>
  )
}

const Text = ({ label, value, onChange, placeholder, wide }: { label: string; value: string | undefined; onChange: (v: string) => void; placeholder?: string; wide?: boolean }) => (
  <label className={wide ? 'span-2' : ''}><span className="dim small">{label}</span>
    <input type="text" value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
  </label>
)
const Num = ({ label, value, onChange, min = 0, max = 10000 }: { label: string; value: number | undefined; onChange: (v: number) => void; min?: number; max?: number }) => (
  <label><span className="dim small">{label}</span>
    <input type="number" min={min} max={max} value={value ?? 0} onChange={e => onChange(Number(e.target.value) || 0)} />
  </label>
)

function HomelandEditor({ value, onSave, onCancel }: { value: Homeland; onSave: (h: Homeland) => void; onCancel: () => void }) {
  const [h, setH] = useState(value)
  const set = (patch: Partial<Homeland>) => setH(x => ({ ...x, ...patch }))
  const weapons = SKILLS.filter(isWeaponSkill).map(s => ({ id: s.id, name: s.name }))
  return (
    <EditorShell title="Homeland" onSave={() => onSave(h)} onCancel={onCancel} canSave={!!h.name.trim()}>
      <Section title="Basics">
        <div className="form-grid">
          <Text label="Name" value={h.name} onChange={v => set({ name: v })} />
          <Text label="People (for Customs)" value={h.culture} onChange={v => set({ culture: v })} placeholder="e.g. Heortling" />
          <Text label="Language (Speak Own Language)" value={h.language} onChange={v => set({ language: v })} placeholder="e.g. Heortling" />
          <Text label="Place (for Homeland Lore)" value={h.place} onChange={v => set({ place: v })} placeholder={h.name} />
          <label><span className="dim small">Rune bonus (+10%)</span>
            <select value={h.rune} onChange={e => set({ rune: e.target.value as RuneId })}>{RUNES.map(r => <option key={r} value={r}>{RUNE_NAMES[r]}</option>)}</select>
          </label>
          <Text label="Short description" value={h.hint} onChange={v => set({ hint: v })} wide />
        </div>
        <h4>Characteristic modifiers</h4>
        <div className="row">
          {CHARS.map(ch => (
            <label key={ch} className="row small">{CHAR_NAMES[ch]}
              <input type="number" className="num-input" min={-6} max={6} value={h.charMods?.[ch] ?? 0}
                onChange={e => set({ charMods: { ...h.charMods, [ch as CharId]: Number(e.target.value) || 0 } })} />
            </label>
          ))}
        </div>
      </Section>
      <Section title="Cultural skill bonuses"><GrantsEditor value={h.skills} onChange={skills => set({ skills })} /></Section>
      <Section title="Cultural weapons"><MultiPick options={weapons} value={h.culturalWeapons} onChange={culturalWeapons => set({ culturalWeapons })} /></Section>
      <Section title="Starting passions"><PassionDefsEditor value={h.passions} onChange={passions => set({ passions })} /></Section>
      <Section title="Common cults"><MultiPick options={allCults().map(x => ({ id: x.id, name: x.name }))} value={h.cults} onChange={cults => set({ cults })} /></Section>
      <Section title="Suggested occupations"><MultiPick options={allOccupations().map(x => ({ id: x.id, name: x.name }))} value={h.occupations} onChange={occupations => set({ occupations })} /></Section>
    </EditorShell>
  )
}

function OccupationEditor({ value, onSave, onCancel }: { value: Occupation; onSave: (o: Occupation) => void; onCancel: () => void }) {
  const [o, setO] = useState(value)
  const set = (patch: Partial<Occupation>) => setO(x => ({ ...x, ...patch }))
  return (
    <EditorShell title="Occupation" onSave={() => onSave(o)} onCancel={onCancel} canSave={!!o.name.trim()}>
      <Section title="Basics">
        <div className="form-grid">
          <Text label="Name" value={o.name} onChange={v => set({ name: v })} />
          <label><span className="dim small">Standard of living</span>
            <select value={o.standard} onChange={e => set({ standard: e.target.value as StandardOfLiving })}>
              {STANDARDS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </label>
          <Num label="Starting wealth (Lunars to spend)" value={o.wealth} onChange={v => set({ wealth: v })} />
          <Text label="Wealth note" value={o.wealthNote} onChange={v => set({ wealthNote: v })} placeholder="e.g. 20 L coin and goods worth 100 L" />
          <Text label="Income" value={o.income} onChange={v => set({ income: v })} placeholder="e.g. 60 L" />
          <Num label="Ransom (L)" value={o.ransom} onChange={v => set({ ransom: v || undefined })} />
          <Num label="Reputation bonus (%)" value={o.reputation} onChange={v => set({ reputation: v || undefined })} max={50} />
          <Num label="Extra spirit magic points" value={o.spiritMagic} onChange={v => set({ spiritMagic: v || undefined })} max={10} />
          <Text label="Short description" value={o.hint} onChange={v => set({ hint: v })} wide />
        </div>
      </Section>
      <Section title="Occupational skill bonuses"><GrantsEditor value={o.skills} onChange={skills => set({ skills })} /></Section>
      <Section title="Passions to choose from"><PassionOptionsEditor value={o.passions} onChange={passions => set({ passions })} /></Section>
      <Section title="Typical cults"><MultiPick options={allCults().map(x => ({ id: x.id, name: x.name }))} value={o.cults} onChange={cults => set({ cults })} /></Section>
    </EditorShell>
  )
}

function CultEditor({ value, onSave, onCancel }: { value: Cult; onSave: (c: Cult) => void; onCancel: () => void }) {
  const [c, setC] = useState(value)
  const set = (patch: Partial<Cult>) => setC(x => ({ ...x, ...patch }))
  const spirit = SPIRIT_SPELLS.map(s => ({ id: s.id, name: s.name }))
  const special = RUNE_SPELLS.filter(s => !s.common).map(s => ({ id: s.id, name: s.name }))
  return (
    <EditorShell title="Cult" onSave={() => onSave(c)} onCancel={onCancel} canSave={!!c.name.trim() && c.runes.length > 0}>
      <Section title="Basics">
        <div className="form-grid">
          <Text label="Name" value={c.name} onChange={v => set({ name: v })} />
          <Text label="Deity (for Worship and Cult Lore)" value={c.deity} onChange={v => set({ deity: v || undefined })} placeholder={c.name} />
          <Text label="Short description" value={c.hint} onChange={v => set({ hint: v })} wide />
        </div>
        <h4>Runes (an initiate needs one at 50%+)</h4>
        <MultiPick options={RUNES.map(r => ({ id: r, name: RUNE_NAMES[r] }))} value={c.runes} onChange={runes => set({ runes: runes as RuneId[] })} />
      </Section>
      <Section title="Cult starting skills">
        <p className="dim small">Fixed bonuses every initiate gets. The +20% and +15% initiation picks go to these skills.</p>
        <GrantsEditor value={c.starting ?? []} onChange={starting => set({ starting })} />
      </Section>
      <Section title="Spirit magic taught"><MultiPick options={spirit} value={c.spiritSpells} onChange={spiritSpells => set({ spiritSpells })} /></Section>
      <Section title="Spirit magic forbidden"><MultiPick options={spirit} value={c.prohibitedSpirit ?? []} onChange={prohibitedSpirit => set({ prohibitedSpirit })} /></Section>
      <Section title="Special Rune magic (common Rune magic is automatic)"><MultiPick options={special} value={c.runeSpells} onChange={runeSpells => set({ runeSpells })} /></Section>
      <Section title="Associated cults"><MultiPick options={allCults().filter(x => x.id !== c.id).map(x => ({ id: x.id, name: x.name }))} value={c.associated ?? []} onChange={associated => set({ associated })} /></Section>
      <Section title="Favored passions"><PassionOptionsEditor value={c.passions} onChange={passions => set({ passions })} /></Section>
    </EditorShell>
  )
}

// ---------------------------------------------------------------------------
// Field widgets

/** Pick any number of items: chips you toggle, with a filter when the list is long. */
function MultiPick({ options, value, onChange }: { options: { id: string; name: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  const [q, setQ] = useState('')
  const shown = options.filter(o => value.includes(o.id) || o.name.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <div>
      {options.length > 20 && <input type="search" className="gear-search" placeholder="Filter…" value={q} onChange={e => setQ(e.target.value)} />}
      <div className="rune-pick" style={{ marginTop: '0.5rem' }}>
        {shown.map(o => {
          const on = value.includes(o.id)
          return <button type="button" key={o.id} className={on ? 'selected' : ''} aria-pressed={on} onClick={() => onChange(on ? value.filter(x => x !== o.id) : [...value, o.id])}>{on ? '✓ ' : ''}{o.name}</button>
        })}
      </div>
    </div>
  )
}

const SUBJECT_HINTS = ['{language}', '{homeland}', '{place}', '{deity}']

/** A skill key: a skill, plus a subject for skills like Lore or Speak Other Language. */
function SkillKeyInput({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  const [id, subject = ''] = value.split(/:(.*)/s)
  const skill = skillById(id)
  const groups = Object.entries(CATEGORY_NAMES)
  return (
    <span className="row nowrap">
      <select aria-label="Skill" value={id} onChange={e => onChange(skillById(e.target.value)?.specify ? `${e.target.value}:${subject}` : e.target.value)}>
        <option value="">Choose a skill…</option>
        {groups.map(([cat, name]) => (
          <optgroup key={cat} label={name}>{SKILLS.filter(s => s.category === cat).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>
        ))}
      </select>
      {skill?.specify && (
        <>
          <input type="text" list="hb-subjects" aria-label="Subject" placeholder={skill.specify} value={subject} onChange={e => onChange(`${id}:${e.target.value}`)} />
          <datalist id="hb-subjects">{SUBJECT_HINTS.map(s => <option key={s} value={s} />)}</datalist>
        </>
      )}
    </span>
  )
}

type GrantMode = 'skill' | 'list' | 'subject' | 'weapon' | 'melee' | 'missile' | 'cultural_weapon' | 'shield' | 'any'
const MODE_NAMES: Record<GrantMode, string> = {
  skill: 'Skill', list: 'One of these…', subject: 'Subject of their choice…', weapon: 'Any weapon', melee: 'Any melee weapon', missile: 'Any missile weapon',
  cultural_weapon: 'A cultural weapon', shield: 'Any shield', any: 'Any skill',
}
const modeOf = (g: SkillGrant): GrantMode => ('skill' in g ? 'skill' : Array.isArray(g.choose) ? 'list' : typeof g.choose === 'object' ? 'subject' : g.choose === 'cult' ? 'any' : g.choose as GrantMode)

/** Skill bonuses: fixed skills, or a choice (from a list, any weapon, etc.). */
function GrantsEditor({ value, onChange }: { value: SkillGrant[]; onChange: (v: SkillGrant[]) => void }) {
  const update = (i: number, g: SkillGrant) => onChange(value.map((x, j) => (j === i ? g : x)))
  const switchMode = (i: number, mode: GrantMode) => {
    const bonus = value[i].bonus
    update(i, mode === 'skill' ? { skill: '', bonus } : mode === 'list' ? { choose: [], bonus, label: '' }
      : mode === 'subject' ? { choose: { subject: 'lore' }, bonus, label: 'Lore (any)' } : { choose: mode, bonus, label: MODE_NAMES[mode].toLowerCase() })
  }
  return (
    <div className="stack-tight grants-editor">
      {value.map((g, i) => (
        <div key={i} className="row grant-row">
          <input type="number" className="num-input" min={-50} max={100} aria-label="Bonus" value={g.bonus} onChange={e => update(i, { ...g, bonus: Number(e.target.value) || 0 })} />
          <span className="faint">%</span>
          <select aria-label="Kind" value={modeOf(g)} onChange={e => switchMode(i, e.target.value as GrantMode)}>
            {(Object.keys(MODE_NAMES) as GrantMode[]).map(m => <option key={m} value={m}>{MODE_NAMES[m]}</option>)}
          </select>
          {'skill' in g && <SkillKeyInput value={g.skill} onChange={skill => update(i, { ...g, skill })} />}
          {'choose' in g && typeof g.choose === 'object' && !Array.isArray(g.choose) && (
            <select aria-label="Skill with a subject" value={g.choose.subject} onChange={e => update(i, { ...g, choose: { subject: e.target.value }, label: `${skillById(e.target.value)?.name} (any)` })}>
              {SKILLS.filter(x => x.specify).map(x => <option key={x.id} value={x.id}>{x.name} (any)</option>)}
            </select>
          )}
          {'choose' in g && Array.isArray(g.choose) && (
            <span className="row">
              {g.choose.map((k, j) => (
                <span key={j} className="row nowrap">
                  <SkillKeyInput value={k} onChange={nk => update(i, { ...g, choose: (g.choose as string[]).map((x, n) => (n === j ? nk : x)) })} />
                  <button type="button" className="ghost small" aria-label="Remove option" onClick={() => update(i, { ...g, choose: (g.choose as string[]).filter((_, n) => n !== j) })}>✕</button>
                </span>
              ))}
              <button type="button" className="small" onClick={() => update(i, { ...g, choose: [...(g.choose as string[]), ''] })}>+ option</button>
            </span>
          )}
          {'choose' in g && <input type="text" aria-label="Label" placeholder="label, e.g. Bow or Sling" value={g.label ?? ''} onChange={e => update(i, { ...g, label: e.target.value })} />}
          <button type="button" className="ghost danger small" aria-label="Remove bonus" onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="small" onClick={() => onChange([...value, { skill: '', bonus: 10 }])}>+ Skill bonus</button>
    </div>
  )
}

function PassionDefsEditor({ value, onChange }: { value: PassionDef[]; onChange: (v: PassionDef[]) => void }) {
  return (
    <div className="stack-tight">
      {value.map((p, i) => (
        <div key={i} className="row">
          <select value={p.kind} onChange={e => onChange(value.map((x, j) => (j === i ? { ...x, kind: e.target.value as PassionKind } : x)))}>{PASSION_KINDS.map(k => <option key={k}>{k}</option>)}</select>
          <input type="text" placeholder="family, clan, a deity…" value={p.target} onChange={e => onChange(value.map((x, j) => (j === i ? { ...x, target: e.target.value } : x)))} />
          <input type="number" className="num-input" min={0} max={100} value={p.value} onChange={e => onChange(value.map((x, j) => (j === i ? { ...x, value: Number(e.target.value) || 0 } : x)))} /><span className="faint">%</span>
          <button type="button" className="ghost danger small" aria-label="Remove passion" onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="small" onClick={() => onChange([...value, { kind: 'Loyalty', target: '', value: 60 }])}>+ Passion</button>
    </div>
  )
}

function PassionOptionsEditor({ value, onChange }: { value: PassionOption[]; onChange: (v: PassionOption[]) => void }) {
  return (
    <div className="stack-tight">
      {value.map((p, i) => (
        <div key={i} className="row">
          <select value={p.kind} onChange={e => onChange(value.map((x, j) => (j === i ? { ...x, kind: e.target.value as PassionKind } : x)))}>{PASSION_KINDS.map(k => <option key={k}>{k}</option>)}</select>
          <input type="text" placeholder="temple, leader, {deity}… (blank for Honor)" value={p.target} onChange={e => onChange(value.map((x, j) => (j === i ? { ...x, target: e.target.value } : x)))} />
          <button type="button" className="ghost danger small" aria-label="Remove passion" onClick={() => onChange(value.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="small" onClick={() => onChange([...value, { kind: 'Loyalty', target: '' }])}>+ Passion</button>
    </div>
  )
}
