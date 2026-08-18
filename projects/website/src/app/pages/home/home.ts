import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouterLink } from '@angular/router';

import { ArrowLink } from '../../ui/arrow-link/arrow-link';
import { Badge } from '../../ui/badge/badge';
import { PillLink } from '../../ui/pill-link/pill-link';
import { ProjectCard } from '../../ui/project-card/project-card';
import { RepositoryCards } from '../../ui/repository-card/repository-cards';
import { SectionHead } from '../../ui/section-head/section-head';

@Component({
  selector: 'bfs-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ArrowLink, Badge, PillLink, ProjectCard, RepositoryCards, RouterLink, SectionHead],
  templateUrl: './home.html',
})
export class Home {}
