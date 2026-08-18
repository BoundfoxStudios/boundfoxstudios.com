import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SOCIAL_LINKS } from '../../data/social-links';
import { LocaleLinks } from '../../seo/locale-links';
import { BrandIcon } from '../../ui/brand-icon/brand-icon';
import { BrandLockup } from '../../ui/brand-lockup/brand-lockup';

@Component({
  selector: 'bfs-site-footer',
  imports: [RouterLink, BrandLockup, BrandIcon],
  templateUrl: './site-footer.html',
})
export class SiteFooter {
  private readonly localeLinks = inject(LocaleLinks);

  protected readonly socialLinks = SOCIAL_LINKS;
  protected readonly languageLinks = this.localeLinks.links;
  protected readonly currentYear = signal(new Date().getFullYear());
}
