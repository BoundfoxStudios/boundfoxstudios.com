import { defineConfig } from 'vitest/config';

// `ng test` only ever collects projects/website/src/**/*.spec.ts, so the build scripts need their
// own runner. Each script is split into a pure `*.lib.mjs` (tested here) and a thin CLI (not).
export default defineConfig({
  test: {
    include: ['tools/**/*.spec.mjs'],
    environment: 'node',
  },
});
