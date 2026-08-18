module.exports = {
  ci: {
    collect: {
      // Lighthouse serves the built tree itself; there is no dev server in this project and the
      // production site is plain static files, so this is the artifact that actually ships.
      staticDistDir: 'dist/website/browser',
      // With `staticDistDir` an explicit list disables autodiscovery, which otherwise crawls and
      // caps at five pages. These two are the locale entry points.
      url: ['http://localhost/', 'http://localhost/en/'],
      numberOfRuns: 3,
      settings: {
        // `--disable-dev-shm-usage` is not optional in a container: the default /dev/shm is 64 MB
        // and the tab crashes mid-run with TARGET_CRASHED, which reads like a flaky audit.
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 1 }],
        // Collected and visible in the report, deliberately never asserted: the orange kicker
        // cannot reach AA and `#ffa726` is a brand colour that does not change.
        // The deviation is recorded in docs/accessibility.md and enforced by `npm run axe`.
        'categories:accessibility': 'off',
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
