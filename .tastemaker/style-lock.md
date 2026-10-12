# Style lock — XUtil

Established: 2026-10-12. Source: generated palette (`generate_palette.py --mood technical --seed 4127`, light + dark from the same seed) + personal profile priors. No reference images were supplied.

## Palette (light)
- Background: #f7fdff (content canvas)
- Surface: #eaf3f8 (sidebar, topbar hover, panel headers, read-only output)
- Panel: #ffffff (inputs, cards on the canvas) — added at build time, verified: text/panel 17.30
- Primary: #057da0 (buttons, links, active nav edge, focus ring)
- Accent: #bd4c59 — reserved for errors and destructive state only
- Success: #1b7a4e — added at build time; 5.19 vs bg, 4.74 vs surface, 5.33 vs panel
- Text primary: #121c21 — contrast vs background: 16.85 (AA pass)
- Text muted: #4e5f67 — 6.48 vs bg, 5.92 vs surface, 6.65 vs panel
- Border: #d9e3e7 (hairlines, decorative) · Control border: #7f929a (input boundaries, 3.24 vs panel, UI-safe)
- Button label color: white — contrast vs Primary: 4.72
- Dark mode: runtime toggle — both modes ship, user-switchable. Companion palette below, from the same seed, matrix verified independently.

## Palette (dark)
- Background: #0e1518 · Surface: #192023 · Panel: #141b1e (text/panel 15.61)
- Primary: #0e80a3 (fills; white label 4.53) · Primary as text/link: #4fb3d6 (see matrix note)
- Accent: #ea757f (errors; 6.45 vs bg, 6.10 vs panel)
- Success: #4fc48b (8.43 vs bg, 7.97 vs panel)
- Text primary: #e6f5fb (16.52 vs bg) · Text muted: #95a7ae (7.39 vs bg, 6.98 vs panel)
- Border: #252c2f (decorative) · Control border: #5c6e75 (3.27 vs panel, UI-safe)

