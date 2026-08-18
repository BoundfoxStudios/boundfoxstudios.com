import { Component, input } from '@angular/core';

import { LocaleLink } from '../../seo/locale-links';

@Component({
  selector: 'bfs-language-switcher',
  templateUrl: './language-switcher.html',
})
export class LanguageSwitcher {
  readonly links = input.required<readonly LocaleLink[]>();
}
