import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AnalyticsService } from './analytics.service';

type QueuedCommand = readonly unknown[];

interface TrackerWindow extends Window {
  _paq?: { push(command: QueuedCommand): unknown };
}

@Component({ template: '' })
class TestPage {}

const trackerWindow = window as TrackerWindow;

const queuedCommands = (): readonly QueuedCommand[] =>
  (trackerWindow._paq ?? []) as readonly QueuedCommand[];

const commandsNamed = (name: string): readonly QueuedCommand[] =>
  queuedCommands().filter(([commandName]) => commandName === name);

describe('AnalyticsService', () => {
  let router: Router;

  beforeEach(() => {
    delete trackerWindow._paq;
    document.cookie = 'mtm_consent_removed=; path=/; max-age=0';

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: '',
            component: TestPage,
            data: { seo: { title: 'Startseite', description: '' } },
          },
          {
            path: 'support',
            component: TestPage,
            data: { seo: { title: 'Unterstützen', description: '' } },
          },
        ]),
        provideLocationMocks(),
      ],
    });

    router = TestBed.inject(Router);
    TestBed.inject(AnalyticsService).start();
  });

  it('configures cookieless tracking without feature detection or performance timings', () => {
    expect(queuedCommands()).toEqual(
      expect.arrayContaining([
        ['disableCookies'],
        ['disableBrowserFeatureDetection'],
        ['disablePerformanceTracking'],
      ]),
    );
  });

  it('tracks the landing page once, titled from its route', async () => {
    await router.navigateByUrl('/');

    expect(commandsNamed('trackPageView')).toHaveLength(1);
    expect(commandsNamed('setDocumentTitle')).toEqual([['setDocumentTitle', 'Startseite']]);
  });

  it('sends the previous page as referrer on an in-app navigation', async () => {
    await router.navigateByUrl('/');
    const [, landingUrl] = commandsNamed('setCustomUrl')[0];
    const commandsBeforeSupport = queuedCommands().length;

    await router.navigateByUrl('/support');
    const supportPageView = queuedCommands().slice(commandsBeforeSupport);

    expect(commandsNamed('setReferrerUrl')).toEqual([['setReferrerUrl', landingUrl]]);
    expect(supportPageView).toContainEqual(['setReferrerUrl', landingUrl]);
    expect(supportPageView.at(-1)).toEqual(['trackPageView']);
  });

  it('keeps tracking after Matomo replaces its queue', async () => {
    const replacementQueue: QueuedCommand[] = [];

    trackerWindow._paq = {
      push: (command: QueuedCommand): number => replacementQueue.push(command),
    };

    await router.navigateByUrl('/support');

    expect(replacementQueue).toContainEqual(['trackPageView']);
  });

  it('withdrawing the objection deletes the opt-out cookie without forgetUserOptOut', () => {
    document.cookie = 'mtm_consent_removed=1792345678901; path=/';

    TestBed.inject(AnalyticsService).revokeOptOut();

    expect(document.cookie).not.toContain('mtm_consent_removed');
    expect(commandsNamed('forgetUserOptOut')).toEqual([]);
  });
});
