import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Kicker } from '../kicker/kicker';

@Component({
  selector: 'bfs-feature-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  imports: [Kicker],
  templateUrl: './feature-card.html',
})
export class FeatureCard {
  readonly kicker = input.required<string>();
  readonly title = input.required<string>();
  readonly platforms = input.required<string>();
  readonly headingLevel = input<2 | 3>(3);
}
