import { inject, Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { resolvePageSeo } from './resolve-page-seo';
import { SeoService } from './seo.service';

@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(state: RouterStateSnapshot): void {
    const pageSeo = resolvePageSeo(state.root);

    if (!pageSeo) {
      return;
    }

    // `state.url` is already base-href-relative, so the same expression yields `support`
    // under German and under English, and the locale supplies the `/en` prefix.
    const routePath = state.url.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');

    this.seo.apply(pageSeo, routePath);
  }
}
