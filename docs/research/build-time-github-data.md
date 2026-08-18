## RECOMMENDATION
## Verdict: take design (b) — a Node prebuild script writing `github-data.json`, imported statically.

Design (a) works — I proved it end to end — but it hits the GitHub API **N+1 times** (once per prerendered route plus once for route extraction). Measured: 21 fetch rounds for 20 routes. Design (b) hits it once, builds 5x faster, and keeps the token structurally incapable of reaching the browser bundle.

Everything below was executed against a real copy of your workspace (`projects/website`, Angular 22.1.2) and hit the real BoundfoxStudios repos.

---

### 1. `angular.json` — switch to static

```jsonc
"options": {
  "browser": "projects/website/src/main.ts",
  "tsConfig": "projects/website/tsconfig.app.json",
  "assets": [{ "glob": "**/*", "input": "projects/website/public" }],
  "styles": ["projects/website/src/styles.css"],
  "server": "projects/website/src/main.server.ts",  // ← MUST STAY. This is what enables prerendering.
  "outputMode": "static",
  "security": { "allowedHosts": [] }
  // "ssr": { "entry": ... }  ← DELETE. Only required for outputMode "server".
}
```

**Critical gotcha I verified:** `options.prerender = !!options.server` (`@angular/build/src/builders/application/options.js:123`). If you delete `server` along with `ssr`, the build *silently succeeds with exit 0* and emits a bare CSR shell — no prerendered content at all. I confirmed this: `grep "lehrgrapht-tag: 1.7.0" index.html` → 0 matches.

You can then delete `projects/website/src/server.ts`, the `serve:ssr:website` script, and the `express` + `@types/express` dependencies.

---

### 2. `tools/fetch-github-data.mjs` (the prebuild script)

Verified working against the live API — including flugwacht's real 404.

```js
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUTPUT_PATH = resolve(
  process.argv[2] ?? 'projects/website/src/app/generated/github-data.json',
);

const token = process.env.GITHUB_TOKEN;

const request = async (path, { allow404 = false } = {}) => {
  const url = `https://api.github.com/${path}`;
  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'boundfoxstudios.com-build',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 404 && allow404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `GitHub API ${response.status} ${response.statusText} for ${url}\n${await response.text()}`,
    );
  }

  return response.json();
};

const repositoryCard = async (fullName) => {
  const repo = await request(`repos/${fullName}`);

  return {
    description: repo.description,
    language: repo.language,
    pushedAt: repo.pushed_at,
    stars: repo.stargazers_count,
  };
};

const latestRelease = async (fullName) => {
  const release = await request(`repos/${fullName}/releases/latest`, { allow404: true });
  return release && { tagName: release.tag_name, publishedAt: release.published_at };
};

const latestTag = async (fullName) => {
  const tags = await request(`repos/${fullName}/tags?per_page=1`);
  return tags[0] ? { name: tags[0].name } : null;
};

const [lehrgrapht, mat, flugwacht, lehrgraphtTag, matRelease, flugwachtRelease] =
  await Promise.all([
    repositoryCard('BoundfoxStudios/lehrgrapht'),
    repositoryCard('BoundfoxStudios/mat'),
    repositoryCard('BoundfoxStudios/flugwacht'),
    latestTag('BoundfoxStudios/lehrgrapht'),
    latestRelease('BoundfoxStudios/mat'),
    latestRelease('BoundfoxStudios/flugwacht'),
  ]);

const data = {
  generatedAt: new Date().toISOString(),
  lehrgrapht: { ...lehrgrapht, latestTag: lehrgraphtTag },
  mat: { ...mat, latestRelease: matRelease },
  flugwacht: { ...flugwacht, latestRelease: flugwachtRelease },
};

