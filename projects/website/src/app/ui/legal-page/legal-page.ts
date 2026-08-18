import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'bfs-legal-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './legal-page.html',
})
export class LegalPage {
  readonly proseLang = input<string | null>(null);
}
