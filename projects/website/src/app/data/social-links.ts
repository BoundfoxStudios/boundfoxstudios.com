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
