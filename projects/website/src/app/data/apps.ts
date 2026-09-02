import { SITE } from '../seo/site.config';

export type AppSlug = 'lehrgrapht' | 'mat' | 'flugwacht' | 'geodart' | 'bug-a-ball';

export interface AppEntry {
  readonly slug: AppSlug;
  readonly name: string;
  readonly description: string;
  readonly type: 'SoftwareApplication' | 'VideoGame';
  readonly applicationCategory: string;
  readonly operatingSystem: string;
  readonly url: string;
  readonly codeRepository?: string;
}

// Product names are never translated (Conventions › Brand and typography); the descriptions reuse
// the ids the cards already render, so the structured data and the page cannot drift apart. MAT is
// the exception: its rendered description embeds a `<span class="font-mono">cat</span>`, which
// extraction turns into a placeholder, so the catalog carries a plain-text sibling id.
export const APPS: readonly AppEntry[] = [
  {
    slug: 'lehrgrapht',
    name: 'LehrGrapht',
    description: $localize`:@@apps-and-games.apps.lehrgrapht.description:Maßstabsgetreue Plots für Lehrkräfte, passgenau auf 5×5-mm-Karopapier: Funktionen, Punkte, Flächen, Schrägbilder, Spiegelungen — und mit einem Schalter vom Arbeitsblatt zum Lösungsblatt.`,
    type: 'SoftwareApplication',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Windows, macOS, iPadOS',
    url: 'https://lehrgrapht.de/',
    codeRepository: 'https://github.com/BoundfoxStudios/lehrgrapht',
  },
  {
    slug: 'mat',
    name: 'MAT',
    description: $localize`:@@apps-and-games.apps.mat.description-plain:Markdown-Vorschau direkt aus dem Terminal — gerendert wie auf GitHub, inklusive Mermaid, KaTeX und Syntax-Highlighting. Kein Server, keine Konfiguration: so beiläufig wie cat.`,
    type: 'SoftwareApplication',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'macOS, Linux, Windows',
    url: 'https://github.com/BoundfoxStudios/mat',
    codeRepository: 'https://github.com/BoundfoxStudios/mat',
  },
  {
    slug: 'flugwacht',
    name: 'Flugwacht',
    description: $localize`:@@apps-and-games.apps.flugwacht.description:Bewusst minimaler Flug-Tracker für einzelne Flüge: Flugnummer und Datum eintragen, am Reisetag live auf der Karte verfolgen — mit Ankunftszeit in beiden Zeitzonen. Ohne Konto, alles bleibt auf deinem Gerät.`,
    type: 'SoftwareApplication',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'iOS, Android',
    url: 'https://flugwacht.app/',
    codeRepository: 'https://github.com/BoundfoxStudios/flugwacht',
  },
  {
    slug: 'geodart',
    name: 'Geodart',
    description: $localize`:@@apps-and-games.games.geodart.description:Geographie-Quiz mit Dartwurf: Ein Ziel wird genannt (Stadt, Fluss, Gipfel oder See), und du tippst die Stelle innerhalb der Zeit auf der Karte an. Punkte gibt es für Genauigkeit, Kategorie und Tempo. Zehn Fragen pro Runde, komplett offline.`,
    type: 'VideoGame',
    applicationCategory: 'GameApplication',
    operatingSystem: 'iOS, Android',
    url: 'https://geodart.app/',
  },
  {
    slug: 'bug-a-ball',
    name: 'Bug-A-Ball',
    description: $localize`:@@apps-and-games.games.bug-a-ball.description:In Bug-A-Ball rollst du dich durch verschiedene Level und Welten, vorbei an kniffligen Hindernissen. Schalte exklusive Skins frei und zeig allen auf der Bestenliste, wer hier der Profi ist.`,
    type: 'VideoGame',
    applicationCategory: 'GameApplication',
    operatingSystem: 'iOS, Android',
    url: 'https://bugaball.com/',
  },
];

export const appEntry = (slug: AppSlug): AppEntry => {
  const entry = APPS.find(candidate => candidate.slug === slug);

  if (!entry) {
    throw new Error(`apps.ts has no entry for ${slug}`);
  }

  return entry;
};

export const repositoryUrl = (slug: AppSlug): string => {
  const { codeRepository } = appEntry(slug);

  if (!codeRepository) {
    throw new Error(`apps.ts has no repository for ${slug}`);
  }

  return codeRepository;
};

export const appId = (slug: AppSlug): string => `${SITE.origin}/apps-and-games/#${slug}`;
