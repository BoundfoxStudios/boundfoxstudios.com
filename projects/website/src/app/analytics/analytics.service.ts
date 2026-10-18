import {
  afterNextRender,
  DestroyRef,
  DOCUMENT,
  EnvironmentProviders,
  inject,
  Injectable,
  provideAppInitializer,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { resolvePageSeo } from '../seo/resolve-page-seo';
import { MATOMO } from './analytics.config';
import {
  notFoundTitle,
  OPT_OUT_COOKIE,
  optOutCookieValue,
  pageViewUrl,
  trackingState,
} from './tracking-rules';

export type TrackingStatus = 'unknown' | 'off' | 'on' | 'opted-out' | 'on-next-load';

const OPT_OUT_COOKIE_LIFETIME_IN_SECONDS = 30 * 365 * 24 * 60 * 60;

type MatomoCommand = readonly [string, ...unknown[]] | readonly [() => void];

interface MatomoWindow extends Window {
  _paq?: { push(command: MatomoCommand): unknown };
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly trackingStatus = signal<TrackingStatus>('unknown');

  readonly status = this.trackingStatus.asReadonly();

  start(): void {
    this.push(['setTrackerUrl', `${MATOMO.origin}/matomo.php`]);
    this.push(['setSiteId', MATOMO.siteId]);
    this.push(['disableCookies']);
    this.push(['disableBrowserFeatureDetection']);
    this.push(['disablePerformanceTracking']);
    this.push([
      (): void => {
        this.trackingStatus.set('on');
      },
    ]);

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
    script.addEventListener('error', () => {
      this.trackingStatus.set('off');
    });

    this.document.head.appendChild(script);
  }

  decline(state: 'opted-out' | 'off'): void {
    if (state === 'opted-out') {
      // Safari caps cookies written by script at seven days, so only rewriting the objection on
      // every load keeps it from lapsing.
      this.document.cookie = `${OPT_OUT_COOKIE}=${optOutCookieValue(this.document.cookie)}; path=/; max-age=${OPT_OUT_COOKIE_LIFETIME_IN_SECONDS}; SameSite=Lax`;
    }

    this.trackingStatus.set(state);
  }

  optOut(): void {
    this.push(['optUserOut']);
    this.trackingStatus.set('opted-out');
  }

  revokeOptOut(): void {
    // Not forgetUserOptOut: it calls setConsentGiven, which turns browser feature detection back on
    // and sends the hits queued while the visitor was opted out.
    this.document.cookie = `${OPT_OUT_COOKIE}=; path=/; max-age=0`;
    this.trackingStatus.set('on-next-load');
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
    const analytics = inject(AnalyticsService);
    const state = trackingState(location.origin, navigator, document.cookie);

    if (state === 'allowed') {
      analytics.start();
      afterNextRender(() => {
        analytics.loadTracker();
      });
    } else {
      analytics.decline(state);
    }
  });
}
