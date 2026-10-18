import {
  afterNextRender,
  DestroyRef,
  DOCUMENT,
  EnvironmentProviders,
  inject,
  Injectable,
  provideAppInitializer,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { resolvePageSeo } from '../seo/resolve-page-seo';
import { MATOMO } from './analytics.config';
import { notFoundTitle, pageViewUrl, trackingState } from './tracking-rules';

type MatomoCommand = readonly [string, ...unknown[]] | readonly [() => void];

interface MatomoWindow extends Window {
  _paq?: { push(command: MatomoCommand): unknown };
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  start(): void {
    this.push(['setTrackerUrl', `${MATOMO.origin}/matomo.php`]);
    this.push(['setSiteId', MATOMO.siteId]);
    this.push(['disableCookies']);
    this.push(['disableBrowserFeatureDetection']);
    this.push(['disablePerformanceTracking']);

    let previousUrl: string | undefined;

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(event => {
        const url = pageViewUrl(event.urlAfterRedirects, this.document.baseURI);

        if (previousUrl !== undefined) {
          this.push(['setReferrerUrl', previousUrl]);
        }

        this.push(['setCustomUrl', url]);
        this.push(['setDocumentTitle', this.pageTitle(url, previousUrl)]);
        this.push(['trackPageView']);

        previousUrl = url;
      });
  }

  loadTracker(): void {
    const script = this.document.createElement('script');

    script.async = true;
    script.src = `${MATOMO.origin}/matomo.js`;

    this.document.head.appendChild(script);
  }

  private pageTitle(url: string, previousUrl: string | undefined): string {
    // `NavigationEnd` fires before the title strategy updates `document.title`.
    const seo = resolvePageSeo(this.router.routerState.snapshot.root);

    if (seo?.noIndex) {
      return notFoundTitle(url, previousUrl ?? this.document.referrer);
    }

    return seo?.title ?? this.document.title;
  }

  private push(command: MatomoCommand): void {
    // Once loaded, matomo.js replaces this array with its own proxy, so a stored reference would
    // silently drop every later command.
    ((window as MatomoWindow)._paq ??= [] as MatomoCommand[]).push(command);
  }
}

export function provideAnalytics(): EnvironmentProviders {
  return provideAppInitializer(() => {
    if (trackingState(location.origin, navigator) === 'allowed') {
      const analytics = inject(AnalyticsService);

      analytics.start();
      afterNextRender(() => {
        analytics.loadTracker();
      });
    }
  });
}
