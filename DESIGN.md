# Design plan — Emmanuel Kiriinya portfolio

Written before implementation, per skills.md §49–50.

## The one memorable idea

**The banded cloth.**

The reference artwork builds its surface from parallel bands of saturated
colour, each band carrying one repeated motif, every shape outlined in black,
bands divided by thin gold rules. (The infinity shape it was painted on is
ignored, per the brief — the bandwork is the reference, not the symbol.)

Read one way that is West African strip-weaving. Read the other way it is a
categorical bar encoding: discrete segments, fixed width, meaning carried by
colour order. One motif, both readings. That coincidence only means something
for a data scientist with this visual heritage, which is what makes it this
portfolio's signature rather than borrowed ornament.

### Motif vocabulary

Taken directly from the artwork, not invented:

| Motif | In the reference |
|---|---|
| Rolled spiral | The curled scrolls through the orange and blue bands |
| Angular meander | The labyrinth fretwork in the green sections |
| Sawtooth | Rows of triangles, gold on red |
| Dot rows | Circles marching along a band |
| Concentric rings | Ringed eyes in the yellow band |
| Zigzag | Repeated V bands |
| Diamond lattice | The blue crosshatch |
| Scallop | Nested arcs |
| Stripe bundles | Thin parallel bars |
| Crosses | X marks between bands |

Spirals and meanders are weighted highest in the generator, because they are
the two shapes that make the artwork recognisable.

Every shape is outlined in black on a black ground — that outline is what makes
the palette read as painted cloth rather than as a chart.

It appears at exactly four weights:

| Weight | Where | Form |
|---|---|---|
| Full cloth | Hero panel | Generative SVG, 9 bands, staggered reveal |
| Band | Blog header, footer | Horizontal strip of the same cloth |
| Rule | Section headings | 13px ribbon, coarse motifs only |
| Mark | Logo, featured badge, quote | Lozenge carrying a single spiral |

Everything else stays quiet. Target ratio: 85% calm interface, 15% cloth.

Projects and articles with no cover image get a woven panel seeded from their
own id, so a missing image reads as intentional rather than as an empty box.

## Color

Two palettes, deliberately separated.

**Pigments** (`--pat-*`) are artwork only. They are the saturated colours of the
reference and are identical in light and dark themes, because they only ever
appear inside SVG bandwork where the black outline carries the contrast.

| Token | Value |
|---|---|
| `--pat-gold` | `#f5b426` |
| `--pat-amber` | `#f59b1c` |
| `--pat-orange` | `#ef7a22` |
| `--pat-red` | `#d62027` |
| `--pat-green` | `#0f9b4a` |
| `--pat-cyan` | `#29a8e0` |
| `--pat-royal` | `#2b5fbf` |
| `--pat-purple` | `#8b3a9e` |
| `--pat-ink` | `#0a0a0a` |

**Interface colours** shift per theme so text and borders stay legible. Never
use a pigment for text.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--bg` | `#0b0a0d` | `#faf7f2` | Base |
| `--surface` | `#15131a` | `#ffffff` | Cards, panels |
| `--text` | `#f4f0e9` | `#16141a` | Primary text |
| `--muted` | `#9b938e` | `#6b645f` | Metadata |
| `--gold` | `#f5b426` | `#b87710` | **Primary accent.** Links, CTAs |
| `--clay` | `#f07c22` | `#c9501c` | Secondary accent |

Assigned, used sparingly: `--indigo` interactive, `--palm` success and
verified credentials, `--plum` AI/deep-learning only, `--ember` destructive
and errors only.

## Type

Three families, three non-overlapping jobs. No family does two jobs.

- **Sora** — display and all UI. Geometric grotesque with an unusual
  double-storey `g` and flat-sided `a`. Technical without the Space-Grotesk
  cliché that marks every developer portfolio.
- **Newsreader** — long-form body only: blog articles, About prose. An
  editorial serif signals that the writing is meant to be read, not skimmed.
  Blog columns cap at 68ch, line-height 1.7.
- **JetBrains Mono** — code blocks and inline code only. Never for metadata,
  never for labels, never for decoration.

Scale is a fixed ramp (12 / 14 / 16 / 18 / 21 / 27 / 36 / 48 / 64 / 84), not
arbitrary sizes. Display sizes get `letter-spacing: -0.02em`; body gets none.

## Layout

**One sentence:** A left-aligned editorial grid where content sits on a strict
12-column rhythm and the weave occupies the margin — never behind the words.

