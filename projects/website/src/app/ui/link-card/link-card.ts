import { Component, input } from '@angular/core';

export type LinkCardTone = 'light' | 'dark';

@Component({
  selector: 'bfs-link-card',
  host: { class: 'contents' },
  templateUrl: './link-card.html',
})
export class LinkCard {
  readonly tone = input.required<LinkCardTone>();
  readonly href = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly heading = input.required<string>();
  readonly ctaLabel = input.required<string>();
  readonly handle = input<string | null>(null);
  readonly headingLevel = input<2 | 3>(3);
}
