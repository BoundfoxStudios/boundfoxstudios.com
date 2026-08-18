export const SITE = {
  origin: 'https://boundfoxstudios.com',
  name: 'Boundfox Studios',
  defaultImage: '/og/default.png',
} as const;

export interface LocaleConfig {
  readonly code: string;
  readonly hreflang: string;
  readonly subPath: string;
  readonly ogLocale: string;
}

export const LOCALES: readonly LocaleConfig[] = [
  { code: 'de', hreflang: 'de', subPath: '', ogLocale: 'de_DE' },
  { code: 'en', hreflang: 'en', subPath: 'en', ogLocale: 'en_US' },
];

// German, not English (SPEC §12 D9): x-default matches the apex and the primary audience.
export const X_DEFAULT_LOCALE = LOCALES[0];
