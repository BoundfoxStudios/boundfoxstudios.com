## RECOMMENDATION
All versions below were looked up live (`npm view <pkg> version`, GitHub Releases API) on 2026-08-17. Nothing is guessed.

# 0. package.json changes

```jsonc
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "postinstall": "lefthook install"
  },
  "devDependencies": {
    "@commitlint/cli": "^21.2.2",
    "@commitlint/config-conventional": "^21.2.2",
    "@eslint/js": "^10.0.1",
    "angular-eslint": "22.1.0",
    "eslint": "^10.8.1",
    "eslint-config-prettier": "~10.1.8",
    "lefthook": "^2.1.10",
    "prettier-plugin-css-order": "~2.2.0",
    "prettier-plugin-organize-attributes": "~1.0.0",
    "prettier-plugin-tailwindcss": "~0.8.1",
    "typescript-eslint": "8.67.0"
  },
  "allowScripts": {
    "@parcel/watcher": true,
    "esbuild": true,
    "fsevents": true,
    "lefthook": true,
    "lmdb": true,
    "msgpackr-extract": true
  }
}
```

`allowScripts` is derived from the lockfile, not copied: `node -e "..."` over `package-lock.json` shows exactly five packages with `hasInstallScript` (esbuild 0.28.2, @parcel/watcher 2.6.0, fsevents 2.3.3, lmdb 3.5.6, msgpackr-extract 3.0.4). `lefthook` is the sixth, added by this change. **Do not copy lehrgrapht's `@azure/msal-*`, `@microsoft/m365agentstoolkit-cli`, `keytar` entries** — those are Office-add-in-only. Note the repo currently runs npm 11.19.0 while `packageManager` pins `npm@12.0.2`; under 11.x `allowScripts` is advisory (unreviewed scripts still run, but are summarised), under 12 it becomes a hard block.

Also: **`prefix` in `angular.json` must change from `app` to `bfs`**, and `app.ts`'s selector `app-root` must become `bfs-root` (plus `<bfs-root></bfs-root>` in `src/index.html`) — otherwise the new selector rule fails on the very first lint run.

```jsonc
// angular.json (excerpt)
"website": {
  "projectType": "application",
  "root": "projects/website",
  "sourceRoot": "projects/website/src",
  "prefix": "bfs",
  "architect": {
    "lint": {
      "builder": "@angular-eslint/builder:lint",
      "options": {
        "lintFilePatterns": [
          "projects/website/**/*.ts",
          "projects/website/**/*.html"
        ]
      }
    }
  }
}
```
(Leaner alternative: skip the builder target entirely and use `"lint": "eslint ."`. The builder exists mainly for multi-project workspaces; with one project it buys nothing. I keep it above only for house-style parity with lehrgrapht.)

---

# 1. `eslint.config.mjs`

```js
// @ts-check
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '.angular/**',
    'dist/**',
    // Not an Angular template: `prefer-self-closing-tags` would rewrite
    // <bfs-root></bfs-root> to <bfs-root />, which the HTML parser mis-nests.
    'projects/website/src/index.html',
  ]),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsRecommended,
      eslintConfigPrettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'bfs', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'bfs', style: 'camelCase' },
      ],
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-arrow-callback': 'error',
      curly: 'error',
      'no-redeclare': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'warn',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
]);
```

**Why `defineConfig` and not `tseslint.config` (which lehrgrapht uses):** typescript-eslint's own docs now mark `tseslint.config(...)` **deprecated in favour of ESLint core's `defineConfig(...)`**, and angular-eslint 22.1.0's `ng add` schematic (`packages/angular-eslint/src/dist/utils.js`, `createStringifiedRootESLintConfig`) emits `defineConfig` too. The one semantic difference: in `tseslint.config`, an outer `files` **overrides** the extended config's `files`; in `defineConfig` it **intersects**. That is safe here because `angular.configs.ts-base` and `template-base` (verified at tag v22.1.0) declare no `files` of their own. If you prefer to stay byte-identical with lehrgrapht, `tseslint.config(...)` with `...` spreads still works with eslint 10 — it is deprecated, not removed.

Two other deltas from lehrgrapht worth taking: `eslint-config-prettier/flat` (adds a `name` for the config inspector; the bare entry point is the eslintrc-shaped one), and dropping `eslintConfigPrettier` from the **HTML** block — it turns off core/TS *formatting* rules and knows nothing about `@angular-eslint/template/*`, so it is a pure no-op there. Also drop lehrgrapht's `brace-style` and `'id-blacklist': 'off'`: `brace-style` was removed from ESLint core in v9 (it lives in `@stylistic`) and is a formatting rule that prettier owns anyway; `id-blacklist` was removed too.