## Color contract
Light matrix (generate_palette.py, seed 4127):
- Text-safe (>=4.5): text/on-primary, text/bg, text/surface, text/border, accent/on-primary, primary/on-primary, bg/accent, bg/primary, plus build-time: muted/bg, muted/surface, muted/panel, success/bg, success/surface, success/panel, primary/panel (4.72), accent/panel (4.84)
- UI-safe (>=3.0 <4.5): surface/accent, surface/primary (4.20 — focus ring on surface is UI, fine; primary is NOT used as text on surface), accent/border, text/primary, primary/border, text/accent, control-border/panel (3.24)
- Decorative: border/on-primary, bg/border, surface/border, surface/on-primary, bg/surface, bg/on-primary, primary/accent
Dark matrix:
- Text-safe: bg/on-primary, text/bg, surface/on-primary, text/surface, border/on-primary, text/border, bg/accent, surface/accent, accent/border, primary/on-primary (4.53), plus build-time: muted/bg, muted/panel, success/bg, success/panel, accent/panel, primary-text(#4fb3d6)/panel, /bg, /surface
- UI-safe: bg/primary, text/primary, surface/primary, primary/border, control-border/panel (3.27)
- Decorative: accent/on-primary (so error badges in dark mode use accent as TEXT on a surface, never as a fill with a white label), text/accent, primary/accent, bg/border, surface/border, bg/surface, text/on-primary
Rule: primary (#0e80a3) is a fill colour in dark mode, not a text colour; links and primary-coloured text use #4fb3d6. Error state is accent-as-text + accent left edge, never accent fill, in both modes.

## Typography
- Display/heading font: Inter Variable (600) — switched from IBM Plex Sans on 2026-10-12 after Rohit found Plex hard to read at UI sizes; Inter's larger x-height and open apertures read better at 13–15px.
- Body font: Inter Variable (400/500), base size 15px
- Data font: IBM Plex Mono (400/500) — every copyable value, signatures, code. Never paragraphs.
- Scale: 12 / 13 / 14 / 15 (body) / 16 / 20 / 24 (page title). Index cards: 15px name, 14px blurb; never truncate a tool name. Headings get hierarchy from weight and spacing, not size.

## Density & spacing
- Base unit 4px. Shell: nav row 32px, 13px type. Content: panel padding 16px (space-4), gap between panels 24px (space-6), page padding 24px / 32px at lg. Internal <= external everywhere.
- Radius 6px on controls and panels, 4px on badges. No shadows except the command palette and dialogs (one soft shadow).

## Structure
- Screen class: App shell (every screen). Macrostructure/narrative-arc steps skipped by design; no `.tastemaker/log.json` because there is no marketing page to rotate.

## Reference intelligence
- Reference board: `.tastemaker/reference-board.md` (inferred, not viewed)
- Design read: developer-tool workbench for developers, mode Operate, with an instrument-panel lane
- Dials: variance 4, motion 3, density 8, art direction 5
- Foundation: existing repo stack (React 18 + Tailwind 3 + lucide-react). Dependency check: fuse.js, react-toastify, lucide already present; framer-motion, react-feather and the Condensed font removed as unused after the rebuild. No registry (shadcn) in this stack.
- Quality bar: it-tools, DevToys, transform.tools (inferred)
- Direction contract: see reference board
- Anti-references: hero-on-index, convert buttons for sync transforms, toasts for copy/clear

## Taste memory
- Profile priors used: (1) rejects sparse whitespace-led layouts -> dense index grid, side-by-side transforms; (2) don't occupy a lane one of Rohit's own sites owns -> no cream/serif; (3) React+Vite+Tailwind default stack.
- Decision log: `.tastemaker/decisions.log`
- Last resolved decisions: none yet (first lock)
- Pending review: sidebar shell, live-transform default, single-accent palette — all logged pending-review
- Profile promotion: none
- Memory precedence note: no conflicts; current request (usability-first rebuild) wins.

## Navigation chrome
- Sidebar background: Surface · Content area background: Background
- Active nav item treatment: transparent row, 2px Primary left border, text primary weight 500
- Inactive hover treatment: Background-on-Surface shift (row takes the canvas colour)
- Breadcrumb treatment: Text muted for parents, Text primary for current
- Shell density: 32px row height, 13px type in the sidebar

## Mood descriptors
instrument, quick, legible, unadorned

## Assets
- Anchor asset: `public/cog_light.svg` / `public/cog_dark.svg` — existing mark, preserved byte-for-byte
- Asset style: lucide outline icons, 1.5px stroke, 16px in controls and 18px in the topbar
- Illustration vs. photography split: none. A tool workbench has no section that a photo or illustration would serve; stating this rather than padding the UI.
- Illustration source used: none
- Logo: preserved existing cog mark; wordmark "XUtil" set in Plex Sans 600

## Motion
- Feel: quick and restrained
- Curves: `--ease-out: cubic-bezier(0.2, 0, 0, 1)`
- Durations: press 120ms, hover 120ms, dialog 160ms, panel/route 180ms
- Entrance duration/distance: 180ms, 6px rise, on route content mount only
- Screen tracks: app shell only (route mount, drawer slide, palette scale, inline copied-state). No scroll-driven motion anywhere.
- Frequency rules: copy/clear/typing never animate beyond a 120ms colour change; list rows do not animate while filtering.
- Reduced motion: all transitions and animations drop to 0.01ms; state is still conveyed by colour/text.
- Verified by: `scripts/audit_motion.py src` on 2026-10-12 — only MEDIUM `missing-reduced-motion` per-file notes, covered by the global `prefers-reduced-motion` rule in `src/index.css`; browser feel check same day at 1440px and 375px

## Do not
- No two-accent in/out colour coding (replaced by labels).
- No convert buttons on synchronous transforms.
- No toasts for copy or clear.
- No hero section on the index.
- No new UI dependencies for things `<dialog>`, `<details>` and CSS already do.
