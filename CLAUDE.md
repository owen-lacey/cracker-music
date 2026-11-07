# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

Analysis repo measuring how often specific notes and scale degrees occur across famous Christmas carols. The owner transcribes each carol by hand; the code tallies note and scale-degree frequency across the collection.

## Tooling

- Postlab is a local dev dependency, with its own Claude skill. Load that skill before any Postlab work and do not rely on memorised Postlab APIs.

## Layout

- `site/`: the blog post. Svelte 5 + Vite, TypeScript, plain scoped CSS.
- `transcriber/`: the React transcription prototype. It is not part of the blog post.
- `src/`: shared domain logic (carols, melody, pitch, usage, whistles) and Tone.js playback (`player`) used by `site/`, `transcriber/` and `analysis/`.
- `src/samples/<kind>/<midi>.mp3`: one recording per note for each instrument kind, played through `Tone.Sampler`. All are CC0, so the post needs no credits; `src/samples/CREDITS.md` lists every file's source and how it was edited.
- `site/components/`: blog components, each with a `*.stories.ts` for Storybook. Vite plugins shared by the blog and Storybook live in `site/vite.plugins.ts`; SVGs import inline as components via `?component`.
- `analysis/`: scripts run by post-lab code cells.

## Stack

pnpm, Vite, TypeScript, ESLint (complexity ≤ 10), Vitest, Storybook. Blog: Svelte, `@poppanator/sveltekit-svg`. Transcriber: React, Tailwind, `tonal` (degree → pitch), `tone` (playback).

## Commands

- `pnpm dev`: blog post dev server
- `pnpm build`: build the blog post to `dist/`
- `pnpm dev:transcriber`: transcription tool; a Vite middleware in `transcriber/vite.config.ts` reads/writes `data/carols/`
- `pnpm storybook`: Storybook on port 6006 for `site/` components; `pnpm build-storybook` builds it to `storybook-static/`
- `pnpm test`: unit tests
- `pnpm format`: Prettier (with `prettier-plugin-svelte`) over the repo; `data/` and `.post-lab/` are ignored
- `pnpm lint`: `prettier --check`, ESLint (including `svelte/valid-compile`), `tsc --noEmit` and `svelte-check`

## Transcription data

- `data/carols.json` is the single list of carols in the post: `title`, `tune?`, `included`. Code reads it through `carols` in `src/carols.ts`, which leaves out rows where `included` is false; the post-lab cell `c4r01s7a` shows it as a table.
- One file per carol: `data/carols/<slug>.json` with `title`, `tune?`, `melody`.
- `melody` is one token per 16th-note slot: `1`–`7` scale degree, `'`/`,` suffix for octave above/below, `#`/`b` prefix for sharp/flat, space for rest. No holds or bar lines.
- No key is stored: degrees are read against the major scale (a minor third is `b3`). Playback defaults to C major (middle-octave 1 = C4) at ♩ = 100. Instruments sound two octaves above that (`OCTAVE_SHIFT` in `src/player.ts`), at real cracker-toy pitch. Carol playback and the transcriber use the bell. The key and tempo sliders change playback only and are never saved.
- Parse with `parseMelody` (`src/melody.ts`); convert to MIDI with `midiFor` (`src/pitch.ts`).
