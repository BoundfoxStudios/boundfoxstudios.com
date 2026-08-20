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

// LehrGrapht tags its releases `1.7.0` and MAT tags them `v1.0.0`; every card renders the same
// form, so the prefix is normalised here rather than per template.
const versionLabel = (tag: string | null | undefined): string | null =>
  tag ? `v${tag.replace(/^v/, '')}` : null;

export const repositoryVersions = {
  lehrgrapht: versionLabel(gitHubData.lehrgrapht.latestTag?.name),
  mat: versionLabel(gitHubData.mat.latestRelease?.tagName),
  flugwacht: versionLabel(gitHubData.flugwacht.latestRelease?.tagName),
} as const;