**angular-eslint accessibility rules — the complete picture (verified against tag v22.1.0):**

`angular.configs.templateAccessibility` enables exactly 11 rules, all as `error`:
`alt-text`, `click-events-have-key-events`, `elements-content`, `interactive-supports-focus`, `label-has-associated-control`, `mouse-events-have-key-events`, `no-autofocus`, `no-distracting-elements`, `role-has-required-aria`, `table-scope`, `valid-aria`.

`angular.configs.templateRecommended` enables only 4: `banana-in-box`, `eqeqeq`, `no-negated-async`, `prefer-control-flow`.

The plugin ships 41 template rules in total. The a11y-relevant ones **not** in the accessibility preset, and my call on each:
- `no-positive-tabindex` — **enable** (`error`). Genuine a11y rule, surprisingly absent from the preset; positive tabindex breaks focus order on a marketing site.
- `button-has-type` — **enable** (`error`). Prevents accidental `type=submit` semantics.
- `prefer-ngsrc` — **enable as `warn`**. It is an LCP/perf rule (pushes `NgOptimizedImage`), not a11y; as `warn` it flags images without blocking until `NgOptimizedImage` is actually wired up.
- `no-inline-styles` — skip. Not a11y; would fight legitimate one-off `[style.--x]` custom-property bindings, and Tailwind covers the rest.
- `i18n` — **do not enable**. Single-language site; this rule is pure noise unless you actually ship `$localize`.
- `use-track-by-function` — **do not enable**. Obsolete for new code: `@for` requires `track` syntactically.
- `attributes-order` — **must stay off** (it is off by default). `prettier-plugin-organize-attributes` owns attribute ordering; enabling both gives you two fixers fighting over the same bytes.
- `conditional-complexity` / `cyclomatic-complexity` / `no-call-expression` — skip. Opinionated, and with signals + zoneless the `no-call-expression` perf argument is much weaker.

---

# 2. `lefthook.yml`

```yaml
# Jobs run sequentially on purpose: eslint --fix and prettier --write touch the
# same files, and `parallel: true` lets one overwrite the other's result.
pre-commit:
  skip:
    - merge
    - rebase
  jobs:
    - name: Lint
      glob:
        - '*.ts'
        - '*.html'
      run: npx eslint --fix --no-warn-ignored {staged_files}
      stage_fixed: true

    - name: Format staged files
      run: npx prettier --write --ignore-unknown {staged_files}
      stage_fixed: true

commit-msg:
  jobs:
    - name: Lint commit message
      run: npx commitlint --edit {1}
```

Three deliberate changes vs lehrgrapht's file:
1. **No `parallel: true`.** lehrgrapht runs prettier and eslint concurrently over overlapping file sets; both write to disk and both `stage_fixed`. That is a real lost-update race on any `.ts` file. Sequential also gives the right precedence: eslint fixes code, prettier has the final word on formatting.
2. **eslint also globs `*.html`.** Angular 20+ dropped the `.component.html` infix (this repo has `app.html`), and the template rules only run if HTML reaches eslint.
3. **`--no-warn-ignored`.** Without it, committing `src/index.html` (globally ignored above) prints a warning; with `--max-warnings 0` in CI it would be an error.

**Should tests run on pre-push? No.** Concrete reasons, not taste: (a) the repo has exactly one spec (`projects/website/src/app/app.spec.ts`) that asserts the app boots — a green run proves the harness works, not that the site does, so the hook's information value is ~zero; (b) `@angular/build:unit-test` has to do a full esbuild pass before vitest starts, so you pay 15–30s on every push for that zero; (c) hooks you learn to `--no-verify` past are worse than no hooks; (d) `main` is protected and deploys only after CI, so a broken test can never reach production via push. Put `ng test` in `ci.yml` as a required check instead. Revisit pre-push when there is a suite whose failure would actually tell you something — and even then prefer `pre-push` running only tests affected by the pushed range, not the whole suite. (`watch` defaults to false in non-TTY, so plain `ng test` is correct in CI; no `--watch=false` needed.)

---

# 3. `commitlint.config.mjs`

