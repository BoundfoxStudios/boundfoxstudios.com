import { Component } from '@angular/core';

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
}
