import { Component } from '@angular/core';

import { socialLink } from '../../data/social-links';
import { BrandIcon, BrandIconName } from '../../ui/brand-icon/brand-icon';
import { LinkCard } from '../../ui/link-card/link-card';
import { SectionHead } from '../../ui/section-head/section-head';

interface SupportWay {
  readonly id: BrandIconName;
  readonly href: string;
  readonly titleText: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly ariaLabel: string;
}

// The five ways carry German in TypeScript rather than in the template, because
// `docs/decisions.md` M5 › Support › Card component prescribes the typed array and the issue
// forbids five duplicated template blocks. Every string keeps its explicit `@@id`, so
// `ng extract-i18n` picks them up exactly as it does template markers.
const FREE_WAYS: readonly SupportWay[] = [
  {
    id: 'github',
    href: socialLink('github').href,
    titleText: 'GitHub',
    description: $localize`:@@support.free.github.description:Vergib Stars, melde Fehler, schlag Features vor — oder bring dich direkt mit Pull Requests in unsere Open-Source-Projekte ein.`,
    ctaLabel: $localize`:@@support.free.github.cta:Zur Organisation`,
    ariaLabel: $localize`:@@support.free.github.aria:GitHub – zur Organisation`,
  },
  {
    id: 'discord',
    href: socialLink('discord').href,
    titleText: 'Discord',
    description: $localize`:@@support.free.discord.description:Sei im Discord aktiv, rege Diskussionen an und hilf anderen aus der Community — genau dafür ist er da.`,
    ctaLabel: $localize`:@@support.free.discord.cta:Server beitreten`,
    ariaLabel: $localize`:@@support.free.discord.aria:Discord – Server beitreten`,
  },
  {
    id: 'youtube',
    href: socialLink('youtube').href,
    titleText: 'YouTube',
    description: $localize`:@@support.free.youtube.description:Schau unsere Videos, like und kommentiere sie — so werden sie von YouTube besser gefunden und erreichen mehr Leute.`,
    ctaLabel: $localize`:@@support.free.youtube.cta:Kanal öffnen`,
    ariaLabel: $localize`:@@support.free.youtube.aria:YouTube – Kanal öffnen`,
  },
];

const FINANCIAL_WAYS: readonly SupportWay[] = [
  {
    id: 'kofi',
    href: 'https://ko-fi.com/boundfoxstudios',
    titleText: 'Ko-fi',
    description: $localize`:@@support.financial.kofi.description:Spendier uns einen Kaffee — einmalig oder monatlich, ganz ohne Verpflichtung.`,
    ctaLabel: $localize`:@@support.financial.kofi.cta:Kaffee spendieren`,
    ariaLabel: $localize`:@@support.financial.kofi.aria:Ko-fi – Kaffee spendieren`,
  },
  {
    id: 'patreon',
    href: 'https://www.patreon.com/boundfoxstudios',
    titleText: 'Patreon',
    description: $localize`:@@support.financial.patreon.description:Unterstütze uns mit einem monatlichen Beitrag deiner Wahl und begleite unsere Projekte langfristig.`,
    ctaLabel: $localize`:@@support.financial.patreon.cta:Patron werden`,
    ariaLabel: $localize`:@@support.financial.patreon.aria:Patreon – Patron werden`,
  },
];

@Component({
  selector: 'bfs-support-page',
  imports: [BrandIcon, LinkCard, SectionHead],
  templateUrl: './support.html',
})
export class Support {
  protected readonly freeWays = FREE_WAYS;
  protected readonly financialWays = FINANCIAL_WAYS;
}