```js
export default {
  extends: ['@commitlint/config-conventional'],
};
```

`.mjs` is required: `package.json` has no `"type": "module"`, so a `.js` config would be parsed as CommonJS. No `scope-enum` — the general conventions say scopes are only used when the repo defines them, and this repo has one project.

---

# 4. `.prettierrc` and `.prettierignore`

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all",
  "arrowParens": "avoid",
  "bracketSameLine": false,
  "semi": true,
  "singleAttributePerLine": true,
  "quoteProps": "as-needed",
  "cssDeclarationSorterKeepOverrides": false,
  "tailwindStylesheet": "./projects/website/src/styles.css",
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "angular"
      }
    }
  ],
  "plugins": [
    "prettier-plugin-organize-attributes",
    "prettier-plugin-css-order",
    "prettier-plugin-tailwindcss"
  ]
}
```

```gitignore
# .prettierignore
/dist
/.angular
package-lock.json
```

**What `prettier-plugin-organize-attributes` needs for Angular templates: nothing — but only because of the `*.html` → `parser: angular` override you already have.** I read the plugin source (v1.0.0, `src/index.ts`): when `attributeGroups` is empty it picks the preset from `options.parser.toString().toLowerCase()` — `angular` → `$ANGULAR`, `vue` → `$VUE`, anything else → `$HTML`. It keys off the **parser, not the filename**. Prettier only auto-assigns the `angular` parser to `*.component.html`, and Angular 20+ no longer generates that name (`app.html`), so without your override every template would silently get the two-rule `$HTML` preset (class, id) instead of the nine-rule `$ANGULAR` one. Keeping the override is load-bearing. If you want it explicit and parser-independent, add `"attributeGroups": ["$ANGULAR"]` — the `$ANGULAR` group expands to `class, id, #ref, *structural, @animation, [@animationInput], [(twoWay)], [input], (output)`, everything else appended last.

**Does `prettier-plugin-tailwindcss` work with Tailwind v4 in Angular? Yes, with two conditions.** (1) v4 has no `tailwind.config.js`, so you **must** set `tailwindStylesheet` pointing at the CSS entry that contains `@import 'tailwindcss'` — here `projects/website/src/styles.css`; paths resolve relative to the prettier config file, which is why the path is repo-root-relative. (2) It **must be last in `plugins`**: its README states the compatibility shims for other plugins only work when it loads last, and it declares `prettier-plugin-organize-attributes` and `prettier-plugin-css-order` as explicit optional peers — i.e. this exact three-plugin stack is a supported combination, not a lucky accident. It sorts `class`, `[ngClass]`, and `@apply` out of the box. Known blind spots in Angular: class strings in `host: { class: '...' }` decorator metadata and in `.ts` signals/computed are not sorted unless you route them through `tailwindFunctions` (e.g. `"tailwindFunctions": ["tw"]`, which is why lehrgrapht has that line — only add it if you actually introduce a `tw` tag).

`cssDeclarationSorterKeepOverrides: false` is the plugin's own recommendation for a new codebase (its default is `true`); default order is `concentric-css`.

---

# 5. Stylelint: **no.**

Clear no, for this repo, today:
- There are two CSS files: `styles.css` (`@import 'tailwindcss';` and a comment) and `app.css`. Every styling decision lives as utility classes in templates. A linter that cannot see templates cannot see your styling.
- `stylelint-config-standard` actively fights Tailwind v4: `at-rule-no-unknown` fires on `@theme`, `@utility`, `@custom-variant`, `@variant`, `@source`, `@plugin`, `@reference`, `@apply`. You would maintain a hand-written `ignoreAtRules` allowlist that goes stale every time Tailwind adds an at-rule, or take on `stylelint-config-tailwindcss`, which lags upstream.
- The formatting/ordering job is already done: prettier (postcss parser) + `prettier-plugin-css-order`. Stylelint would duplicate it and you'd need `stylelint-config-prettier`-style conflict management on top.
- The failure mode Tailwind v4 actually has is a **typo'd utility class in a template**, which Tailwind silently drops and stylelint structurally cannot detect.

Revisit only if a real `@layer components` / large `@theme` block appears. Then: `stylelint@17.14.1` + `stylelint-config-standard@40.0.0` + an `at-rule-no-unknown` ignore list — and wire it into the same lefthook `pre-commit` job with `glob: '*.css'`.

---

# 6. GitHub Actions

