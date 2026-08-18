import { Component, input } from '@angular/core';

@Component({
  selector: 'bfs-legal-page',
  host: { class: 'contents' },
  templateUrl: './legal-page.html',
})
export class LegalPage {
  readonly proseLang = input<string | null>(null);
}
