import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Kicker } from '../kicker/kicker';

export type SectionHeadVariant = 'page' | 'section';
export type SectionHeadSize = 'display-md' | 'display-sm';

const BOTTOM_MARGIN_CLASSES: Record<0 | 24 | 28 | 32, string> = {
  0: '',
  24: 'mb-6',
  28: 'mb-7',
  32: 'mb-8',
};

@Component({
  selector: 'bfs-section-head',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  imports: [Kicker, NgTemplateOutlet],
  templateUrl: './section-head.html',
})
export class SectionHead {
  readonly variant = input<SectionHeadVariant>('section');
  readonly size = input<SectionHeadSize>('display-sm');
  readonly heading = input.required<string>();
  readonly headingLevel = input<1 | 2 | 3 | null>(null);
  readonly kicker = input<string | null>(null);
  readonly lead = input<string | null>(null);
  readonly leadMaxWidth = input<560 | 620>(560);
  readonly subline = input<string | null>(null);
  readonly bottomMargin = input<0 | 24 | 28 | 32>(0);

  protected readonly level = computed(
    () => this.headingLevel() ?? (this.variant() === 'page' ? 1 : 2),
  );

  protected readonly hasRule = computed(
    () => this.variant() === 'section' && this.size() === 'display-sm',
  );

  protected readonly rowClass = computed(() => {
    const layout = this.hasRule()
      ? 'flex items-center gap-4'
      : 'flex flex-wrap items-end justify-between gap-6';
    const margin = this.subline() ? 'mb-2' : BOTTOM_MARGIN_CLASSES[this.bottomMargin()];

    return `${layout} ${margin}`;
  });

  protected readonly headingSizeClass = computed(() => {
    if (this.variant() === 'page') {
      return 'text-[clamp(40px,5.5vw,60px)]';
    }

    return this.size() === 'display-md' ? 'text-4xl' : 'text-2xl';
  });
}
