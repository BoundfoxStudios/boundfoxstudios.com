import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SiteFooter } from './layout/site-footer/site-footer';
import { SiteHeader } from './layout/site-header/site-header';

@Component({
  selector: 'bfs-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteHeader, RouterOutlet, SiteFooter],
  templateUrl: './app.html',
})
export class App {}
