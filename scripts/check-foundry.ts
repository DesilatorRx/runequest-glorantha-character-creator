// Checks the Foundry VTT export against the LATEST release of the Foundry RuneQuest system (rqg) and its
// compendium module, so a Foundry update that would break imports is caught. Run: node scripts/check-foundry.ts
// Exits 1 when something we rely on has disappeared; writes a Markdown report (and to the GitHub job summary).

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ClassicLevel } from 'classic-level'
import {
  FOUNDRY_ARMOR_RQID, FOUNDRY_CULTS, FOUNDRY_HIT_LOCATIONS, FOUNDRY_OCCUPATION, FOUNDRY_PASSION_RQID, FOUNDRY_RUNE_SPELL_RQID,
  FOUNDRY_RUNES, FOUNDRY_SKILLS, FOUNDRY_SPIRIT_RQID, FOUNDRY_SYSTEM, FOUNDRY_WEAPONS,
} from '../src/data/foundryMap.ts'

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')))
const BASELINE_FILE = path.join(ROOT, 'scripts', 'foundry-known-missing.json')
const headers: Record<string, string> = { 'User-Agent': 'rqg-character-creator-check' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

/** Things the exporter writes that the system must still understand. */
const ITEM_TYPES = ['skill', 'rune', 'passion', 'hitLocation', 'weapon', 'armor', 'gear', 'cult', 'runeMagic', 'spiritMagic']
const CODE_TOKENS = [
  'gainedChance', 'baseChance', 'specialization', 'skillName', 'equippedStatus', 'notCarried', 'skillRqidLink', 'cultId',
  'joinedCults', 'runePoints', 'isStackable', 'isOneUse', 'isVariable', 'hitLocationRqidLinks', 'absorbs', 'opposingRuneRqidLink',
  'meleeWeapons', 'missileWeapons', 'naturalWeapons', 'shields',
  ...new Set(Object.values(FOUNDRY_OCCUPATION).filter(Boolean)),
]

async function latest(repo: string) {
  const r = await fetch(`https://api.github.com/repos/sun-dragon-cult/${repo}/releases/latest`, { headers })
  if (!r.ok) throw new Error(`GitHub API ${r.status} for ${repo}`)
  return r.json() as Promise<{ tag_name: string; assets: { name: string; browser_download_url: string }[] }>
}

async function downloadAndUnzip(url: string, dir: string) {
  const r = await fetch(url, { headers: { 'User-Agent': headers['User-Agent'] } })
  if (!r.ok) throw new Error(`Download ${r.status}: ${url}`)
  const zip = path.join(dir, 'download.zip')
  fs.writeFileSync(zip, Buffer.from(await r.arrayBuffer()))
  execFileSync('unzip', ['-q', '-o', zip, '-d', dir])
  fs.rmSync(zip)
}

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

/** Every rqid in every compendium pack (LevelDB folders) under a directory. */
async function packRqids(dir: string): Promise<Set<string>> {
  const ids = new Set<string>()
  const dbs = walk(dir).filter(f => path.basename(f) === 'CURRENT').map(path.dirname)
  for (const db of dbs) {
    const level = new ClassicLevel<string, string>(db, { valueEncoding: 'utf8' })
    for await (const value of level.values()) {
      try {
        const id = JSON.parse(value)?.flags?.rqg?.documentRqidFlags?.id
        if (id) ids.add(id)
      } catch { /* not a document */ }
    }
    await level.close()
  }
  return ids
}

/** Every rqid the exporter can write that should exist in Foundry's compendiums. */
function requiredRqids(): Map<string, string> {
  const need = new Map<string, string>()
  const add = (rqid: string | undefined, what: string) => { if (rqid) need.set(rqid, what) }
  for (const [id, s] of Object.entries(FOUNDRY_SKILLS)) add(s.rqid, `skill ${id}`)
  for (const [id, w] of Object.entries(FOUNDRY_WEAPONS)) {
    add(w.rqid, `weapon ${id}`)
    for (const u of Object.values((w.system as { usage?: Record<string, { skillRqidLink?: { rqid: string } | null }> }).usage ?? {}))
      add(u?.skillRqidLink?.rqid, `weapon ${id} skill link`)
  }
  for (const [id, r] of Object.entries(FOUNDRY_RUNES)) { add(r.rqid, `rune ${id}`); add(r.opposing?.rqid, `rune ${id} opposite`) }
  for (const h of FOUNDRY_HIT_LOCATIONS) add(h.rqid, `hit location ${h.name}`)
  for (const [kind, rqid] of Object.entries(FOUNDRY_PASSION_RQID)) add(rqid, `passion ${kind}`)
  for (const [id, c] of Object.entries(FOUNDRY_CULTS)) { add(c.rqid, `cult ${id}`); for (const l of c.runeRqidLinks) add(l.rqid, `cult ${id} rune`) }
  for (const [id, rqid] of Object.entries(FOUNDRY_SPIRIT_RQID)) add(rqid, `spirit spell ${id}`)
  for (const [id, rqid] of Object.entries(FOUNDRY_RUNE_SPELL_RQID)) add(rqid, `rune spell ${id}`)
  for (const [id, rqid] of Object.entries(FOUNDRY_ARMOR_RQID)) add(rqid, `armor ${id}`)
  return need
}

async function main() {
  const updateBaseline = process.argv.includes('--update-baseline')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rqg-check-'))
  const report: string[] = []
  const problems: string[] = []

  const sys = await latest('fvtt-system-rqg')
  const wiki = await latest('fvtt-module-wiki-rqg')
  const asset = (rel: typeof sys, name: string) => rel.assets.find(a => a.name === name)?.browser_download_url
  const sysDir = path.join(tmp, 'system'), wikiDir = path.join(tmp, 'wiki')
  fs.mkdirSync(sysDir); fs.mkdirSync(wikiDir)
  await downloadAndUnzip(asset(sys, 'rqg.zip')!, sysDir)
  await downloadAndUnzip(asset(wiki, 'wiki-en-rqg.zip')!, wikiDir)

  const version = sys.tag_name.replace(/^v/, '')
  report.push(`# Foundry RQG compatibility check`, '', `- System: **${sys.tag_name}** (export built against ${FOUNDRY_SYSTEM.testedVersion})`, `- Compendium module: **${wiki.tag_name}**`)
  if (version !== FOUNDRY_SYSTEM.testedVersion) report.push(`- New system version since the export was built. If everything below passes, update \`testedVersion\` in src/data/foundryMap.ts.`)

  // 1. Document types in the system manifest.
  const manifest = JSON.parse(fs.readFileSync(walk(sysDir).find(f => path.basename(f) === 'system.json')!, 'utf8'))
  if (!manifest.documentTypes?.Actor?.character) problems.push('Actor type `character` no longer exists.')
  for (const t of ITEM_TYPES) if (!manifest.documentTypes?.Item?.[t]) problems.push(`Item type \`${t}\` no longer exists.`)

  // 2. Field names and enum values the exporter writes, in the system's code.
  const code = walk(sysDir).filter(f => f.endsWith('.js')).map(f => fs.readFileSync(f, 'utf8')).join('\n')
  for (const token of CODE_TOKENS) if (!code.includes(token)) problems.push(`\`${token}\` no longer appears in the system's code.`)

  // 3. Every rqid we link to still exists in the compendiums (compared with a baseline of known gaps).
  const have = new Set([...await packRqids(wikiDir), ...await packRqids(sysDir)])
  const need = requiredRqids()
  const missing = [...need.keys()].filter(r => !have.has(r)).sort()
  if (updateBaseline) {
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(missing, null, 2) + '\n')
    report.push(`- Baseline updated: ${missing.length} known gaps recorded.`)
  }
  const known = new Set<string>(fs.existsSync(BASELINE_FILE) ? JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')) : [])
  const newlyMissing = missing.filter(r => !known.has(r))
  for (const r of newlyMissing) problems.push(`rqid \`${r}\` (${need.get(r)}) is no longer in the compendiums.`)
  const fixed = [...known].filter(r => have.has(r))
  report.push(`- Compendium rqids found: ${have.size}; ours checked: ${need.size}; known gaps: ${known.size}`)
  if (fixed.length) report.push(`- Now available (remove from the baseline with --update-baseline): ${fixed.join(', ')}`)

  report.push('', problems.length ? `## ❌ ${problems.length} problem(s)` : '## ✅ All checks passed', '', ...problems.map(p => `- ${p}`))
  const text = report.join('\n')
  console.log(text)
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + '\n')
  fs.rmSync(tmp, { recursive: true, force: true })
  process.exit(problems.length ? 1 : 0)
}

main().catch(e => { console.error(e); process.exit(1) })
