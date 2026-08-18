import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bfs-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './not-found.html',
})
export class NotFound {}
