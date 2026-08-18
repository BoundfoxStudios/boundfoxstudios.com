import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ArrowLink } from '../../ui/arrow-link/arrow-link';
import { SectionHead } from '../../ui/section-head/section-head';

@Component({
  selector: 'bfs-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ArrowLink, SectionHead],
  templateUrl: './not-found.html',
})
export class NotFound {}
