import { ChangeDetectionStrategy, Component } from '@angular/core';

import { socialLink, SocialLink } from '../../data/social-links';
import { BrandIcon } from '../../ui/brand-icon/brand-icon';
import { LinkCard } from '../../ui/link-card/link-card';
import { SectionHead } from '../../ui/section-head/section-head';

interface SocialChannel extends SocialLink {
  readonly description: string;
  readonly ctaLabel: string;
  readonly ariaLabel: string;
}

// Names, handles and URLs come from the one shared list; only the page-specific copy lives here.
const CHANNELS: readonly SocialChannel[] = [
  {
    ...socialLink('github'),
    description: $localize`:@@socials.channels.github.description:Unsere Open-Source-Projekte: Code lesen, Issues melden, mitentwickeln.`,
    ctaLabel: $localize`:@@socials.channels.github.cta:Zur Organisation`,
    ariaLabel: $localize`:@@socials.channels.github.aria:GitHub – zur Organisation`,
  },
  {
    ...socialLink('discord'),
    description: $localize`:@@socials.channels.discord.description:Unsere Community: Hilfe bei deinen Projekten, Feedback und Austausch mit anderen Entwickler:innen.`,
    ctaLabel: $localize`:@@socials.channels.discord.cta:Server beitreten`,
    ariaLabel: $localize`:@@socials.channels.discord.aria:Discord – Server beitreten`,
  },
  {
    ...socialLink('youtube'),
    description: $localize`:@@socials.channels.youtube.description:Kostenlose Kurse und Tutorials zu Unity, Blender und Spieleentwicklung — auf Deutsch.`,
    ctaLabel: $localize`:@@socials.channels.youtube.cta:Kanal öffnen`,
    ariaLabel: $localize`:@@socials.channels.youtube.aria:YouTube – Kanal öffnen`,
  },
];

@Component({
  selector: 'bfs-socials-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BrandIcon, LinkCard, SectionHead],
  templateUrl: './socials.html',
})
export class Socials {
  protected readonly channels = CHANNELS;
}
