# boundfoxstudios.com

Fully static, prerendered, bilingual Angular site. German at `/`, English at `/en/`, both
produced by a single `ng build` and uploaded to Apache over FTP by GitHub Actions.

## Brand facts that are not negotiable

`#ffeb3b`, `#ffc107` and `#ffa726` never change. The orange kicker's contrast failure is a
documented deviation, not a bug to fix — `tools/a11y/run-axe.mjs` excludes it by name. The brand
name is `Boundfox Studios`, one word.

## Traps that have already cost time

- Removing `"server"` from `angular.json` silently disables prerendering. The build still
  exits 0 and ships an empty client-side shell.
- `ng serve` serves one locale flat at `/`. The `/en/` prefix and the language switcher can
  only be verified against a real build — `npm run preview`.
- Assets are duplicated per locale, so template asset paths must be relative. An absolute
  path makes `/en/` load the German copy.
- Tailwind v4's palette is wiped by `--color-*: initial`, so a mistyped utility produces no
  CSS and no error. That is what `eslint-plugin-better-tailwindcss` is for.
- Application code imports `./generated/github-data.json` and never anything under `tools/`.
  `process.env` has no esbuild shim and becomes a runtime `ReferenceError` in the browser.
- Link checkers built on `html5gum` (lychee, hyperlink) only ever see the `<head>` of a
  prerendered page. They stop at Angular's inline `ng-event-dispatch-contract` script,
  where `o<n.length` reads as the start of a tag, and then report every page as clean.
  That is why `check:links` runs linkinator.

## Conventions

Code style, testing, branches, commit messages and pull requests follow the general
conventions. In short: no comments that paraphrase code, no abbreviations in identifiers,
English code and commits, German only in translatable strings.