Versions from `api.github.com/repos/<repo>/releases/latest`: **actions/checkout v7.0.1**, **actions/setup-node v7.0.0**, **SamKirkland/FTP-Deploy-Action v4.4.0** (latest tag overall too), OWASP/cve-lite-cli v1.29.0 (`@v1` floating major is fine — the action self-warns when a new major appears). Note lehrgrapht is one major behind on checkout and setup-node.

### `.github/actions/read-node-version-from-nvmrc/action.yml`

```yaml
name: Node.js version
description: Reads the Node.js version from .nvmrc
outputs:
  version:
    description: The Node.js version
    value: ${{ steps.version.outputs.version }}

runs:
  using: composite
  steps:
    - name: Read Node.js version from .nvmrc
      id: version
      shell: bash
      run: echo "version=$(tr -cd '[:digit:].' < .nvmrc)" >> "$GITHUB_OUTPUT"
```

Two fixes over lehrgrapht's copy: the character class is **quoted** (unquoted `[:digit:].` is a shell glob and can expand against a stray file named `d`, `g`, `i`, `t`, `:` or `.` in the repo root), and `cat x | tr` collapses to a redirect. Output for this repo's `.nvmrc` (`v26.3.0`) is `26.3.0`.

### `.github/actions/prepare-node/action.yml`

```yaml
name: Prepare node
description: Sets up Node.js with npm caching and installs dependencies.
inputs:
  version:
    description: The Node.js version to set up.
    required: true
  run-install:
    description: Whether to run npm ci or not.
    default: 'true'

runs:
  using: composite
  steps:
    - name: Setup Node ${{ inputs.version }}
      uses: actions/setup-node@v7
      with:
        node-version: ${{ inputs.version }}
        cache: npm
        cache-dependency-path: package-lock.json

    - name: Install dependencies
      if: inputs.run-install == 'true'
      shell: bash
      run: npm ci
```

Worth knowing: `actions/setup-node` supports `node-version-file: .nvmrc` natively (it strips the `v`), so `prepare-node` does not strictly need the `version` input. Keep the composite pair anyway — `read-node-version-from-nvmrc` is still required because `OWASP/cve-lite-cli` takes a plain `node-version` string, and keeping both repos structurally identical is worth more than saving one step.

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches:
      - develop
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  cve-check:
    name: CVE check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: ./.github/actions/read-node-version-from-nvmrc
        id: node-version
      - uses: OWASP/cve-lite-cli@v1
        with:
          node-version: ${{ steps.node-version.outputs.version }}
          fail-on: 'critical'
          verbose: 'true'

  lint:
    name: Lint & format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: ./.github/actions/read-node-version-from-nvmrc
        id: node-version
      - uses: ./.github/actions/prepare-node
        with:
          version: ${{ steps.node-version.outputs.version }}
      - run: npm run format:check
      - run: npm run lint

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: ./.github/actions/read-node-version-from-nvmrc
        id: node-version
      - uses: ./.github/actions/prepare-node
        with:
          version: ${{ steps.node-version.outputs.version }}
      - run: npm test

  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: ./.github/actions/read-node-version-from-nvmrc
        id: node-version
      - uses: ./.github/actions/prepare-node
        with:
          version: ${{ steps.node-version.outputs.version }}
      - run: npm run build
```

**On "typecheck" as a separate job: don't add one.** For Angular there is no meaningful `tsc --noEmit` step — plain `tsc` will not type-check templates, and `strictTemplates` is where the interesting errors are. `ng build` runs the AOT compiler and *is* the typecheck. Adding `tsc -b --noEmit` would be a slower, weaker duplicate. (Also: `strictTemplates` needs no entry in `tsconfig.json` — I read `packages/compiler-cli/src/ngtsc/core/src/compiler.ts`, where it is `this.options.strictTemplates !== false`, i.e. **on by default**. Likewise `strict: true` is now the TypeScript 6.0 default. The current tsconfig is already strict; don't cargo-cult those two lines in.)

Four jobs each pay their own `npm ci` (~30–45s cached). If you'd rather have one required check and one install, collapse `lint`/`test`/`build` into a single job with three steps — the tradeoff is that a lint failure then masks a build failure. For a solo site I'd take the four jobs; parallel wall-clock is better and the required-status-check list is more legible.

### `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches:
      - main
  schedule:
    - cron: '0 3 * * *'
  workflow_dispatch:

