# RuneQuest Glorantha Character Creator: free RuneQuest character creator

A free, open-source **RuneQuest: Roleplaying in Glorantha (RQG) character creator** that runs in your browser. **Use it here: https://desilatorrx.github.io/runequest-glorantha-character-creator/**

**Ruleset:** *RuneQuest: Roleplaying in Glorantha* (Chaosium, 2018, 2nd printing). Every number used in character
creation was checked against the core rulebook, with page references in the data files. Known gaps are listed in
[VERIFY.md](VERIFY.md).

It needs no install and no account. Adventurers are saved in your browser, and you can export them as JSON to back them up or share them.

## Features

- **All eight creation steps from the book:**
  1. Homeland: the six homelands and five Praxian tribes, with tribal and regional modifiers
  2. Family history: passions, skill bonuses and Reputation, or the skip option
  3. Rune affinities
  4. Characteristics: rolled with the low-roll top-up, or point-buy as a house rule
  5. Occupation: all 20, with suggested choices for each homeland
  6. Cult: 23 cults with their starting skills, spirit magic, special Rune magic and favored passions
  7. Personal skill bonuses
  8. Other information: birth date from your runes, family heirloom, Reputation, older adventurers and aging
- **Live tallies** for every pool and pick, with rule checks on each step.
- **Runes:**
  - 60/40/20 elemental affinities, two Power/Form runes at 75%, and 50 bonus points
  - the homeland rune bonus
  - the +2/+1 characteristic bonus, which can go to CHA instead
  - the requirement of a cult rune at 50% or more
- **Skills** with a per-source breakdown and the book's category modifier rules, capped at 100% at creation.
- **Magic:**
  - spirit magic from your cult and its associated cults, with CHA limits, free spells and prohibited spells
  - all common Rune magic, plus special Rune spells (sacrifice POW for more)
  - sorcery for Philosophers and Lhankor Mhy initiates
- **Equipment:** weapons, armor (per hit location) and over 160 general items, bought with your occupation's starting wealth.
- **Print or save as PDF** from a clean adventurer sheet. Works on desktop and phone.

## Homebrew and stronger starts

- **Homebrew:** the **Homebrew** page (from the adventurer list) lets you create homelands, occupations, and cults with
  forms, or start from a copy of a book entry. They appear in the creation steps marked *homebrew*. **Export pack**
  saves a file to share with your players; **Import pack** merges one in. An exported adventurer carries the homebrew it
  uses, so it opens correctly on another computer.
- **Starting power** (Concept step): by the book, older adventurers start more experienced (+5% to four occupation or
  cult skills, +3 Rune points, and +1 spirit magic per 10 years over 21; aging past 40). For a stronger start by house
  rule, add extra personal skill bonuses, Rune points, or spirit magic, or raise the starting skill cap, or use the
  *Experienced* preset.

## JSON export format

**Export JSON** saves two things:

- The adventurer's **choices** (rolls, runes, homeland, occupation and cult picks, bonuses, gear). The app rebuilds every number from these when you import the file.
- A **`sheet`** object with every **final value**, for VTTs and other tools. The app ignores it on import.

The `sheet` (format `rqg-character-creator/sheet`, version 1) contains:

| Field | What's in it |
| --- | --- |
| `identity` | name, age, homeland, region, occupation, cult, deity |
| `characteristics` | STR, CON, SIZ, DEX, INT, POW, CHA |
| `attributes` | hit points, magic points, healing rate, damage bonus, spirit combat damage, DEX/SIZ strike ranks, max ENC, ENC carried, move, Rune points, Reputation |
| `runes` | every rune's value in % |
| `hitLocations` | hit points and armor for each location |
| `skills` | for each skill: `value`, `valueLoaded` (with encumbrance penalties), and `sources` (base, category modifier, homeland, occupation, cult, history, personal) |
| `passions`, `weapons`, `magic`, `equipment` | final values; weapons include skill %, damage, strike rank, and HP |
| `issues` | any remaining rule problems; `complete` is true when there are no errors |

## Foundry VTT

**Foundry VTT** (top bar) saves an actor file for the RuneQuest: Roleplaying in Glorantha system for Foundry
(system id `rqg`, built against version 6.1.1).

1. In Foundry, create a new **Character** actor.
2. Right-click it in the Actors sidebar and choose **Import Data**.
3. Pick the downloaded `.foundry.json` file.

The file includes characteristics, runes, skills, passions, hit locations, weapons, armor, gear, the cult with its Rune
points, and spirit and Rune magic. Foundry computes category modifiers and hit points itself. Skills are sent as base
chance plus points gained, so totals match the app. Item ids follow Foundry's `rqid` scheme, so the system links them
to its compendium descriptions. Not exported yet: sorcery. Please report anything that doesn't import cleanly.

A weekly GitHub Action (`Foundry compatibility`) downloads the latest Foundry RQG system and compendium releases and
checks that the item types, field names, occupation codes, and compendium ids the export relies on still exist. If any
disappear, it opens an issue. To run it locally: `node scripts/check-foundry.ts` (Node 24). After confirming a new
Foundry version works, update `testedVersion` in `src/data/foundryMap.ts`.

## Running locally

```bash
npm install
npm run dev      # development server
npm test         # rules engine and data tests
npm run build    # production build in dist/
```

## Project layout

| Path | What lives there |
| --- | --- |
| `src/data/` | Game data: skills, homelands, occupations, cults, spells, weapons and armor. **Most corrections go here.** |
| `src/engine/rules.ts` | Creation-rule constants (rune values, bonus sizes, caps) and table options. |
| `src/engine/calc.ts` | Characteristics, runes, derived values, skill totals and tallies. |
| `src/engine/validate.ts` | Creation rule checks. |
| `src/components/` | React UI, one file per creation step. |

## Data sources

Every data entry was checked against the core rulebook and is marked `source: 'book'`. [VERIFY.md](VERIFY.md) lists
page references and the few known gaps.

## Contributing

Found a wrong number? Fix it in `src/data/` and open a pull request, citing the book and page. Please don't paste
rulebook text; this project contains names and numbers only.

## Legal

- The code is MIT licensed (see `LICENSE`).
- This tool uses trademarks and/or copyrights owned by Chaosium Inc/Moon Design Publications LLC, which are used under
  Chaosium Inc's Fan Material Policy. We are expressly prohibited from charging you to use or access this content.
  This tool is not published, endorsed, or specifically approved by Chaosium Inc. For more information about Chaosium
  Inc's products, please visit [www.chaosium.com](https://www.chaosium.com).
- Chaosium's policy allows web-based character generators but not downloadable apps, so this project stays a website.
- The tool reproduces no rules text, so you need the rulebook to play.
