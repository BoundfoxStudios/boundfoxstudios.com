import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
} from '@angular/core';

import { Card } from '../card/card';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const utcDayIndex = (date: Date): number =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / MILLISECONDS_PER_DAY;

@Component({
  selector: 'bfs-repository-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  imports: [Card],
  templateUrl: './repository-card.html',
})
export class RepositoryCard {
  // LOCALE_ID is a compile-time constant, not a service: the presentational rule still holds.
  private readonly locale = inject(LOCALE_ID);

  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly language = input<string | null>(null);
  readonly version = input<string | null>(null);
  readonly updatedAt = input.required<string>();

  protected readonly versionLabel = computed(
    () => this.version() ?? $localize`:@@common.badge.in-development:In Entwicklung`,
  );

  protected readonly relativeLabel = computed(() => {
    // Whole UTC calendar days, so a push six hours ago reads `heute` rather than `vor 0 Tagen`;
    // clamped at 0 because the nightly rebuild can run before the pushed timestamp on clock skew.
    const days = Math.min(0, utcDayIndex(new Date(this.updatedAt())) - utcDayIndex(new Date()));

    return new Intl.RelativeTimeFormat(this.locale, { numeric: 'auto' }).format(days, 'day');
  });
}