# Never cancel a deploy in flight: FTP-Deploy-Action would leave the server
# half-updated and its sync-state file inconsistent with what is on disk.
concurrency:
  group: deploy-production
  cancel-in-progress: false

permissions:
  contents: read

jobs:
  deploy:
    name: Build & deploy
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://www.boundfoxstudios.com
    steps:
      - uses: actions/checkout@v7
        with:
          ref: main

      - uses: ./.github/actions/read-node-version-from-nvmrc
        id: node-version

      - uses: ./.github/actions/prepare-node
        with:
          version: ${{ steps.node-version.outputs.version }}

      - run: npm run build

      - uses: SamKirkland/FTP-Deploy-Action@v4.4.0
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          protocol: ftps
          local-dir: dist/website/browser/
          server-dir: /
          log-level: minimal
```

Deliberate choices:
- **`protocol: ftps`, not `ftp`.** lehrgrapht uses plain `ftp`, which sends the password and the whole site in cleartext. Use `ftps` (explicit TLS on port 21); fall back to `ftps-legacy` only if the host is implicit-TLS-on-990.
- **`ref: main` on checkout is mandatory, not decoration.** Scheduled runs check out the *default* branch. If `develop` is the default branch (which the "PRs into develop" flow implies), the cron would otherwise build and ship `develop` to production. Related gotcha: `schedule` triggers only fire for the workflow file **as it exists on the default branch** — so `deploy.yml` must be merged into `develop` too, or the cron never runs.
- **`concurrency` without `cancel-in-progress`.** Also note lehrgrapht's `group: ${{ github.workflow }}-${{ github.head_ref }}` is subtly broken: on `push`/`schedule` events `github.head_ref` is empty, so every non-PR run shares one group and cancels the previous one mid-upload.
- **`environment: production`** so the FTP secrets are scoped to an environment you can lock to the `main` branch (see §7). Never `pull_request_target`, and never expose these secrets to a `pull_request` job — fork PRs run in this repo's context for workflow *files* only, but the environment gate is the real protection.
- No `paths:` filter. lehrgrapht uses one (with YAML anchors) because it is a monorepo with an add-in and a website. Here everything *is* the website, and paths filters on required status checks cause PRs to hang forever waiting for a check that will never report.
- No `issues:` / `issue_comment:` triggers. lehrgrapht's website workflow has them, which makes a full build+deploy pipeline start on every issue comment. That looks accidental; do not copy it.

**Is the nightly cron worth it? Qualified yes — keep it, but be honest about what it buys.** FTP-Deploy-Action diffs against a `.ftp-deploy-sync-state.json` it keeps on the server, so a nightly run with no source change uploads nothing: it costs ~2 minutes of runner time and is a no-op on the wire. What you actually get is a **build-health canary** — it catches the day a transitive dependency publishes a broken version, before you find out during a real release. What you do *not* get is drift repair: because the state file records the *last deployed* hashes, a file someone edits by hand on the server is invisible to the action. If you want the canary without touching production, split it into a separate `nightly.yml` that runs `cve-check` + `npm run build` and stops there — that is the cleaner shape, and I'd lean that way given `main` already deploys on every push.

---

# 7. Repo settings for a public repo where `main` auto-deploys

**Rulesets (Settings → Rules), on `main`:**
- Require a pull request before merging; require status checks `CVE check`, `Lint & format`, `Test`, `Build`; require branches to be up to date. As a solo maintainer set **0 required approvals** — you cannot approve your own PR, and a `1` here means you can never merge.
- Block force pushes; restrict deletions; require linear history; require conversation resolution.
- Restrict who can push to `main` to the release path only (merges from `develop`).
- Same ruleset on `develop`, minus the up-to-date requirement (it costs re-runs and buys little on a site with no shared mutable state).

**Merge strategy — this one is conventions-critical:** **disable squash merging** (or, if you keep it, set the squash commit message source to "pull request commits", not "pull request title"). Your conventions say commit messages follow Conventional Commits but **PR titles deliberately do not** (`Add retry logic…`, not `feat: add retry logic…`). GitHub's squash default uses the PR title as the commit subject, so squash-merging would write non-conventional subjects onto `main` and poison any future changelog/commitlint-on-history tooling. Use merge commits or rebase merging so the individual conventional commits survive.

**Environments:** create `production`, add a deployment branch rule limiting it to `main`, and put `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD` there rather than in repo secrets. This is the single highest-value setting: it makes it structurally impossible for any workflow on any other branch to read the credentials. Do **not** add required reviewers to the environment — that would turn auto-deploy into manual-deploy.

**Actions settings:** default `GITHUB_TOKEN` permissions → read-only; "Allow GitHub Actions to create and approve pull requests" → off; fork-PR workflow approval → "Require approval for all outside collaborators" (the public-repo default only covers first-time contributors).

**Security (all free on public repos):** secret scanning + **push protection** on (this matters a lot with FTP credentials in play), Dependabot alerts + security updates, private vulnerability reporting on. Add `.github/dependabot.yml` with two ecosystems — `npm` (weekly, grouped for `@angular*`) and `github-actions` (weekly) — the latter is what keeps `actions/checkout@v7` from quietly becoming three majors stale, as happened in lehrgrapht.

**Action pinning:** for a public repo, pin the two third-party actions (`SamKirkland/FTP-Deploy-Action`, `OWASP/cve-lite-cli`) to full commit SHAs with a `# v4.4.0` comment; `actions/*` by major tag is acceptable. Dependabot updates SHA pins for you. Note `FTP-Deploy-Action@v4.4.0` is an immutable tag, but tags are mutable in general — that is the whole point of SHA pinning.

