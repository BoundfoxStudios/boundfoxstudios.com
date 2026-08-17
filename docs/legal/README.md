# Legal texts

| File | Role |
|---|---|
| `imprint.source.md` | The imprint exactly as Manu supplied it on 2026-08-17. Archival. |
| `privacy-policy.source.html` | The privacy policy exactly as supplied. Archival, never edited. |
| `privacy-policy.final.html` | What ships. Derived mechanically from the source — see below. |

The imprint has no `.final` file: nothing was removed, so the source text is what ships.

## What changed, and why

The privacy policy came out of a generator and described the old WordPress site. Three things
were removed, all confirmed by Manu:

| Removed | Reason |
|---|---|
| Section 6 — Matomo | The site runs no analytics and sets no cookie (SPEC §12 D11). The section declared Matomo cookies and IP transfer, while the home page promises "Kein Tracking, keine Cookies". |
| Section 7 — YouTube | YouTube is linked from the footer, the Socials page and the Support page; it is never embedded. No data reaches Google on page load, so the section described a transfer that does not happen. |
| `Tel.: 0151123123123` in section 2 | Thirteen digits, and the imprint deliberately states "Telefon: wegen Spam-Anrufen entfernt". |

Sections 8–12 were renumbered to 6–10. Nothing else was touched. The derivation runs from the
source file and asserts its own result, so the remaining wording is provably unchanged.

**"Manuel Rauber" throughout is correct and stays.** The sole proprietorship is the responsible
party under the GDPR; "Boundfox Studios" is the public brand. Official positions need the legal
name.

## This supersedes the design handoff

`docs/design/privacy.md` describes a six-section draft (Verantwortlicher · Das Wichtigste vorab ·
Hosting & Server-Logfiles · Externe Links · Kontakt per E-Mail · Deine Rechte) written by the
designer as a placeholder. **That content is dead.** The supplied text has ten sections and about
3,600 words.

What survives from `docs/design/privacy.md` is the **layout only**: the 760px column, the
`64px 24px 72px` padding, the Bebas H1 at `clamp(40px, 5.5vw, 60px)`, H2 at 24px with `mt-10`,
and Barlow body at 16px/1.625. The privacy page is now long enough that the typographic rhythm
matters more than it did for the draft.

Three consequences for the backlog:

- The `privacy.draft-badge` unit stays dropped — the text is final, not a draft.
- `privacy.essentials.body` and `privacy.hosting.body` from `docs/decisions.md` describe the dead
  draft and do not exist any more.
- The reconciliation issue no longer rewrites the public text. Cloudflare and the hosting provider
  are **not** named in the shipped policy, because the instruction was to take the supplied
  wording verbatim. The processor record stays an internal document.

## How the text is marked for translation

**The legal prose carries no `i18n` attribute at all.**

SPEC §12 D10 serves the German text under `/en/` with an English notice. Marking roughly 90 units
and then copying each one byte-identically into `messages.en.xlf` would add ninety chances to
introduce a difference between two texts that must stay identical, and `ng extract-i18n` would
rewrite them on every run. Unmarked content renders the same in both locales by construction.

Only the page furniture is marked, because it genuinely differs per locale:

| id | Purpose |
|---|---|
| `privacy.title` / `imprint.title` | The H1 |
| `legal.german-only-notice` | The line stating that only the German version is binding, rendered outside `de` |
| `privacy.last-updated` | The "Stand: …" line |
| `seo.privacy-policy.*` / `seo.legal-details-imprint.*` | Title and meta description |

The prose sits inside a wrapper carrying `lang="de"` on the English page, so assistive technology
and search engines are told which language they are reading. That wrapper is the reason the
notice must render *outside* it.

## Flagged for Manu, not blocking

The imprint cites **§ 5 TMG** and **§§ 8 bis 10 des Telemediengesetzes (TMG)**. The provider
identification duty moved to the Digitale-Dienste-Gesetz on 14 May 2024; the current citations are
§ 5 DDG and §§ 7–10 DDG. The design handoff already used DDG. The supplied wording ships as-is
until Manu says otherwise — this is recorded so the discrepancy is a decision, not an oversight.
