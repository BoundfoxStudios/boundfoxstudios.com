import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const OUTPUT_PATH = resolve(
  process.argv[2] ?? 'projects/website/src/app/generated/github-data.json',
);

const token = process.env.GITHUB_TOKEN;

const request = async (path, { allow404 = false } = {}) => {
  const url = `https://api.github.com/${path}`;
  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'boundfoxstudios.com-build',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 404 && allow404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `GitHub API ${response.status} ${response.statusText} for ${url}\n${await response.text()}`,
    );
  }

  return response.json();
};

const repositoryCard = async fullName => {
  const repository = await request(`repos/${fullName}`);

  return {
    description: repository.description,
    language: repository.language,
    pushedAt: repository.pushed_at,
    stars: repository.stargazers_count,
  };
};

// lehrgrapht's releases/latest is a genuine 404 — it has tags but no releases.
const latestRelease = async fullName => {
  const release = await request(`repos/${fullName}/releases/latest`, { allow404: true });
  return release && { tagName: release.tag_name, publishedAt: release.published_at };
};

const latestTag = async fullName => {
  const tags = await request(`repos/${fullName}/tags?per_page=1`);
  return tags[0] ? { name: tags[0].name } : null;
};

const [lehrgrapht, mat, flugwacht, lehrgraphtTag, matRelease, flugwachtRelease] = await Promise.all(
  [
    repositoryCard('BoundfoxStudios/lehrgrapht'),
    repositoryCard('BoundfoxStudios/mat'),
    repositoryCard('BoundfoxStudios/flugwacht'),
    latestTag('BoundfoxStudios/lehrgrapht'),
    latestRelease('BoundfoxStudios/mat'),
    latestRelease('BoundfoxStudios/flugwacht'),
  ],
);

const data = {
  generatedAt: new Date().toISOString(),
  lehrgrapht: { ...lehrgrapht, latestTag: lehrgraphtTag },
  mat: { ...mat, latestRelease: matRelease },
  flugwacht: { ...flugwacht, latestRelease: flugwachtRelease },
};

if (!data.lehrgrapht.latestTag) {
  throw new Error('lehrgrapht has no tags — refusing to write incomplete data');
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`);

console.log(`Wrote ${OUTPUT_PATH}`);
console.log(`  lehrgrapht tag:    ${data.lehrgrapht.latestTag?.name ?? '(none)'}`);
console.log(`  mat release:       ${data.mat.latestRelease?.tagName ?? '(none)'}`);
console.log(`  flugwacht release: ${data.flugwacht.latestRelease?.tagName ?? '(none)'}`);
