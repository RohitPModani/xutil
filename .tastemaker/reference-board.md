# Reference board

Created: 2026-10-12
Mode: Operate
Design read: developer-tool workbench for working developers, mode Operate, with an "instrument panel" lane (dense, bordered, mono-for-data, one accent), dials variance 4, motion 3, density 8, art direction 5.
Status: inferred, not viewed. No live browsing was done for this board; the sources below are named from prior knowledge of the category.

## Quality bar
- it-tools (it-tools.tech): persistent sidebar of ~80 tools, search-first, every tool a single dense panel. Sets the bar for "switch tools without going home".
- DevToys (desktop): tool list on the left, input-above-output or side-by-side, live conversion as you type. Sets the bar for zero-click transforms.
- transform.tools: one input pane, one output pane, convert on keystroke. Sets the bar for the transform layout.
- Linear / Raycast command palettes: ⌘K from anywhere, arrow keys, enter. Sets the bar for keyboard reach.

## Borrow
- Palette/material: generated technical palette (seed 4127) -> one teal primary for interactive state, red accent reserved for errors, otherwise neutral surfaces. No category colour coding.
- Type/hierarchy: IBM Plex Sans for UI, Plex Mono for every value a person might copy. Headings barely larger than body; hierarchy from weight and spacing, not size.
- Layout/composition: sidebar + topbar + content canvas; tool page = one panel per job, input and output side by side at desktop width, stacked on phones.
- Motion/interaction: 180ms fade-and-rise on content mount, dialog scale 0.97->1, inline "Copied" swaps; nothing scroll-driven.
- Asset language: lucide outline icons, 1.5px stroke, one set only. Existing cog mark preserved as the logo.

## Avoid
- The current build's two-accent (amber in / teal out) encoding: clever, but unconventional for users and it spent colour on something a label already says.
- Marketing hero on the index. The index is a work surface, not a pitch.
- Fake loading spinners on synchronous transforms; "Convert" buttons where the result can simply appear.
- Toasts for routine actions (copy, clear). Feedback belongs inline, next to the control.
- Cream background + serif display (already owned by one of Rohit's other sites).
- Purple-to-blue gradients, glassmorphism, emoji as icons, rounded-full buttons.

## Direction contract
- Thesis: 63 tools feel like one instrument. Any tool is two keystrokes away, every transform is live, every result is one click to copy.
- First viewport (index): search box, recent tools, then the full categorised grid, all visible without scrolling on a laptop.
- First viewport (tool): breadcrumb, title + signature, the input, and the output, nothing else above the fold.
- System: tokens in `src/index.css`, primitives in `src/ui/`, registry in `src/data/tools.ts`, frame in `src/components/`.
- Risk: density tipping into clutter. Guard: one panel per job, section rhythm fixed by tokens, no decoration.
