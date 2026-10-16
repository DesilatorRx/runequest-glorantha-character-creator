import { useCallback, useState } from 'react'
import './App.css'
import { Editor } from './components/Editor'
import { HomebrewPage } from './components/HomebrewPage'
import { Roster } from './components/Roster'
import type { Character } from './engine/types'
import { asHomebrew, mergeHomebrew, useHomebrew } from './state/homebrew'
import { useCharacters } from './state/store'

export default function App() {
  const { homebrew, update: updateHomebrew } = useHomebrew()
  const { chars, active, setActiveId, update, create, add, remove } = useCharacters()
  const [view, setView] = useState<'roster' | 'homebrew'>('roster')

  const set = useCallback((fn: (c: Character) => Character) => {
    if (active) update(active.id, fn)
  }, [active, update])

  // An exported adventurer may carry the homebrew it uses: add that first so the adventurer opens correctly.
  const importCharacter = (c: Character & { homebrew?: unknown }) => {
    const carried = asHomebrew(c.homebrew)
    if (carried) updateHomebrew(mergeHomebrew(homebrew, carried))
    add(c)
  }

  if (active) return <Editor key={active.id} c={active} set={set} onClose={() => setActiveId(null)} />
  if (view === 'homebrew') return <HomebrewPage homebrew={homebrew} onChange={updateHomebrew} onClose={() => setView('roster')} />

  return (
    <Roster
      chars={chars}
      onOpen={setActiveId}
      onCreate={create}
      onImport={importCharacter}
      onDelete={remove}
      onDuplicate={c => add({ ...c, name: c.name ? `${c.name} (copy)` : c.name })}
      onHomebrew={() => setView('homebrew')}
      homebrewCount={homebrew.homelands.length + homebrew.occupations.length + homebrew.cults.length}
    />
  )
}
