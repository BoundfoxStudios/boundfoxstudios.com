import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';

export type KickerVariant = 'block' | 'inline';

@Component({
  selector: 'bfs-kicker',
  imports: [NgTemplateOutlet],
  templateUrl: './kicker.html',
})
export class Kicker {
  readonly variant = input<KickerVariant>('block');
}
