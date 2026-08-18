# boundfoxstudios.com

Fully static, prerendered, bilingual Angular site. German at `/`, English at `/en/`, both
produced by a single `ng build` and uploaded to Apache over FTP by GitHub Actions.

## Read before touching anything

1. [`SPEC.md`](../SPEC.md) — architecture, routes, boundaries, and the twelve decisions that
   shape the build (§12).
2. [`docs/decisions.md`](../docs/decisions.md) — every remaining decision, down to i18n ids,
   filenames, npm scripts and exact German strings. **This file answers questions instead of
   you inventing an answer.** Where it contradicts a design document, it wins; where it
   contradicts `SPEC.md`, `SPEC.md` wins unless the row says it corrects `SPEC.md`.
3. The `docs/design/*.md` reference for the page you are building — exact layout values and
   verbatim copy.
4. `docs/research/*.md` when you need the verified configuration behind a decision.

The work is tracked as GitHub issues on milestones M1–M10. Implement them in order; each issue
carries its own acceptance criteria and verification command.

## Do not re-decide

Every choice in `SPEC.md` §12 and `docs/decisions.md` is settled. If implementing an issue
seems to require a decision that is not written down, that is a gap in the documents — say so
and stop, rather than picking something and moving on.

Three brand facts that are not negotiable: `#ffeb3b`, `#ffc107` and `#ffa726` never change
(§10), the orange kicker's contrast failure is a documented deviation and not a bug to fix
(§11.6), and the brand name is `Boundfox Studios`, one word.

## Traps that have already cost time

- Removing `"server"` from `angular.json` silently disables prerendering. The build still
  exits 0 and ships an empty client-side shell (§3.1).
- `ng serve` serves one locale flat at `/`. The `/en/` prefix and the language switcher can
  only be verified against a real build — `npm run preview` (§3.1).
- Assets are duplicated per locale, so template asset paths must be relative. An absolute
  path makes `/en/` load the German copy (§3.1).
- Tailwind v4's palette is wiped by `--color-*: initial`, so a mistyped utility produces no
  CSS and no error. That is what `eslint-plugin-better-tailwindcss` is for (§7).
- Application code imports `./generated/github-data.json` and never anything under `tools/`.
  `process.env` has no esbuild shim and becomes a runtime `ReferenceError` in the browser
  (§3.2).

## Conventions

Code style, testing, branches, commit messages and pull requests follow the general
conventions plus `SPEC.md` §7–§10. In short: no comments that paraphrase code, no
abbreviations in identifiers, English code and commits, German only in translatable strings.
