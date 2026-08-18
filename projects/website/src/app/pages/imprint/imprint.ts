import { Component, inject, LOCALE_ID } from '@angular/core';

import { LegalPage } from '../../ui/legal-page/legal-page';

@Component({
  selector: 'bfs-imprint',
  imports: [LegalPage],
  templateUrl: './imprint.html',
})
export class Imprint {
  private readonly localeId = inject(LOCALE_ID);

  protected readonly isGermanLocale = this.localeId.startsWith('de');
}
