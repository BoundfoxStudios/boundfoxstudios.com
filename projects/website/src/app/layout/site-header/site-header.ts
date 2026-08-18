import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LocaleLinks } from '../../seo/locale-links';
import { BrandLockup } from '../../ui/brand-lockup/brand-lockup';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { LanguageSwitcher } from './language-switcher';

@Component({
  selector: 'bfs-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, BrandLockup, LanguageSwitcher, MobileMenu],
  templateUrl: './site-header.html',
})
export class SiteHeader {
  protected readonly localeLinks = inject(LocaleLinks);
}
