import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';

import { BrandIcon, BrandIconName } from '../../ui/brand-icon/brand-icon';

// Throwaway M2 harness: it exists so the design-system pieces can be looked at in a real build
// before any page consumes them. The UI-primitives issue deletes it again.
@Component({
  selector: 'bfs-design-harness',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, BrandIcon],
  templateUrl: './design-harness.html',
})
export class DesignHarness {
  protected readonly brandIconNames: readonly BrandIconName[] = [
    'github',
    'discord',
    'youtube',
    'kofi',
    'patreon',
  ];

  protected readonly brandIconSizes: readonly number[] = [20, 22, 24, 32];

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex' });
  }
}
