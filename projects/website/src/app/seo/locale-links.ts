import { computed, inject, Injectable, LOCALE_ID, Signal } from '@angular/core';
import { Router } from '@angular/router';

import { LocaleConfig, LOCALES } from './site.config';

export interface LocaleLink extends LocaleConfig {
  readonly href: string;
  readonly current: boolean;
}

@Injectable({ providedIn: 'root' })
export class LocaleLinks {
  private readonly router = inject(Router);
  private readonly localeId = inject(LOCALE_ID);

  // `router.url` is a plain getter: zoneless change detection reads it once at construction,
  // so every prerendered page would emit the href of `/`.
  private readonly currentPath = computed(
    () => this.router.lastSuccessfulNavigation()?.finalUrl?.toString() ?? '/',
  );

  readonly links: Signal<readonly LocaleLink[]> = computed(() => {
    const path = this.currentPath();

    return LOCALES.map(locale => ({
      ...locale,
      href: `/${locale.subPath}${path}/`.replace(/\/{2,}/g, '/'),
      current: this.localeId.startsWith(locale.code),
    }));
  });
}
