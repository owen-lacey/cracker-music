# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

Analysis repo measuring how often specific notes and scale degrees occur across famous Christmas carols. The owner transcribes each carol by hand; the code tallies note and scale-degree frequency across the collection.

## Tooling

- Postlab is a local dev dependency, with its own Claude skill. Load that skill before any Postlab work and do not rely on memorised Postlab APIs.

## Stack

pnpm, Vite, React, TypeScript, Tailwind, `tonal` (degree → pitch), `tone` (playback), ESLint (complexity ≤ 10), Vitest.

## Commands

- `pnpm dev`: transcription tool; a Vite middleware in `vite.config.ts` reads/writes `data/carols/`
- `pnpm test`: unit tests
- `pnpm lint`: ESLint plus `tsc --noEmit`

## Transcription data

- `data/carols.json` is the single list of carols in the post: `title`, `tune?`, `included`. Code reads it through `carols` in `src/carols.ts`, which leaves out rows where `included` is false; the post-lab cell `c4r01s7a` shows it as a table.
- One file per carol: `data/carols/<slug>.json` with `title`, `tune?`, `melody`.
- `melody` is one token per 16th-note slot: `1`–`7` scale degree, `'`/`,` suffix for octave above/below, `#`/`b` prefix for sharp/flat, space for rest. No holds or bar lines.
- No key is stored: degrees are read against the major scale (a minor third is `b3`). Playback defaults to C major (middle-octave 1 = C4) at ♩ = 100. The key and tempo sliders change playback only and are never saved.
- Parse with `parseMelody` (`src/melody.ts`); convert to MIDI with `midiFor` (`src/pitch.ts`).