if (!data.lehrgrapht.latestTag) {
  throw new Error('lehrgrapht has no tags — refusing to write incomplete data');
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`);

console.log(`Wrote ${OUTPUT_PATH}`);
console.log(`  lehrgrapht tag:    ${data.lehrgrapht.latestTag?.name ?? '(none)'}`);
console.log(`  mat release:       ${data.mat.latestRelease?.tagName ?? '(none)'}`);
console.log(`  flugwacht release: ${data.flugwacht.latestRelease?.tagName ?? '(none)'}`);
```

Real output today:
```
  lehrgrapht tag:    1.7.0
  mat release:       v1.0.0
  flugwacht release: (none)     ← the fallback case is live right now
```

Note the asymmetry is real and necessary: **lehrgrapht's `releases/latest` returns 404** (it has tags but no releases), which is exactly why the task specifies "latest tag" for it and "latest release" for the other two.

---

### 3. Typed accessor — `projects/website/src/app/github-data.ts`

```ts
import data from './generated/github-data.json';

export interface RepositoryCard {
  description: string | null;
  language: string | null;
  pushedAt: string;
  stars: number;
}

export interface ReleaseInfo {
  tagName: string;
  publishedAt: string;
}

export interface GitHubData {
  generatedAt: string;
  lehrgrapht: RepositoryCard & { latestTag: { name: string } | null };
  mat: RepositoryCard & { latestRelease: ReleaseInfo | null };
  flugwacht: RepositoryCard & { latestRelease: ReleaseInfo | null };
}

export const gitHubData: GitHubData = data;
```

The explicit annotation is load-bearing: if the script's shape drifts, `ng build` fails with a type error instead of shipping wrong data. No `resolveJsonModule` config needed — your root `tsconfig.json` uses `"module": "preserve"`, which implies it.

---

### 4. Component usage — no service, no `TransferState`, no injector

```ts
import { Component } from '@angular/core';
import { gitHubData } from './github-data';

@Component({
  selector: 'app-project-cards',
  templateUrl: './project-cards.html',
})
export class ProjectCards {
  protected readonly data = gitHubData;
}
```

```html
<p>{{ data.lehrgrapht.latestTag?.name }}</p>
<p>{{ data.mat.latestRelease?.tagName }}</p>
<p>{{ data.flugwacht.latestRelease?.tagName ?? 'Coming soon' }}</p>
<p>{{ data.flugwacht.description }} · {{ data.flugwacht.language }}</p>
```

Verified prerendered output (route `/r7` of 20):
```html
<app-root ng-version="22.1.2" ngh="1" ng-server-context="ssg">
  <p>lehrgrapht-tag: 1.7.0</p>
  <p>mat-release: v1.0.0</p>
  <p>flugwacht: Coming soon</p>
  <p>flugwacht-desc: A deliberately minimal flight tracker…</p>
```

---

### 5. `package.json`

```jsonc
"scripts": {
  "ng": "ng",
  "start": "ng serve",
  "fetch:github": "node tools/fetch-github-data.mjs projects/website/src/app/generated/github-data.json",
  "prebuild": "npm run fetch:github",
  "build": "ng build"
}
```

Verified: `npm run build` → fetches → prerenders 20 routes → exit 0, with **0 API calls during `ng build` itself**.

**Commit `github-data.json`.** That makes `ng serve` and offline rebuilds work with zero token setup, and makes any given commit reproducible. CI regenerates it before building (without committing back), so deploys are always fresh.

---

### 6. GitHub Actions

```yaml
- uses: actions/setup-node@v5
  with:
    node-version-file: .nvmrc
    cache: npm

- run: npm ci

- name: Fetch GitHub data
  run: npm run fetch:github
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

- run: npx ng build   # prebuild already ran above; ng build alone avoids a second fetch
```

Keep default `permissions` (or `contents: read`) — reading *public* repos needs no extra grant.

---

### Optional: one API call instead of six

If you'd rather make a single request, this GraphQL query returns everything, and `latestRelease` comes back as `null` for flugwacht natively — no 404 handling at all. I ran it; it returns 200 with correct data:

```graphql
query {
  lehrgrapht: repository(owner: "BoundfoxStudios", name: "lehrgrapht") {
    description pushedAt primaryLanguage { name }
    refs(refPrefix: "refs/tags/", first: 1,
         orderBy: { field: TAG_COMMIT_DATE, direction: DESC }) { nodes { name } }
  }
  mat: repository(owner: "BoundfoxStudios", name: "mat") {
    description pushedAt primaryLanguage { name }
    latestRelease { tagName publishedAt }
  }
  flugwacht: repository(owner: "BoundfoxStudios", name: "flugwacht") {
    description pushedAt primaryLanguage { name }
    latestRelease { tagName publishedAt }
  }
}
```

Trade-off: GraphQL has **no anonymous access**, so `npm run fetch:github` would then require a token locally (`GITHUB_TOKEN=$(gh auth token)`). REST works with no token at all, which is why I made it the default. Since the JSON is committed, most local work never runs the script anyway — pick GraphQL if you prefer the cleaner null semantics.

---

### If you still want design (a)

It does work. Two rules make it safe, both verified:

1. Register the initializer **only** in `app.config.server.ts`, never in `app.config.ts` — this is what your lehrgrapht reference gets right.
2. Put the initializer in its **own file** that no browser-reachable module imports. With the initializer inlined in `github.service.ts` (which components import), `process.env.X` was emitted verbatim into `main.js`; after splitting it out, browser-bundle occurrences dropped to **0**.

Add a module-level promise cache to cut N+1 down to one fetch per worker thread — but that only bounds it to `min(routeCount, maxThreads)`, which is CPU-dependent, not 1.

## FINDINGS
- Q1 — CONFIRMED: prerendering with outputMode 'static' fully executes server-side code at build time. Source: node_modules/@angular/build/src/utils/server-rendering/render-worker.js loads main.server.mjs and calls ɵgetOrCreateAngularServerApp({allowStaticRouteRender:true}).handle(new Request(...)) inside a Node worker thread. Empirically: my provideAppInitializer ran, isPlatformBrowser() returned false, a real fetch() to api.github.com succeeded, and the fetched values (lehrgrapht 1.7.0, mat v1.0.0) were baked into every prerendered HTML file. Output carries ng-server-context="ssg".
- Q1 GOTCHA: the `server` entry in angular.json is what enables prerendering, not `outputMode`. In options.js:123 the builder does `options.prerender = !!options.server`. With outputMode 'static' and no `server` entry, the build succeeds with exit 0 but emits an empty CSR shell — silent, no warning. `ssr.entry` is only required for outputMode 'server' (options.js:108-113) and must be removed for static.
- Q2 — CONFIRMED: TransferState is embedded in the prerendered HTML as <script id="ng-state" type="application/json">, present identically in index.html and every route file. Verified content: {"github-data":{"lehrgraphtTag":"1.7.0","matRelease":"v1.0.0","flugwachtRelease":null,...},"__nghData__":[...]}.
- Q2 NUANCE: TransferState serialization is NOT dependent on hydration. I built with provideClientHydration() removed and a server-only initializer writing TransferState — the ng-state script was still emitted with the full payload. So TransferState works either way.
- Q2 — provideClientHydration IS still worth keeping. Without it the prerendered markup carries no ngh attributes, no <!--nghm--> marker, and no hydration annotations; Angular destroys and re-creates the whole DOM at bootstrap, causing a visible flash/CLS even for a site whose only interactivity is a menu toggle. Cost is negligible. Keep it. withEventReplay() is optional and only matters if clicks can land before hydration finishes.
- Q3 — process.env DOES work in the prerender/server bundle: process.env['PROBE_GITHUB_TOKEN'] resolved to its real value during prerendering. tsconfig.app.json already ships "types": ["node"], so it typechecks with no change.
- Q3 HAZARD: the esbuild-based builder does NOT define/replace process.env and does NOT shim `process`. When the initializer lived in github.service.ts (imported by a component), the browser bundle contained the literal text `process.env.PROBE_GITHUB_TOKEN` with no `var process` shim anywhere — that is a ReferenceError at hydration time. It only stays safe because tree-shaking removes it, which is fragile: one accidental import from a component silently re-introduces it.
- Q3 — moving the initializer into its own file (github.initializer.ts) and registering it only in app.config.server.ts dropped process.env occurrences in the browser bundle from 1 to 0. This is exactly the pattern the lehrgrapht reference uses (provideAppInitializer is in app.config.server.ts only, never app.config.ts).
- Q3 — the angular.json `define` option is NOT a substitute for a secret: its schema says values are substituted 'in any JavaScript or TypeScript code including libraries', which inlines the literal into the BROWSER bundle too. Fine for non-secret flags, unsafe for a token.
- Q4 DECISIVE MEASUREMENT — design (a) hits the API N+1 times. 5 routes → 6 fetch rounds; 20 routes → 21 fetch rounds. The +1 is the separate routes-extractor-worker pass, which bootstraps the app before any rendering. With 3 REST calls per round that is 63 GitHub calls for a 20-route site.
- Q4 — a module-level promise cache does NOT reduce design (a) to 1. Measured 5 rounds for 20 routes and 5 rounds for 5 routes: the cache only dedupes within a single worker thread, and prerender.js:125 sets maxThreads = Math.min(routeCount, maxThreads), so the number of live API rounds is CPU-count- and route-count-dependent — nondeterministic across machines and CI runners.
- Q4 — build-time cost: design (a) with 20 routes took 6.6s; design (b) took 1.3s, a 5x difference, because no render worker touches the network.
- Q4 — design (b) makes zero API calls during `ng build` (verified with a local request-counting HTTP server: 0 hits), and adds ~1kB to the browser bundle (230.08kB → 231.09kB) with no new runtime dependency.
- Q4 — Octokit is a real bundle liability in design (a): the lehrgrapht reference had to add allowedCommonJsDependencies: ['bottleneck/light.js', 'fast-content-type-parse'] and raise its initial budget to 800kB warn / 1MB error. Your current project budget is 500kB/1MB, so adding Octokit would likely breach it. Design (b) needs no Octokit at all — plain fetch in a Node script.
- Q5 — CONFIRMED both fail-loud paths. (i) A throw inside the app initializer aborts the build: 'An error occurred while extracting routes', 'Prerendered 0 static routes', 'Application bundle generation failed', exit code 1, and the dist/ directory is not created at all. (ii) For design (b), an unreachable API in the prebuild script gives 'TypeError: fetch failed / ECONNREFUSED' and exit code 1 via npm's prebuild hook, so `ng build` never starts.
- Q5 — design (b) gets a second, free safety net: if github-data.json is missing, `ng build` fails with 'Could not resolve ./generated/github-data.json' plus 'TS2307: Cannot find module', exit 1. It is impossible to build the site without the data present.
- Q5 — design (a)'s failure message is materially worse for debugging: the stack trace points into .angular/prerender-root/<random-uuid>/main.server.mjs:111:1764 — a hashed, minified, per-build temp path. Design (b) fails in one small readable script.
- Q6 — API call count: 6 REST calls per build (3 repo cards + 1 tags + 2 releases/latest), or 1 call if you use the combined GraphQL query, which I verified returns 200 with all three repos and latestRelease: null for flugwacht.
- Q6 — official rate limits (docs.github.com, quoted verbatim): unauthenticated 'is 60 requests per hour'; personal access tokens 'count towards your personal rate limit of 5,000 requests per hour'; and 'The rate limit for GITHUB_TOKEN is 1,000 requests per hour per repository.' At 6 calls per build this is a non-issue by three orders of magnitude.
- Q6 — CONFIRMED the default secrets.GITHUB_TOKEN can read all three public repos even though they are different repositories from the one running the workflow. The token's `permissions:` block only governs write/private access to its own repository; public repository metadata, tags and releases are world-readable and any authenticated token can read them (GitHub docs: 'A token with no assigned scopes can only access public information'). No PAT and no org-level secret needed.
- Q6 — one asymmetry to note: GraphQL has no anonymous access, so the 1-call variant requires a token even locally. REST works with no token (60/hr is plenty for a build), which is better local DX.
- Live data check today: lehrgrapht releases/latest returns 404 (it has tags but no releases) → the tags endpoint is genuinely required for it; mat latest release is v1.0.0; flugwacht releases/latest returns 404 → the 'Coming soon' fallback is live right now, not hypothetical.

## RISKS
- Deleting `server` from angular.json along with `ssr` silently disables prerendering — build exits 0 and ships an empty CSR shell. Mitigation: keep `server: projects/website/src/main.server.ts`, and add a CI smoke test that greps the built index.html for a known string, e.g. `grep -q 'BoundfoxStudios' dist/website/browser/index.html || exit 1`.
- If you go with design (a) anyway: process.env has no esbuild shim and will land verbatim in the browser bundle the moment the file containing it becomes reachable from a component import, producing a ReferenceError only at hydration — invisible in the prerendered HTML and easy to miss. Mitigation: keep the initializer in its own file, register it only in app.config.server.ts, and add a CI assertion `! grep -q 'process\.env' dist/website/browser/main-*.js`.
- Committing github-data.json means the repo copy goes stale between builds. Mitigation: CI regenerates it before every build and does not commit back, so deployed output is always fresh while local dev stays offline-capable. Optionally add a scheduled workflow that refreshes and commits it weekly so the repo copy does not drift far.
- The explicit `GitHubData` type annotation will fail the build if the script's output shape changes — this is intended, but it can also fail unexpectedly if GitHub returns null for a field you typed as non-null (e.g. a repo with no description or no detected language). Mitigation: the interface above already types description and language as `string | null`.
- flugwacht will eventually get its first release, at which point latestRelease flips from null to an object. Make sure the template genuinely handles both (`?? 'Coming soon'`) and that no code does a non-null assertion on it. The type system enforces this as long as nobody writes `!`.
- A transient GitHub 5xx or a network blip now fails the whole deploy — that is the requested behavior, but it makes deploys dependent on GitHub uptime. Mitigation if that becomes painful: add a small bounded retry (2-3 attempts with backoff) inside `request()` for 5xx and 429 only, never for 4xx, so genuine errors still fail fast.
- Do not add `continue-on-error: true` to the fetch step in CI, and do not wrap the script in `|| true` — either silently reintroduces the stale-data failure mode the hard-fail requirement exists to prevent.
- Rate limiting is a non-issue at 6 calls/build, but if you ever move the fetch into a matrix or a per-route loop, the GITHUB_TOKEN limit is per repository per hour (1,000), shared with every other workflow in that repo — including checkout and any actions that call the API. Keep the fetch to a single job step.
- The sandbox proxy I tested in transparently injects GitHub credentials, so my 'invalid token' test could not produce a real 401 and that specific path is unverified. The non-ok branch in `request()` is straightforward, but consider testing it once in real CI by temporarily passing a bogus token.
