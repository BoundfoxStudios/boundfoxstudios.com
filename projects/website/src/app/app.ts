import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SiteFooter } from './layout/site-footer/site-footer';
import { SiteHeader } from './layout/site-header/site-header';
import { organizationJsonLd, webSiteJsonLd } from './seo/json-ld';
import { SeoService } from './seo/seo.service';

@Component({
  selector: 'bfs-root',
  imports: [SiteHeader, RouterOutlet, SiteFooter],
  templateUrl: './app.html',
})
export class App {
  constructor() {
    const seo = inject(SeoService);

    seo.setJsonLd('organization', organizationJsonLd());
    seo.setJsonLd('website', webSiteJsonLd());
  }
}
