import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ArrowLinkVariant = 'body' | 'display';

@Component({
  selector: 'bfs-arrow-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './arrow-link.html',
})
export class ArrowLink {
  readonly route = input<string | null>(null);
  readonly href = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly newTab = input(false);
  readonly variant = input<ArrowLinkVariant>('body');
}
