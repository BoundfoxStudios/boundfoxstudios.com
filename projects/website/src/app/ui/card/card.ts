import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'bfs-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './card.html',
})
export class Card {
  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly headingLevel = input<2 | 3>(3);
  readonly hasFooter = input(false);
}
