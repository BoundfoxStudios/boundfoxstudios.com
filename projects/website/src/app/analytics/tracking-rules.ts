import { SITE } from '../seo/site.config';

const CAMPAIGN_PARAMETER_PREFIXES = ['mtm_', 'matomo_', 'pk_', 'piwik_', 'utm_'];

export const OPT_OUT_COOKIE = 'mtm_consent_removed';

export function trackingState(
  origin: string,
  browser: { readonly doNotTrack?: string | null; readonly globalPrivacyControl?: boolean },
  cookie: string,
): 'allowed' | 'opted-out' | 'off' {
  if (origin !== SITE.origin) {
    return 'off';
  }

  if (optOutCookieValue(cookie)) {
    return 'opted-out';
  }

  if (browser.doNotTrack === '1' || browser.globalPrivacyControl === true) {
    return 'off';
  }

  return 'allowed';
}

export function optOutCookieValue(cookie: string): string {
  return (
    cookie
      .split(';')
      .map(cookieEntry => cookieEntry.trim())
      .find(cookieEntry => cookieEntry.startsWith(`${OPT_OUT_COOKIE}=`))
      ?.slice(OPT_OUT_COOKIE.length + 1) ?? ''
  );
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
