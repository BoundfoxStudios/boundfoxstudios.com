import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';

const CONTAINER_BASE_CLASS =
  'relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md';

@Component({
  selector: 'bfs-card',
  host: { class: 'contents' },
  imports: [NgTemplateOutlet],
  templateUrl: './card.html',
})
export class Card {
  readonly eyebrow = input<string | null>(null);
  readonly title = input.required<string>();
  readonly headingLevel = input<2 | 3>(3);
  readonly hasFooter = input(false);
  readonly href = input<string | null>(null);
  readonly linkAriaLabel = input<string | null>(null);

  protected readonly containerClass = computed(() =>
    this.href()
      ? `${CONTAINER_BASE_CLASS} transition-shadow duration-150 ease-in-out hover:shadow-lg`
      : CONTAINER_BASE_CLASS,
  );
}
