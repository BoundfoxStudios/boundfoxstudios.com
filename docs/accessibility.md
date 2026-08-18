# Accessibility

## Focus ring

There is no focus-visible state anywhere in the design handoff, and no single ring colour works
across all four surfaces the site uses (SPEC §11.7). SPEC §12 **D3** resolves it with a
surface-scoped token instead of one colour:

```css
@layer base {
  :root {
    --focus-ring: #171717;
  }
}

@utility surface-dark {
  --focus-ring: #ffc107;
}

@utility focus-ring {
  &:focus-visible {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
  }
}
```

`focus-ring` goes on every interactive element; `surface-dark` goes on every dark band, tile or
chip — the header band, the footer band, the Socials tiles and the dark Support chips, which is
all four dark surfaces in the six pages. `--focus-ring` is a custom property, so it inherits: one
class on the band re-points every descendant at the amber ring.

`outline-offset: 2px` means the ring is drawn on the **surrounding** surface, not on the element.
That is why the brand gradient keeps the ink ring even though the five support pills on it are
white — the ring lands on the gradient.

### Measured contrast

Computed with the WCAG 2.1 relative-luminance formula. AA for a non-text UI component needs 3:1;
every pair clears it with room to spare.

| Ring      | Surface                     | Ratio     |
| --------- | --------------------------- | --------- |
| `#171717` | `#ffffff`                   | 17.93 : 1 |
| `#171717` | `#f5f5f5`                   | 16.44 : 1 |
| `#171717` | gradient, `#ffeb3b` end     | 14.68 : 1 |
| `#171717` | gradient, `#ffa726` end     | 9.23 : 1  |
| `#ffc107` | `#171717`                   | 11.00 : 1 |

For completeness, the two pairs D3 exists to avoid: `#ffc107` on `#ffeb3b` is 1.33 : 1 and on
`#ffa726` is 1.19 : 1. SPEC §11.7 and `docs/research/open-questions-audit.md` §9 quote "~1.1:1"
for that pair; the recomputed range is 1.19–1.33 : 1. The conclusion is unchanged — both are far
below 3:1 — so amber is never the ring on a light surface.

### Evidence

`docs/screenshots/focus/{white,neutral-100,ink,gradient}.png` — one per surface, captured against
the M2 design harness by `npm run screenshots:focus`
(`tools/capture-focus-screenshots.mjs`, Playwright + chromium). That script did more than
screenshot: it tabbed through all twelve interactive stops of the harness and asserted on each
that the element matched `:focus-visible` and that the computed outline was `2px` solid in the
surface's expected colour at `2px` offset, then clicked with the mouse and asserted that no ring
appeared.

The harness and the script were retired with the UI-primitives PR (#14), which is what
`docs/components.md` C16 requires; the four PNGs stay as the measured evidence. The four
surfaces still exist on the real pages — the header and footer bands, the Socials tiles and the
dark Support chips carry `surface-dark`, the home gradient band deliberately does not — so the
M8 accessibility-gates issue (#45) re-points the focus-ring assertions at those pages instead of
at a harness.

One thing that script had to learn, and any later one will too: Tailwind v4's `transition-colors`
includes `outline-color`. Immediately after focus the ring is still at `currentColor` and only
reaches `--focus-ring` after the 150 ms transition, so a measurement taken too early reads the
element's text colour instead of the ring colour.
