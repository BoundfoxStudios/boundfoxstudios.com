import { Component, input } from '@angular/core';

export type BrandIconName = 'github' | 'discord' | 'youtube' | 'kofi' | 'patreon';

@Component({
  selector: 'bfs-brand-icon',
  templateUrl: './brand-icon.html',
})
export class BrandIcon {
  readonly name = input.required<BrandIconName>();
  readonly size = input(24);
}
