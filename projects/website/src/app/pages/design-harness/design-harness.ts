import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';

// Throwaway M2 harness: it exists so the design-system pieces can be looked at in a real build
// before any page consumes them. The UI-primitives issue deletes it again.
@Component({
  selector: 'bfs-design-harness',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  templateUrl: './design-harness.html',
})
export class DesignHarness {
  private readonly meta = inject(Meta);

  constructor() {
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }
}
