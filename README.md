# boundfoxstudios.com

Fully static, prerendered, bilingual Angular site. German at `/`, English at `/en/`, both
produced by a single `ng build` and uploaded to Apache over FTP by GitHub Actions.

Start with [`SPEC.md`](SPEC.md) for the architecture and [`docs/decisions.md`](docs/decisions.md)
for everything already decided.

## Requirements

Node.js as pinned in [`.nvmrc`](.nvmrc). `npm ci` installs the toolchain and, through
`postinstall`, the lefthook git hooks.

## Commands

| Command                | What it does                                                                |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm start`            | `ng serve` — the German locale at `http://localhost:4200/`                  |
| `npm run start:en`     | `ng serve --configuration=en` — the English locale, also served flat at `/` |
| `npm run preview`      | Build, then serve `dist/website/browser` at `http://localhost:4300/`        |
| `npm run build`        | `ng build` — both locales, fully prerendered, into `dist/website/browser`   |
| `npm run watch`        | Development build in watch mode                                             |
| `npm test`             | `ng test` (Vitest)                                                          |
| `npm run lint`         | ESLint over the whole repository                                            |
| `npm run format`       | `prettier --write .`                                                        |
| `npm run format:check` | `prettier --check .`                                                        |

## `ng serve` cannot show you the real site

`ng serve` silently disables localization and serves **one** locale flat at `/`. The `/en/`
prefix, the per-locale `<base href>` and the language switcher therefore do not exist under
either `npm start` or `npm run start:en`.

`npm run preview` is the only way to verify them: it runs a real build and serves the output
tree, so `http://localhost:4300/` and `http://localhost:4300/en/` behave exactly as they will in
production.

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
