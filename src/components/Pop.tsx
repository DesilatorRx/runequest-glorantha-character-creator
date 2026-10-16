import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { Breakdown } from '../engine/breakdown'

/**
 * Click (or tap) a label to open a popover with its breakdown. Fixed positioning keeps it clear of scrolling
 * tables; Escape, a click elsewhere, or scrolling closes it.
 */
export function Pop({ label, children, title, content, className = '' }: {
  label: string
  children: ReactNode
  title?: ReactNode
  content: () => ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const anchor = useRef<HTMLButtonElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const id = useId()
  const close = useCallback(() => setOpen(false), [])

  useLayoutEffect(() => {
    if (!open || !anchor.current) return
    const r = anchor.current.getBoundingClientRect()
    const h = card.current?.offsetHeight ?? 200
    const w = Math.min(340, window.innerWidth - 32)
    const above = r.bottom + h + 12 > window.innerHeight && r.top > h + 12
    setPos({ top: above ? r.top - h - 6 : r.bottom + 6, left: Math.max(16, Math.min(r.left, window.innerWidth - w - 16)) })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { close(); anchor.current?.focus() } }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!anchor.current?.contains(t) && !card.current?.contains(t)) close()
    }
    const onScroll = (e: Event) => { if (!card.current?.contains(e.target as Node)) close() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, close])

  return (
    <>
      <button
        type="button"
        ref={anchor}
        className={`pop-trigger ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        title={`Details for ${label}`}
        onClick={() => setOpen(o => !o)}
      >{children}</button>
      {open && (
        <div
          id={id}
          ref={card}
          role="dialog"
          aria-label={label}
          className="pop-card"
          style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden', top: 0, left: 0 }}
        >
          {title && <div className="pop-title">{title}</div>}
          {content()}
        </div>
      )}
    </>
  )
}

/** A breakdown table: one row per source, the last row the total. */
export function BreakdownView({ b, summary, page }: { b: Breakdown; summary?: string; page?: number }) {
  return (
    <>
      {summary && <p className="pop-summary">{summary}</p>}
      <table className="pop-table">
        <tbody>
          {b.rows.map((r, i) => (
            <tr key={i} className={r.strong ? 'pop-total' : r.dim ? 'dim' : ''}>
              <td>{r.label}</td><td className="mono">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {b.note && <p className="pop-note">{b.note}</p>}
      {page && <p className="pop-page">Rulebook p. {page}</p>}
    </>
  )
}
