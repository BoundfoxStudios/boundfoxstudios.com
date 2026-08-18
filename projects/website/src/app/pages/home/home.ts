import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bfs-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {}
