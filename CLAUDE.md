# Pindrop Website

Astro 5 + Tailwind 4 static site for pindrop.dev, deployed on Vercel (auto-deploys on push).

## Commands

- `bun install` then `bun run dev` / `bun run build` / `bun run preview`
- No test suite; verify with a build plus a look at the affected pages.

## Design system ("the quiet room")

Defined in `src/styles/global.css`. Near-black stage lit by the Orb; the
amber→russet gradient lives *inside* the Orb artifact, never sprayed on the page.

- Colors follow the app's **default "Pindrop" theme preset** (see
  `pindrop/Pindrop/UI/Theme/ThemeModels.swift`), NOT the red-orange "Signal"
  preset: `night` #0A0A0F / `soot` #12121A (the app's dark grounds), `hearth`
  #1B1B26 (raised), `ink`/`ink-2`/`ink-3` (warm paper text), `ember` #C48A1E
  and `ember-bright` #F2B54A (the app's amber accent pair), `russet` #713413
  (the orb's rim). If the app's default theme changes, re-derive from the catalog.
- Type: **Sentient** (display serif, self-hosted from Fontshare) for headings and
  statements; **system-ui** for body/UI text; **Server Mono** strictly for genuine
  data (versions, dates, timestamps, engine names, sizes) via the `.data` class.
  Do not set labels, buttons, or headings in mono.
- Fonts are self-hosted: woff2 in `public/fonts/`, OTFs for satori OG rendering
  in `src/assets/fonts/`. No Google Fonts.
- Surfaces use tonal elevation (`.surface`, `.surface-high`): self-colored 1px
  border + inset top highlight, radius 10 to 14px. No pill buttons, no glows
  under buttons, no hover lifts on buttons (tonal color shifts only).
- Content is visible by default. Never gate text or controls behind
  IntersectionObserver/opacity-0 entrance animations. Typing/canvas effects must
  server-render their full content as fallback and respect
  `prefers-reduced-motion`.
- The logo is the app's ripple mark (`src/assets/pindrop-logo.svg`,
  `public/favicon.svg`), taken from
  `pindrop/Pindrop/Assets.xcassets/PindropIcon.imageset/logo-mark-template.svg`.
  Keep it in sync with the app if the mark changes.

## Key components

- `src/components/Orb.astro`: canvas blob custom element (`<pin-orb>`), breathes
  idle, exposes `setAudio(level)`. CSS-gradient fallback before JS upgrades.
- `src/components/HeroDictation.astro`: the landing hero. The headline types
  itself with tentative→committed styling and the Orb riding at the caret.
  (Deliberately no mic-input demo; it was removed on request. Don't reintroduce.)
- `src/utils/github.ts`: build-time cached fetches for latest release + stars.
- `src/utils/og.ts`: satori OG images (uses the OTF fonts, new palette).

## Content collections

- `src/content/blog/*.mdx`: posts (title, description, date, version?, tags?).
- `src/content/changelog/*.md`: one file per release, `v<X.Y.Z>.md` with
  `version` + `date` frontmatter, body is the release-notes markdown verbatim.
  **Do not hand-edit these**: they are synced from the app repo by
  `just sync-website-changelog <version>` (runs automatically inside
  `just release` over in the `pindrop` repo). The /changelog page renders all of
  them with per-version anchors (`/changelog#v1.22.0`).

## Conventions

- Dates in frontmatter are UTC; always format with `timeZone: 'UTC'`.
- No em dashes in prose copy; use a colon, comma, or split the sentence.
- New pages: wrap in `Layout` + `Header` + `Footer`, container pattern is
  outer `px-6` + inner `max-w-5xl mx-auto` (this keeps the nav and content on
  the same left axis; don't put the padding inside the max-width container).
