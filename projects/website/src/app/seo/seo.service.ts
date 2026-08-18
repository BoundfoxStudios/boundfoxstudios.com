import { DOCUMENT, inject, Injectable, LOCALE_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { PageSeo } from './seo.types';
import { LOCALES, SITE, X_DEFAULT_LOCALE } from './site.config';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly localeId = inject(LOCALE_ID);

  apply(seo: PageSeo, routePath: string): void {
    const locale = LOCALES.find(entry => this.localeId.startsWith(entry.code)) ?? LOCALES[0];
    const image = new URL(seo.image ?? SITE.defaultImage, SITE.origin).href;

    this.title.setTitle(seo.title);

    this.setNamedTags({
      description: seo.description,
      robots: seo.noIndex ? 'noindex, follow' : 'index, follow',
      'twitter:card': 'summary_large_image',
    });

    this.setPropertyTags({
      'og:title': seo.title,
      'og:description': seo.description,
      'og:image': image,
      'og:type': seo.type ?? 'website',
      'og:site_name': SITE.name,
      'og:locale': locale.ogLocale,
    });

    // One document survives every client-side navigation, so the previous page's canonical,
    // hreflang set and og:url have to go before this page's identity is declared — otherwise a
    // noindex page keeps naming the indexable URL the visitor came from.
    this.clearCanonicalIdentity();

    // A page that must not be indexed has no canonical identity to declare, and the 404
    // document is served under arbitrary URLs where a canonical, og:url or hreflang set
    // would name a URL that is not the one being viewed.
    if (seo.noIndex) {
      return;
    }

    const canonical = this.absoluteUrl(locale.subPath, routePath);

    this.setPropertyTags({ 'og:url': canonical });
    this.appendLink({ rel: 'canonical', href: canonical });

    for (const entry of LOCALES) {
      this.appendLink({
        rel: 'alternate',
        hreflang: entry.hreflang,
        href: this.absoluteUrl(entry.subPath, routePath),
      });
    }

    this.appendLink({
      rel: 'alternate',
      hreflang: 'x-default',
      href: this.absoluteUrl(X_DEFAULT_LOCALE.subPath, routePath),
    });
  }

  // The prerendered head already carries every block this writes, so the client updates the
  // existing script in place. Appending would double each block on hydration.
  setJsonLd(id: string, data: unknown): void {
    const existing = this.document.head.querySelector(`script[data-json-ld="${id}"]`);
    const script = existing ?? this.document.createElement('script');

    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-json-ld', id);
    script.textContent = JSON.stringify(data);

    if (!existing) {
      this.document.head.appendChild(script);
    }
  }

  removeJsonLd(id: string): void {
    this.document.head.querySelector(`script[data-json-ld="${id}"]`)?.remove();
  }

  private clearCanonicalIdentity(): void {
    this.meta.removeTag(`property='og:url'`);

    for (const link of this.document.head.querySelectorAll(
      'link[rel="canonical"], link[rel="alternate"]',
    )) {
      link.remove();
    }
  }

  private absoluteUrl(subPath: string, routePath: string): string {
    const segments = [subPath, routePath].filter(Boolean).join('/');

    return segments ? `${SITE.origin}/${segments}/` : `${SITE.origin}/`;
  }

  private setNamedTags(tags: Record<string, string>): void {
    for (const [name, content] of Object.entries(tags)) {
      this.meta.updateTag({ name, content }, `name='${name}'`);
    }
  }

  private setPropertyTags(tags: Record<string, string>): void {
    for (const [property, content] of Object.entries(tags)) {
      this.meta.updateTag({ property, content }, `property='${property}'`);
    }
  }

  private appendLink(attributes: Record<string, string>): void {
    const link = this.document.createElement('link');

    for (const [name, value] of Object.entries(attributes)) {
      link.setAttribute(name, value);
    }

    this.document.head.appendChild(link);
  }
}
