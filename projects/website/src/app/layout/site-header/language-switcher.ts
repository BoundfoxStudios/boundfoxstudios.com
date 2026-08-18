import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { LocaleLink } from '../../seo/locale-links';

@Component({
  selector: 'bfs-language-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './language-switcher.html',
})
export class LanguageSwitcher {
  readonly links = input.required<readonly LocaleLink[]>();
}
