# Roadmap

The main goal right now is **new adventurer creation** under the RuneQuest: Roleplaying in Glorantha core rules.
The architecture follows Shadowrun Awakening:
- game data lives in `src/data`
- tunable rule numbers live in `src/engine/rules.ts`
- each creation step has its own component

## Phase 1: Player creation (done)
- [x] All eight creation steps, checked against the core rulebook
- [ ] Optional family history roller (needs event summaries written in our own words)
- [ ] Popover details for spells and items (descriptions in our own words)
- [ ] The gaps listed in [VERIFY.md](VERIFY.md)

## Phase 2: GM mode and quick NPCs
- **Free build:** type characteristics and skills directly, with sanity checks only.
- **Quick templates:** typical warriors, priests and shamans, plus non-human species (trolls, ducks, elves, dwarfs, Praxian beasts).
- **Compact stat block** for encounters.

## Phase 3: Adventurers in play
- Experience checks and seasonal skill improvement, POW gain rolls, training and research.
- Rune point tracking and reusability, worship.
- Becoming a Rune Priest or Rune Lord; Heroquesting notes.

## Phase 4: Integrations
- Export to the Foundry VTT RuneQuest system.
- Shareable read-only adventurer links.

## Contributing
Data fixes are the easiest way to help: correct a number in `src/data/`, change `source: 'unverified'` to `'wiki'`
(or cite the book page), and open a pull request. Please don't paste rulebook text.
