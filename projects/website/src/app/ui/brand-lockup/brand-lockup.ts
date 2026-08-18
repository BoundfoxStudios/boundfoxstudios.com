import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const MARK_SOURCES: Record<32 | 40, string> = {
  32: 'images/fox-head-64.webp',
  40: 'images/fox-head-80.webp',
};

@Component({
  selector: 'bfs-brand-lockup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  host: { class: 'contents' },
  templateUrl: './brand-lockup.html',
})
export class BrandLockup {
  readonly markSize = input<32 | 40>(32);
  readonly nowrap = input(true);
  readonly priority = input(false);

  protected readonly markSource = computed(() => MARK_SOURCES[this.markSize()]);
}
