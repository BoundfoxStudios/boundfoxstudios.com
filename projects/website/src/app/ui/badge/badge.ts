import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeVariant = 'amber' | 'outline';

@Component({
  selector: 'bfs-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.html',
})
export class Badge {
  readonly variant = input.required<BadgeVariant>();
}
