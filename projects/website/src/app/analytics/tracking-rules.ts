import { SITE } from '../seo/site.config';

const CAMPAIGN_PARAMETER_PREFIXES = ['mtm_', 'matomo_', 'pk_', 'piwik_', 'utm_'];

export function trackingState(
  origin: string,
  browser: { readonly doNotTrack?: string | null; readonly globalPrivacyControl?: boolean },
): 'allowed' | 'off' {
  if (origin !== SITE.origin) {
    return 'off';
  }

  if (browser.doNotTrack === '1' || browser.globalPrivacyControl === true) {
    return 'off';
  }

  return 'allowed';
}

export function pageViewUrl(routerUrl: string, baseUri: string): string {
  const url = new URL(`.${routerUrl}`, baseUri);
  const campaignParameters = [...url.searchParams].filter(([name]) =>
    CAMPAIGN_PARAMETER_PREFIXES.some(prefix => name.startsWith(prefix)),
  );

  url.hash = '';
  url.search = new URLSearchParams(campaignParameters).toString();

  if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
  }

  return url.href;
}

export function notFoundTitle(pageUrl: string, referrer: string): string {
  const page = new URL(pageUrl);
  const source = referrerSource(referrer, page.origin);

  return `404/URL = ${encodeURIComponent(page.pathname)} /From = ${encodeURIComponent(source)}`;
}

function referrerSource(referrer: string, pageOrigin: string): string {
  if (!referrer) {
    return '';
  }

  const source = new URL(referrer);

  return source.origin === pageOrigin ? source.pathname : source.origin;
}
