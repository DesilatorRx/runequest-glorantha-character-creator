import { useRef, useState } from 'react'
import { cultOf, homelandOf, occupationOf } from '../engine/calc'
import type { Character } from '../engine/types'
import { validate } from '../engine/validate'
import { track } from '../analytics'
import { FAN_NOTICE } from './legal'

export function Roster({ chars, onOpen, onCreate, onImport, onDelete, onDuplicate, onHomebrew, homebrewCount }: {
  chars: Character[]
  onOpen: (id: string) => void
  onCreate: () => void
  onImport: (c: Character) => void
  onDelete: (id: string) => void
  onDuplicate: (c: Character) => void
  onHomebrew: () => void
  homebrewCount: number
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const importFile = async (file: File) => {
    setError('')
    try {
      const data = JSON.parse(await file.text())
      if (!data || typeof data !== 'object' || !data.chars || !data.runes) throw new Error('Not an adventurer file')
      track('import-json', 'Imported an adventurer')
      onImport(data as Character)
    } catch (e) {
      setError(`Couldn't import ${file.name}: ${(e as Error).message}`)
    }
  }

  return (
    <div className="roster">
      <header className="hero">
        <div className="hero-mark" aria-hidden>☉</div>
        <div>
          <h1>RuneQuest Glorantha Character Creator</h1>
          <p className="dim">A free adventurer creator for RuneQuest: Roleplaying in Glorantha.</p>
        </div>
      </header>

      <section className="card">
        <h3>New adventurer</h3>
        <div className="row">
          <button type="button" className="primary" onClick={onCreate}>New adventurer</button>
          <span className="spacer" />
          <button type="button" onClick={onHomebrew}>Homebrew{homebrewCount ? ` (${homebrewCount})` : ''}</button>
          <button type="button" onClick={() => fileRef.current?.click()}>Import JSON…</button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={e => { const f = e.target.files?.[0]; if (f) importFile(f); e.target.value = '' }}
          />
        </div>
        {error && <p className="bad small">{error}</p>}
      </section>

      <section>
        <h3>Your adventurers</h3>
        {chars.length === 0 && <p className="dim">No adventurers yet. They're saved in this browser; export JSON to back them up or share them.</p>}
        <div className="runner-grid">
          {chars.map(c => {
            const errs = validate(c).filter(i => i.severity === 'error').length
            return (
              <article key={c.id} className="card runner-card">
                <button type="button" className="runner-open" onClick={() => onOpen(c.id)}>
                  <strong>{c.name || 'Unnamed adventurer'}</strong>
                  <span className="small dim">{[homelandOf(c)?.name, occupationOf(c)?.name].filter(Boolean).join(' · ') || '—'}</span>
                  <span className="small faint">{cultOf(c) ? `Initiate of ${cultOf(c)!.name}` : c.concept || '—'}</span>
                  <span className={`small ${errs ? 'warn' : 'good'}`}>{errs ? `${errs} issue${errs > 1 ? 's' : ''} left` : 'Ready for adventure'}</span>
                </button>
                <div className="row">
                  <span className="spacer" />
                  <button type="button" className="ghost small" onClick={() => onDuplicate(c)}>Duplicate</button>
                  <button
                    type="button"
                    className="ghost danger small"
                    onClick={() => { if (confirm(`Delete ${c.name || 'this adventurer'}? This can't be undone.`)) onDelete(c.id) }}
                  >Delete</button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <footer className="small faint footer">
        <p>{FAN_NOTICE}</p>
        <p>No rules text is included. You'll need the RuneQuest rulebook to play. Anonymous usage counts (no cookies, no personal data) via GoatCounter; adventurers never leave your browser.</p>
      </footer>
    </div>
  )
}
