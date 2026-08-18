import { computed, inject, Injectable, LOCALE_ID, Signal } from '@angular/core';
import { Router } from '@angular/router';

import { resolvePageSeo } from './resolve-page-seo';
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
  // so every prerendered page would emit the href of `/`. `routerState.snapshot` is a getter
  // too, and is read here only because the navigation signal above already forces a re-run.
  private readonly currentPage = computed(() => {
    const path = this.router.lastSuccessfulNavigation()?.finalUrl?.toString() ?? '/';
    const noIndex = resolvePageSeo(this.router.routerState.snapshot.root)?.noIndex === true;

    // A page with no canonical identity has no counterpart in the other locale either: the 404
    // is prerendered once and hydrated at every missed URL, so mirroring the requested path
    // would both diverge from the prerendered DOM and offer a link into the next 404.
    return noIndex ? '/' : path;
  });

  readonly links: Signal<readonly LocaleLink[]> = computed(() => {
    const path = this.currentPage();

    return LOCALES.map(locale => ({
      ...locale,
      href: `/${locale.subPath}${path}/`.replace(/\/{2,}/g, '/'),
      current: this.localeId.startsWith(locale.code),
    }));
  });
}