Also: `CODEOWNERS` (one line, `* @boundfoxstudios`), a `LICENSE`, and a `SECURITY.md` since the repo is public.

---

# 8. Explicitly do NOT copy from lehrgrapht

- **`git-cliff` + `cliff.toml` + `version:next`.** lehrgrapht is a released, semver-versioned Office add-in (`"version": "1.7.1"`, a manifest with a version number, git tags). A website has no releases and no changelog — it continuously deploys `main`. Keep commitlint (readable history is still worth it), drop git-cliff entirely.
- **The whole gulp pipeline**: `gulp`, `gulp-replace`, `@types/gulp`, `through2`, `adm-zip`, `png-to-ico`, `sharp`, and the `prepare-deployment` / `write-version-file` / `generate-icons` / `patch-docx` scripts. All of it is add-in packaging.
- **`@dotenvx/dotenvx` and the `.env` / SSL dev-server scripts.** Those exist because Office add-ins must be served over HTTPS with a trusted cert. `ng serve` is enough here.
- **All `office-addin-*` packages, `@types/office-js`, `validate` / `validate:production` scripts, `ng-packagr`.**
- **The `overrides` block.** It exists only to force `@ngrx/signals` onto matching Angular peers. Adding an empty/copied one is cargo cult.
- **Most of `allowScripts`.** Use the six entries derived from this repo's lockfile, listed in §0.
- **Multiple lint scripts** (`lint:website`, `lint:addin`). One project, one `lint`.
- **The `issues:` / `issue_comment:` workflow triggers** and the **`paths:` + YAML-anchor filter** — see §6.
- **`parallel: true` in `lefthook.yml`** — see §2.
- **`prettier-plugin-css-order`** is the borderline case: with two CSS files it does almost nothing. I'd keep it (zero cost, and it starts paying the moment a `@theme` block grows), but it is the one item on the "matching the house style" list that is not actually earning its place today.

Conversely, one thing this repo needs that lehrgrapht does not: **`.prettierignore`** (lehrgrapht has none; without it `prettier --check .` walks `dist/` and `package-lock.json`).

---

# 9. Blocker you must fix before `deploy.yml` can work

`angular.json` currently sets `"outputMode": "server"` with `ssr.entry`, and `package.json` has `serve:ssr:website`. That produces `dist/website/server/server.mjs` and requires a Node process — an FTP static host cannot run it, so the deploy would ship a browser bundle whose routes 404 on refresh. Since `app.routes.server.ts` is already `{ path: '**', renderMode: RenderMode.Prerender }`, the fix is small:

```jsonc
// angular.json → website.architect.build.options
{
  "browser": "projects/website/src/main.ts",
  "server": "projects/website/src/main.server.ts",
  "outputMode": "static",
  // remove the "ssr" block entirely
}
```

Then delete `projects/website/src/server.ts`, drop the `serve:ssr:website` script, and remove `express` / `@types/express`. Output lands in `dist/website/browser/`, which is exactly what `local-dir` points at. (`outputMode: "static"` keeps the `server` entry — it is what prerendering runs — but emits no server bundle.)

