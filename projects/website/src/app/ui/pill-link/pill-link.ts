import { Component, input } from '@angular/core';

@Component({
  selector: 'bfs-pill-link',
  templateUrl: './pill-link.html',
})
export class PillLink {
  readonly href = input.required<string>();
  readonly newTab = input(false);
}
