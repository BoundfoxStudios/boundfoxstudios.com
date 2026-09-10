# boundfoxstudios.com

Fully static, prerendered, bilingual Angular site. German at `/`, English at `/en/`, both
produced by a single `ng build`, finished by `npm run postbuild` and published by GitHub Actions
to the `deployment/production` branch, which Plesk on Netcup pulls onto the Apache host.

## Requirements

Node.js as pinned in [`.nvmrc`](.nvmrc). `npm ci` installs the toolchain and, through
`postinstall`, the lefthook git hooks.

## Commands

| Command                       | What it does                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `npm start`                   | `ng serve` — the German locale at `http://localhost:4200/`                        |
| `npm run start:en`            | `ng serve --configuration=en` — the English locale, also served flat at `/`       |
| `npm run preview`             | Build both locales, then serve `dist/website/browser` at `http://localhost:4300/` |
| `npm run preview:de`          | Development build, German locale only, then serve it                              |
| `npm run preview:draft`       | `build:draft`, then serve it: `/en/` even when a unit is untranslated             |
| `npm run fetch:github`        | Regenerate `projects/website/src/app/generated/github-data.json`                  |
| `npm run fonts:generate`      | Re-subset the four self-hosted web fonts into `public/fonts/`                     |
| `npm run images:generate`     | Re-generate the fox-head mark sizes into `public/images/`                         |
| `npm run images:crops`        | Re-generate the two Bug-A-Ball key-art crops into `public/images/`                |
| `npm run build`               | `prebuild`, `ng build`, `postbuild`: both locales into `dist/website/browser`     |
| `npm run build:draft`         | `ng build --i18n-missing-translation=warning` — both locales with source fallback |
| `npm run i18n:extract`        | `ng extract-i18n` — regenerate `messages.xlf` after adding a marked string        |
| `npm run i18n:check`          | Extract, fail on a dirty tree, then verify the catalogue — this is what CI runs   |
| `npm run generate:icons`      | Re-generate the favicon, app icons and `og/default.png` from `branding/`          |
| `npm run watch`               | Development build in watch mode                                                   |
| `npm test`                    | `ng test` plus the build-script tests (both Vitest)                               |
| `npm run verify:translations` | Every unit translated, in sync and placeholder-clean                              |
| `npm run check:viewports`     | Column counts and overflow at 320/768/1152/1440                                   |
| `npm run lint`                | ESLint over the whole repository                                                  |
| `npm run format`              | `prettier --write .`                                                              |
| `npm run format:check`        | `prettier --check .`                                                              |

## `ng serve` cannot show you the real site

`ng serve` builds **one** locale and serves it flat at `/`, with its translations applied:
German under `npm start`, English under `npm run start:en`. What no dev server produces is the
two-locale tree, so the `/en/` prefix, the per-locale `<base href>` and the language switcher do
not exist under either.

`npm run preview` is what verifies them: it runs a real build and serves the output tree, so
`http://localhost:4300/` and `http://localhost:4300/en/` are the real two-locale output.

A build fails on the first untranslated string: `angular.json` sets
`i18nMissingTranslation: "error"` and never changes, so a newly marked string breaks the build
until it is translated. Use `npm run preview:de` for German-only verification, or
`npm run preview:draft`, which builds both locales with the German source as the fallback, when
`/en/` itself has to be looked at.

## GitHub release data

`projects/website/src/app/generated/github-data.json` is committed. It is a development
snapshot so `ng serve` works without a token; every `npm run build` refreshes it first through
the `prebuild` hook, so a failed fetch aborts the build. CI regenerates it without committing it
back, and the nightly deploy keeps production current.
