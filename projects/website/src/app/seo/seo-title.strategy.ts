import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { SeoService } from './seo.service';
import { PageSeo } from './seo.types';

@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(state: RouterStateSnapshot): void {
    const pageSeo = this.resolveSeo(state.root);

    if (!pageSeo) {
      return;
    }

    // `state.url` is already base-href-relative, so the same expression yields `support`
    // under German and under English, and the locale supplies the `/en` prefix.
    const routePath = state.url.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');

    this.seo.apply(pageSeo, routePath);
  }

  private resolveSeo(route: ActivatedRouteSnapshot): PageSeo | undefined {
    let current: ActivatedRouteSnapshot | null = route;
    let found: PageSeo | undefined;

    while (current) {
      found = (current.data['seo'] as PageSeo | undefined) ?? found;
      current = current.firstChild;
    }

    return found;
  }
}
