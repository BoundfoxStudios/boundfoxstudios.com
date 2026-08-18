import { DatePipe } from '@angular/common';
import { Component, inject, LOCALE_ID } from '@angular/core';

import { LegalPage } from '../../ui/legal-page/legal-page';
import { PRIVACY_LAST_UPDATED } from './privacy-last-updated';

@Component({
  selector: 'bfs-privacy-policy',
  imports: [DatePipe, LegalPage],
  templateUrl: './privacy-policy.html',
})
export class PrivacyPolicy {
  private readonly localeId = inject(LOCALE_ID);

  protected readonly isGermanLocale = this.localeId.startsWith('de');
  protected readonly lastUpdated = PRIVACY_LAST_UPDATED;
}
