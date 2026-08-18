import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'bfs-pill-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pill-link.html',
})
export class PillLink {
  readonly href = input.required<string>();
}
