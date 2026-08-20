import { Component, DestroyRef, inject } from '@angular/core';

import { appEntry, repositoryUrl } from '../../data/apps';
import { repositoryVersions } from '../../github-data';
import { appsItemListJsonLd } from '../../seo/json-ld';
import { SeoService } from '../../seo/seo.service';
import { ArrowLink } from '../../ui/arrow-link/arrow-link';
import { Badge } from '../../ui/badge/badge';
import { ButtonPrimary } from '../../ui/button-primary/button-primary';
import { FeatureCard } from '../../ui/feature-card/feature-card';
import { ProjectCard } from '../../ui/project-card/project-card';
import { SectionHead } from '../../ui/section-head/section-head';

@Component({
  selector: 'bfs-apps-and-games-page',
  imports: [ArrowLink, Badge, ButtonPrimary, FeatureCard, ProjectCard, SectionHead],
  templateUrl: './apps-and-games.html',
})
export class AppsAndGames {
  protected readonly versions = repositoryVersions;
  protected readonly lehrgrapht = appEntry('lehrgrapht');
  protected readonly lehrgraphtRepository = repositoryUrl('lehrgrapht');
  protected readonly matRepository = repositoryUrl('mat');
  protected readonly flugwachtRepository = repositoryUrl('flugwacht');
  protected readonly bugABall = appEntry('bug-a-ball');

  constructor() {
    const seo = inject(SeoService);

    seo.setJsonLd('apps', appsItemListJsonLd());
    // The list describes this page only; without this the block would survive a client-side
    // navigation and claim four products on /support/.
    inject(DestroyRef).onDestroy(() => {
      seo.removeJsonLd('apps');
    });
  }
}
