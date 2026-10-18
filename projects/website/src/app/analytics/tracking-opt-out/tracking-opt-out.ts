import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { AnalyticsService, TrackingStatus } from '../analytics.service';

const STATUS_TEXTS: Record<TrackingStatus, string> = {
  unknown:
    'Der Status der Reichweitenmessung erscheint hier, sobald die Seite vollständig geladen ist. Ohne JavaScript findet keine Reichweitenmessung statt.',
  off: 'Ihr Besuch auf dieser Internetseite wird derzeit nicht erfasst.',
  on: 'Ihr Besuch auf dieser Internetseite wird derzeit erfasst.',
  'opted-out':
    'Sie haben der Erfassung widersprochen. Ihr Besuch auf dieser Internetseite wird nicht erfasst.',
  'on-next-load':
    'Sie haben Ihren Widerspruch zurückgenommen. Die Erfassung beginnt wieder, sobald Sie die Seite neu laden.',
};

const BUTTON_LABELS: Partial<Record<TrackingStatus, string>> = {
  on: 'Erfassung widersprechen',
  'opted-out': 'Widerspruch zurücknehmen',
};

@Component({
  selector: 'bfs-tracking-opt-out',
  host: { class: 'block' },
  templateUrl: './tracking-opt-out.html',
})
export class TrackingOptOut {
  private readonly analytics = inject(AnalyticsService);
  private readonly rendered = signal(false);
  private readonly clicked = signal(false);
  private readonly statusParagraph =
    viewChild.required<ElementRef<HTMLParagraphElement>>('statusParagraph');

  protected readonly shownStatus = computed(() =>
    this.rendered() ? this.analytics.status() : 'unknown',
  );
  protected readonly statusText = computed(() => STATUS_TEXTS[this.shownStatus()]);
  protected readonly buttonLabel = computed(() => BUTTON_LABELS[this.shownStatus()]);
  protected readonly announcement = computed(() => (this.clicked() ? this.statusText() : ''));

  constructor() {
    afterNextRender(() => {
      this.rendered.set(true);
    });
  }

  protected changeObjection(): void {
    if (this.shownStatus() === 'on') {
      this.analytics.optOut();
    } else {
      this.analytics.revokeOptOut();
      this.statusParagraph().nativeElement.focus();
    }

    this.clicked.set(true);
  }
}