```text
┌────────────────────────────────────────────────────────────────┐
│ EK ·  About  Experience  Projects  Blog  Certifications   ☾ [CV]│
├──────────────────────────────────────┬─────────────────────────┤
│                                      │  ▞▞▚▚  ▞▞▚▚  ▞▞▚▚       │
│  Emmanuel Kiriinya                   │  ▚▚▞▞  ▚▚▞▞  ▚▚▞▞       │
│                                      │  ▞▞▚▚  ▞▞▚▚  ▞▞▚▚       │
│  Data Scientist                      │   woven data strip      │
│  Machine learning · AI               │   (generative SVG,      │
│                                      │    9 bands, reveals     │
│  Two lines on what he actually       │    once on load)        │
│  builds and who it is for.           │                         │
│                                      │  ▞▞▚▚  ▞▞▚▚  ▞▞▚▚       │
│  [ View projects ]  [ View resume ]  │  ▚▚▞▞  ▚▚▞▞  ▚▚▞▞       │
├──────────────────────────────────────┴─────────────────────────┤
│ ▪▪▪▪ 3px weave rule                                            │
│ Selected work                                        All work →│
└────────────────────────────────────────────────────────────────┘
```

Alignment is left throughout. Nothing centers by default — centering is
reserved for the footer mark and empty states, where it means "this is
terminal, not a column of content."

Section headings sit flush left against a 3px weave rule that spans the
content width. That rule is the only repeated decorative element, and it does
structural work: it marks section boundaries in place of a card border.

## Component differentiation (§53)

Deliberately *not* uniform. Each earns its own treatment:

- **Project** — no card. Full-bleed row, 2-col on desktop: image left, text
  right, alternating. Radius 0 on the image, hairline rule below. Projects are
  the substance; they get editorial space, not a tile.
- **Blog preview** — text-forward, cover image small and square (96px), radius
  2px. Reads as an index entry.
- **Certification** — compact bordered tile, radius 6px, issuer logo 32px. These
  are credentials: dense, scannable, comparable. A card is correct here.
- **Testimonial** — no border at all. Large weave-lozenge quote mark, serif
  body, attribution beneath a hairline.
- **Skill** — icon + name chip in a marquee. Radius 999px.

Five different radii, five different borders, because five different jobs.

## Icons

No emoji anywhere. Emoji render differently on every platform, cannot be
styled, and read as decoration rather than interface.

- **Interface icons** are hand-written inline SVG in `components/ui/icons.tsx`
  — 24x24, 2px stroke, `currentColor`. No package, no network request, themes
  with everything else.
- **Technology logos** come from, in order of preference: **Devicon** (full
  colour, built for developer tooling), **Iconify's `logos` set** (brand logos
  Devicon lacks), and **Simple Icons** (monochrome, tinted to `--pat-gold`).
- Tools with no official mark anywhere (XGBoost, LightGBM) get a lettered tile
  in the brand colours. So does any icon that fails to load. Never a broken
  image, never a fallback emoji.

## Borrowed cues

Structural cues taken from the reference site Emmanuel built, adapted into this
palette rather than copied wholesale:

- Social links as bordered icon buttons instead of a text list.
- A category marker in a bordered square beside each project's metadata.
- Calendar and location icons on experience entries.
- A year badge in the corner of each certification card.
- External-link marks on every outbound action.

Deliberately **not** taken: its dark-navy ground with a single cyan accent
(§54 names that combination as a cliché to avoid, and it would erase the
cultural identity entirely), its centred headings throughout, and its uniform
rounded cards for every content type (§53).

## Motion

One orchestrated moment: the hero weave draws its bands in sequence over 900ms
on first load, then never again. Everything else is user-triggered — hover
lifts, menu slides, accordion expansion, carousel movement.

No scroll-triggered fade-up on every section. Under `prefers-reduced-motion`
the weave renders complete and the marquee stops.

## Review against §50

**1. Specific to Emmanuel?** Yes — the weave/bar-encoding equivalence only
means something for a data scientist with West African visual heritage. On a
SaaS site it would be meaningless ornament.

**2. Could a SaaS company use this unchanged?** No. The motif is load-bearing
and culturally specific, the serif body column is built for long technical
articles, and projects are laid out as case studies rather than feature tiles.

**3. Patterns intentional?** The four-weight system is a budget. Anything
outside those four weights gets cut in the final pass.

**4. Supports DS/AI content?** Code blocks, math, notebook links, methodology
and evaluation sections on project pages, a dedicated AI/LLM accent color.

**5. Blog readable?** Serif at 18px/1.7, 68ch column, no pattern within 200px
of body text, table of contents for long pieces.

**6. One idea, not many?** One: the woven data strip. Rejected during planning —
gradient meshes, floating dashboard cards, animated particle networks, a
"terminal" hero, and big stat counters. None said anything about this person.

**7. Avoids generated-template tells?** No all-caps eyebrows above every
heading, no middot-joined metadata strings, no arrow suffixed to every link,
no single border-radius applied mechanically, no monospace metadata.

### What was generic, and what changed

- **Was:** dark background with a single neon accent — the default "technical"
  look, and explicitly called out in §54.
  **Now:** a seven-color textile palette where gold leads and the rest are
  assigned to specific meanings.
- **Was:** every section as a grid of identical rounded cards.
  **Now:** five component families with different radii, borders, and density,
  each matched to whether the content is read, scanned, or compared.
- **Was:** Space Grotesk + Inter, the default developer-portfolio pairing.
  **Now:** Sora / Newsreader / JetBrains Mono, each with one job — and a serif
  body, because a third of this site is long-form writing.
