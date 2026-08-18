import { BrandIconName } from '../ui/brand-icon/brand-icon';

export interface SocialLink {
  readonly id: BrandIconName;
  readonly name: string;
  readonly handle: string;
  readonly href: string;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    id: 'github',
    name: 'GitHub',
    handle: 'github.com/BoundfoxStudios',
    href: 'https://github.com/BoundfoxStudios',
  },
  {
    id: 'discord',
    name: 'Discord',
    handle: 'discord.gg/tHqNzMT',
    href: 'https://discord.gg/tHqNzMT',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: 'youtube.com/c/boundfox',
    href: 'https://youtube.com/c/boundfox',
  },
];

// Home and Support link to the same three channels without re-typing a URL: a handle or href
// exists exactly once, so `Organization.sameAs` (M8) can never disagree with what a page renders.
// A missing entry throws during prerendering rather than shipping an empty href.
export const socialLink = (id: BrandIconName): SocialLink => {
  const link = SOCIAL_LINKS.find(entry => entry.id === id);

  if (!link) {
    throw new Error(`social-links.ts has no entry for ${id}`);
  }

  return link;
};
