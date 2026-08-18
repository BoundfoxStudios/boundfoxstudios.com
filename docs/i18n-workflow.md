# Working with translatable strings

Two catalogues, one command. `projects/website/src/locale/messages.xlf` is the German source and is
**generated** — never hand-edit it. `messages.en.xlf` holds the English targets and is the only one
you type into.

`npm run i18n:extract` regenerates both: it rewrites the source catalogue from the templates and the
`$localize` calls, then merges the result into the English one, keeping every target that already
exists. It replaced the plain Angular extractor in M7 (SPEC §12 **D12**, `ng-extract-i18n-merge`).

## Adding a string

1. Mark it in the template — `i18n="@@page.section.element"` or `i18n-<attribute>="@@…"`. German
   source lives in templates, not in TypeScript, unless the string is a computed fallback
   (`docs/decisions.md` › _Conventions › i18n_).
2. `npm run i18n:extract`. The new unit appears in `messages.xlf`, and in `messages.en.xlf` as
   `<segment state="initial">` with a `<source>` and **no** `<target>`.
3. Write the `<target>` and change the segment to `state="translated"`.
4. `npm run i18n:check`.

## Changing German wording

Edit the template, run `npm run i18n:extract`. The merge tool updates the `<source>` in both files
and flips that segment back to `state="initial"`, keeping the old English target visible so you can
see what it used to say. Update the target and set the state back to `translated`.

## Removing a string

Delete the markup, run `npm run i18n:extract`. The unit disappears from both files.

## The gate

`npm run i18n:check` is what CI runs, in the `build` job, before the build:

```
ng extract-i18n
  && git diff --exit-code -- projects/website/src/locale
  && node tools/verify-translations.mjs
```

Per unit it asserts: present in `messages.en.xlf` · non-empty `<target>` · not `state="initial"` ·
identical `<source>` in both files · identical `<ph id>` set between source and target · no `→` in
the target (components render the arrow themselves). Plus: no unit in `messages.en.xlf` that
`messages.xlf` does not have.

`--prefix=a.,b.` narrows it to some ids, which is how the M7 issues proved their own scope while the
rest of the catalogue was still untranslated.

### Why the build alone is not enough

`i18nMissingTranslation: "error"` sounds like it covers this. It does not. A unit that exists with a
`<source>` and no `<target>` resolves to its **German source**, so the build stays green while German
ships under `/en/`. Measured in M7: 110 of 144 units untranslated, zero build errors. Deleting an
existing `<target>` behaves the same way. `verify:translations` is therefore the gate, not a second
opinion — see `docs/decisions.md` M7 › Translation sync.

### The four ways it fails

| what you did | what you see |
| --- | --- |
| changed a template string, forgot to extract | `git diff --exit-code` fails, printing the catalogue diff |
| added a string, did not translate it | `FAIL  <id>: has no translation` |
| changed the German wording of a translated string | `FAIL  <id>: is marked state="initial"` |
| left a unit behind after deleting the markup | `FAIL  <id>: is orphaned` |

## Two things that are easy to get wrong

- **One id used in two templates must carry byte-identical German text.** Extraction warns
  (`Duplicate messages with id "…"`) but does not fail, and the first occurrence wins — so the two
  places would render different German and the same English. `verify:translations` catches it as a
  source mismatch between the two catalogues.
- **ICU sub-messages get auto-generated hash ids** even inside a block with an explicit `@@id`, and
  those ids change when the German ICU source is edited. The old English unit is then an orphan, not
  a missing one, which is why the orphan check exists.
