import { Component } from '@angular/core';

import { repositoryUrl } from '../../data/apps';
import { gitHubData, repositoryVersions } from '../../github-data';
import { RepositoryCard } from './repository-card';

@Component({
  selector: 'bfs-repository-cards',
  host: { class: 'contents' },
  imports: [RepositoryCard],
  templateUrl: './repository-cards.html',
})
export class RepositoryCards {
  protected readonly versions = repositoryVersions;
  protected readonly lehrgrapht = gitHubData.lehrgrapht;
  protected readonly mat = gitHubData.mat;
  protected readonly flugwacht = gitHubData.flugwacht;
  protected readonly lehrgraphtRepository = repositoryUrl('lehrgrapht');
  protected readonly matRepository = repositoryUrl('mat');
  protected readonly flugwachtRepository = repositoryUrl('flugwacht');
}
