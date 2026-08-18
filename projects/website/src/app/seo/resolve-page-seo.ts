import { ActivatedRouteSnapshot } from '@angular/router';

import { PageSeo } from './seo.types';

export function resolvePageSeo(root: ActivatedRouteSnapshot): PageSeo | undefined {
  let current: ActivatedRouteSnapshot | null = root;
  let found: PageSeo | undefined;

  while (current) {
    found = (current.data['seo'] as PageSeo | undefined) ?? found;
    current = current.firstChild;
  }

  return found;
}