## FINDINGS
- angular-eslint 22.1.0's `templateAccessibility` config contains exactly 11 rules (alt-text, click-events-have-key-events, elements-content, interactive-supports-focus, label-has-associated-control, mouse-events-have-key-events, no-autofocus, no-distracting-elements, role-has-required-aria, table-scope, valid-aria); `templateRecommended` adds only 4 (banana-in-box, eqeqeq, no-negated-async, prefer-control-flow). Verified by reading packages/angular-eslint/src/configs/*.ts at tag v22.1.0.
- `no-positive-tabindex` is a genuine accessibility rule that is NOT in the accessibility preset and should be enabled explicitly. `attributes-order` must stay off because prettier-plugin-organize-attributes owns attribute ordering — two fixers on the same bytes.
- typescript-eslint's own docs mark `tseslint.config(...)` DEPRECATED in favour of ESLint core's `defineConfig(...)`. angular-eslint 22's `ng add` schematic already emits `defineConfig`. The lehrgrapht config uses the deprecated helper. Semantic difference: `extends` intersects `files` under defineConfig vs overrides under tseslint.config — safe here because angular-eslint's ts-base/template-base declare no `files`.
- prettier-plugin-organize-attributes picks its preset from `options.parser` (source: src/index.ts — `angular` -> $ANGULAR, `vue` -> $VUE, else $HTML), NOT from the filename. Prettier only auto-assigns the `angular` parser to `*.component.html`, and Angular 20+ generates `app.html` with no `.component.` infix. The existing `*.html` -> `parser: angular` override in .prettierrc is therefore load-bearing; without it every template would silently get the 2-rule $HTML preset.
- prettier-plugin-tailwindcss 0.8.1 supports Tailwind v4 via the `tailwindStylesheet` option (replaces v3's `tailwindConfig`), paths relative to the prettier config file. It declares prettier-plugin-organize-attributes and prettier-plugin-css-order as explicit optional peers, so this exact three-plugin stack is a supported combination — but it MUST be last in `plugins`.
- Angular's `strictTemplates` defaults to TRUE (compiler.ts: `this.options.strictTemplates !== false`), and TypeScript 6.0 made `strict: true` the default. The repo's tsconfig is already strict despite listing neither option — don't cargo-cult those lines in.
- The repo is configured for SSR (`outputMode: server` + `ssr.entry` + `serve:ssr:website` + express) but the target is FTP static hosting. Since app.routes.server.ts already uses `RenderMode.Prerender` for `**`, switching to `outputMode: "static"` and deleting the ssr block/server.ts/express is a clean fix. Without it the FTP deploy ships a bundle whose routes 404 on refresh.
- lehrgrapht's lefthook.yml uses `parallel: true` with prettier --write and eslint --fix both writing overlapping staged files and both `stage_fixed` — a real lost-update race. Sequential jobs (eslint first, prettier last) fix it and give correct precedence.
- lehrgrapht's CI concurrency group `${{ github.workflow }}-${{ github.head_ref }}` is broken for non-PR events: `github.head_ref` is empty on push/schedule, so every deploy shares one group and `cancel-in-progress: true` can kill an in-flight FTP upload.
- Latest action versions (GitHub Releases API, 2026-08-17): actions/checkout v7.0.1, actions/setup-node v7.0.0, SamKirkland/FTP-Deploy-Action v4.4.0, OWASP/cve-lite-cli v1.29.0. lehrgrapht is a full major behind on checkout and setup-node.
- Latest npm versions (npm view, 2026-08-17): eslint 10.8.1, @eslint/js 10.0.1, angular-eslint 22.1.0, typescript-eslint 8.67.0, eslint-config-prettier 10.1.8, prettier 3.9.6, prettier-plugin-css-order 2.2.0, prettier-plugin-organize-attributes 1.0.0, prettier-plugin-tailwindcss 0.8.1, lefthook 2.1.10, @commitlint/cli 21.2.2, @commitlint/config-conventional 21.2.2, stylelint 17.14.1.
- This repo's `allowScripts` needs exactly six entries, derived from package-lock.json `hasInstallScript` flags plus lefthook: esbuild, @parcel/watcher, fsevents, lmdb, msgpackr-extract, lefthook. lehrgrapht's @azure/msal-*, @microsoft/m365agentstoolkit-cli and keytar entries are Office-toolchain-only. Note the sandbox runs npm 11.19.0 while packageManager pins npm@12.0.2 — allowScripts is advisory in 11.x, enforced in 12.
- `typescript-eslint` 8.67.0 declares `typescript: >=4.8.4 <6.1.0`, so the repo's TypeScript ~6.0.2 is inside the supported range — no peer warning, typed linting works.
- actions/setup-node supports `node-version-file: .nvmrc` natively, so `prepare-node` doesn't strictly need the version input — but `read-node-version-from-nvmrc` is still required because OWASP/cve-lite-cli takes a plain `node-version` string.
- The composite action's `tr -cd [:digit:].` is unquoted and is a shell glob; it can expand against a file named `d`, `g`, `i`, `t`, `:` or `.` in the repo root. Quote it as `tr -cd '[:digit:].'`.
- `@angular/build:unit-test` defaults `runner` to "vitest" and `watch` to false in non-TTY, so a bare `ng test` is already correct in CI — no `--watch=false` needed.
- GitHub's squash-merge default writes the PR title as the commit subject. The author's conventions say commit messages ARE Conventional Commits but PR titles are NOT — so squash merging would put non-conventional subjects on main. Disable squash merging or change the squash message source.

## RISKS
- Changing the component prefix to `bfs` breaks the existing `app-root` selector immediately — the first `npm run lint` fails. Mitigation: rename the selector in `projects/website/src/app/app.ts` to `bfs-root` and update `<app-root></app-root>` in `src/index.html` in the same commit as the angular.json prefix change.
- `@angular-eslint/template/prefer-self-closing-tags` has an autofixer. If `src/index.html` is linted it would rewrite `<bfs-root></bfs-root>` to `<bfs-root />`, which the browser HTML parser treats as an unclosed open tag. Mitigation: the `globalIgnores` entry for `projects/website/src/index.html` in the supplied eslint config — do not remove it.
- `tseslint.configs.strictTypeChecked` on a codebase that has never been linted will produce a large first-run error count (it is the house style, but lehrgrapht grew into it). Mitigation: land the config, run `npm run lint -- --fix`, and if the residue is large, temporarily downgrade the noisiest rules to `warn` in a single clearly-marked block rather than dropping strictTypeChecked.
- FTP credentials in a public repo are a live exfiltration target. Mitigation: put them in a `production` GitHub Environment with a deployment branch rule limited to `main` (not in repo-level secrets), use `protocol: ftps` instead of cleartext `ftp`, never use `pull_request_target`, set default GITHUB_TOKEN permissions to read-only, and enable secret scanning push protection.
- Cancelling a deploy mid-upload leaves the server half-updated AND desynchronises FTP-Deploy-Action's `.ftp-deploy-sync-state.json`, after which it will skip files it thinks are already current. Mitigation: `concurrency: { group: deploy-production, cancel-in-progress: false }`; if state ever desyncs, delete the state file on the server to force a full re-upload (never use `dangerous-clean-slate` on a cron).
- Scheduled workflows run against the default branch's copy of the workflow file and check out the default branch unless told otherwise. If `develop` is the default branch, the nightly would build and deploy `develop`. Mitigation: explicit `ref: main` on checkout (already in the supplied deploy.yml) and make sure deploy.yml is merged to `develop` so the cron actually fires.
- Required status checks plus a `paths:` filter is a deadlock: filtered-out runs never report, and the PR waits forever. Mitigation: no paths filter on ci.yml (as supplied); if you later want to skip docs-only PRs, use `paths-ignore` and accept that those checks still need to report.
- `postinstall: lefthook install` runs on every `npm ci` in CI too — the lefthook npm package's own postinstall correctly skips when `CI=true`, but the root script does not. It is harmless (writes hooks nobody invokes) but adds a step to every job. Mitigation: leave it for house-style parity, or drop it and rely on the package postinstall plus the `lefthook: true` allowScripts entry.
- Under npm 12, if `lefthook` is missing from `allowScripts` the binary shim never resolves and hooks silently stop installing — a quality gate that fails open. Mitigation: the `allowScripts` block in §0, and verify with `git config core.hooksPath` after a fresh `npm ci` locally.
- typed linting with `projectService: true` requires every linted .ts file to belong to a tsconfig. The solution-style root tsconfig has `files: []` with references; app files are covered by tsconfig.app.json and specs by tsconfig.spec.json, so it works today — but any new root-level .ts script would error with 'not found in project'. Mitigation: add `allowDefaultProject` under `parserOptions.projectService` when that happens, rather than disabling typed linting.
