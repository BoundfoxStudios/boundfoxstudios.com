# boundfoxstudios.com

Fully static, prerendered, bilingual Angular site. German at `/`, English at `/en/`, both
produced by a single `ng build` and uploaded to Apache over FTP by GitHub Actions.

## Requirements

Node.js as pinned in [`.nvmrc`](.nvmrc). `npm ci` installs the toolchain and, through
`postinstall`, the lefthook git hooks.

## Commands

| Command                       | What it does                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `npm start`                   | `ng serve` — the German locale at `http://localhost:4200/`                        |
| `npm run start:en`            | `ng serve --configuration=en` — the English locale, also served flat at `/`       |
| `npm run preview`             | Build both locales, then serve `dist/website/browser` at `http://localhost:4300/` |
| `npm run preview:de`          | Development build, then serve it — German verification while `/en/` is still red  |
| `npm run preview:draft`       | `build:draft`, then serve it — seeing `/en/` before the catalogue is complete     |
| `npm run fetch:github`        | Regenerate `projects/website/src/app/generated/github-data.json`                  |
| `npm run fonts:generate`      | Re-subset the four self-hosted web fonts into `public/fonts/`                     |
| `npm run images:generate`     | Re-generate the fox-head mark sizes into `public/images/`                         |
| `npm run images:crops`        | Re-generate the two Bug-A-Ball key-art crops into `public/images/`                |
| `npm run build`               | `ng build` — both locales, fully prerendered, into `dist/website/browser`         |
| `npm run build:draft`         | `ng build --i18n-missing-translation=warning` — both locales with source fallback |
| `npm run i18n:extract`        | `ng extract-i18n` — regenerate `messages.xlf` after adding a marked string        |
| `npm run i18n:check`          | Extract, fail on a dirty tree, then verify the catalogue — this is what CI runs   |
| `npm run generate:icons`      | Re-generate the favicon, app icons and `og/default.png` from `branding/icon.png`  |
| `npm run watch`               | Development build in watch mode                                                   |
| `npm test`                    | `ng test` plus the build-script tests (both Vitest)                               |
| `npm run verify:translations` | Every unit translated, in sync and placeholder-clean                              |
| `npm run check:viewports`     | Column counts and overflow at 320/768/1152/1440                                   |
| `npm run lint`                | ESLint over the whole repository                                                  |
| `npm run format`              | `prettier --write .`                                                              |
| `npm run format:check`        | `prettier --check .`                                                              |

## `ng serve` cannot show you the real site

`ng serve` silently disables localization and serves **one** locale flat at `/`. The `/en/`
prefix, the per-locale `<base href>` and the language switcher therefore do not exist under
either `npm start` or `npm run start:en`.

`npm run preview` is the only way to verify them: it runs a real build and serves the output
tree, so `http://localhost:4300/` and `http://localhost:4300/en/` behave exactly as they will in
production.

Until the English catalogue is complete, a plain build fails on the first untranslated string —
`angular.json` sets `i18nMissingTranslation: "error"` and never changes. Use `npm run preview:de`
for German-only verification, or `npm run preview:draft`, which builds both locales with the
German source as the fallback, when `/en/` itself has to be looked at.

## GitHub release data

`projects/website/src/app/generated/github-data.json` is committed. It is a development
snapshot so `ng serve` and offline builds work without a token — the `prebuild` hook refreshes
it locally, CI regenerates it before every build without committing it back, and the nightly
deploy keeps production current.

## Editor setup

`.vscode/extensions.json` recommends the Angular Language Service, Tailwind CSS IntelliSense,
Prettier and EditorConfig. `.vscode/settings.json` points Tailwind IntelliSense at
`projects/website/src/styles.css` — Tailwind v4 has no `tailwind.config.js`, so without that
setting the extension finds no theme and completes nothing.
