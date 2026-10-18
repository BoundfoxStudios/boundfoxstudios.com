import { notFoundTitle, pageViewUrl, trackingState } from './tracking-rules';

const PRODUCTION_ORIGIN = 'https://boundfoxstudios.com';
const STORED_OBJECTION = 'theme=dark; mtm_consent_removed=1792345678901';

describe('trackingState', () => {
  it('allows tracking only on the production origin', () => {
    const otherOrigins = [
      'https://preview.boundfoxstudios.com',
      'http://localhost:4300',
      'http://127.0.0.1:4398',
      'https://www.boundfoxstudios.com',
      'http://boundfoxstudios.com',
    ];

    expect(trackingState(PRODUCTION_ORIGIN, {}, '')).toBe('allowed');
    expect(otherOrigins.filter(origin => trackingState(origin, {}, '') !== 'off')).toEqual([]);
  });

  it('does not track when Do Not Track is set', () => {
    expect(trackingState(PRODUCTION_ORIGIN, { doNotTrack: '1' }, '')).toBe('off');
    expect(trackingState(PRODUCTION_ORIGIN, { doNotTrack: '0' }, '')).toBe('allowed');
  });

  it('does not track when Global Privacy Control is set', () => {
    expect(trackingState(PRODUCTION_ORIGIN, { globalPrivacyControl: true }, '')).toBe('off');
  });

  it('keeps a visitor who objected untracked on the production origin', () => {
    expect(trackingState(PRODUCTION_ORIGIN, {}, STORED_OBJECTION)).toBe('opted-out');
    expect(trackingState(PRODUCTION_ORIGIN, {}, 'theme=dark')).toBe('allowed');
  });

  it('renews a stored objection even when Do Not Track is set', () => {
    expect(trackingState(PRODUCTION_ORIGIN, { doNotTrack: '1' }, STORED_OBJECTION)).toBe(
      'opted-out',
    );
  });
});

describe('pageViewUrl', () => {
  it('adds the trailing slash a client-side navigation drops', () => {
    expect(pageViewUrl('/support', 'https://boundfoxstudios.com/')).toBe(
      'https://boundfoxstudios.com/support/',
    );
    expect(pageViewUrl('/', 'https://boundfoxstudios.com/')).toBe('https://boundfoxstudios.com/');
  });

  it('keeps the /en/ prefix from the base href', () => {
    expect(pageViewUrl('/support', 'https://boundfoxstudios.com/en/')).toBe(
      'https://boundfoxstudios.com/en/support/',
    );
    expect(pageViewUrl('/foo:bar', 'https://boundfoxstudios.com/en/')).toBe(
      'https://boundfoxstudios.com/en/foo:bar/',
    );
  });

  it('keeps campaign parameters and drops other parameters and the fragment', () => {
    expect(
      pageViewUrl('/support?fbclid=x&mtm_campaign=y#top', 'https://boundfoxstudios.com/'),
    ).toBe('https://boundfoxstudios.com/support/?mtm_campaign=y');
  });
});

describe('notFoundTitle', () => {
  it("titles a 404 with its path and only the referrer's origin", () => {
    expect(
      notFoundTitle(
        'https://boundfoxstudios.com/gibt-es-nicht/',
        'https://www.google.com/search?q=boundfox',
      ),
    ).toBe('404/URL = %2Fgibt-es-nicht%2F /From = https%3A%2F%2Fwww.google.com');
    expect(notFoundTitle('https://boundfoxstudios.com/gibt-es-nicht/', '')).toBe(
      '404/URL = %2Fgibt-es-nicht%2F /From = ',
    );
  });

  it('names the previous page for an in-app navigation', () => {
    expect(
      notFoundTitle(
        'https://boundfoxstudios.com/en/gibt-es-nicht/',
        'https://boundfoxstudios.com/en/support/?mtm_campaign=y',
      ),
    ).toBe('404/URL = %2Fen%2Fgibt-es-nicht%2F /From = %2Fen%2Fsupport%2F');
  });
});
