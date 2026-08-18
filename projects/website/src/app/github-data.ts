import data from './generated/github-data.json';

export interface RepositoryCard {
  description: string | null;
  language: string | null;
  pushedAt: string;
  stars: number;
}

export interface ReleaseInfo {
  tagName: string;
  publishedAt: string;
}

export interface GitHubData {
  generatedAt: string;
  lehrgrapht: RepositoryCard & { latestTag: { name: string } | null };
  mat: RepositoryCard & { latestRelease: ReleaseInfo | null };
  flugwacht: RepositoryCard & { latestRelease: ReleaseInfo | null };
}

// The annotation is load-bearing: without it the JSON's inferred literal type absorbs any
// shape change from the prebuild script and the site ships wrong data with a green build.
export const gitHubData: GitHubData = data;
