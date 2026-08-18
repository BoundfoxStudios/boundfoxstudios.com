import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ArrowLink } from '../../ui/arrow-link/arrow-link';
import { Badge } from '../../ui/badge/badge';
import { ButtonPrimary } from '../../ui/button-primary/button-primary';
import { FeatureCard } from '../../ui/feature-card/feature-card';
import { ProjectCard } from '../../ui/project-card/project-card';
import { SectionHead } from '../../ui/section-head/section-head';

@Component({
  selector: 'bfs-apps-and-games-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ArrowLink, Badge, ButtonPrimary, FeatureCard, ProjectCard, SectionHead],
  templateUrl: './apps-and-games.html',
})
export class AppsAndGames {}
