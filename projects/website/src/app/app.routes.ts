import { Routes } from '@angular/router';

import { PageSeo } from './seo/seo.types';

const seo = (page: PageSeo): { seo: PageSeo } => ({ seo: page });

const notFoundSeo = (): { seo: PageSeo } =>
  seo({
    title: $localize`:@@seo.not-found.title:Seite nicht gefunden – Boundfox Studios`,
    description: $localize`:@@seo.not-found.description:Diese Seite gibt es nicht mehr oder hat nie existiert. Von hier kommst du zurück zur Startseite, zu den Projekten oder in die Community.`,
    noIndex: true,
  });

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(module => module.Home),
    data: seo({
      title: $localize`:@@seo.home.title:Boundfox Studios – kostenlose Apps und Spiele`,
      description: $localize`:@@seo.home.description:Wir entwickeln Apps und Spiele in Stuttgart — kostenlos, vieles davon Open Source. Schau dir an, woran wir bauen und wie du uns unterstützen kannst.`,
    }),
  },
  {
    path: 'apps-and-games',
    loadComponent: () =>
      import('./pages/apps-and-games/apps-and-games').then(module => module.AppsAndGames),
    data: seo({
      title: $localize`:@@seo.apps-and-games.title:Apps & Spiele – Boundfox Studios`,
      description: $localize`:@@seo.apps-and-games.description:Alle Apps und Spiele von Boundfox Studios: LehrGrapht, MAT, Flugwacht und Bug-A-Ball — kostenlos, vieles davon Open Source.`,
    }),
  },
  {
    path: 'support',
    loadComponent: () => import('./pages/support/support').then(module => module.Support),
    data: seo({
      title: $localize`:@@seo.support.title:Unterstützen – Boundfox Studios`,
      description: $localize`:@@seo.support.description:So kannst du uns unterstützen: Stars und Pull Requests auf GitHub, Discord, YouTube — oder finanziell über Ko-fi und Patreon. Vieles kostet nichts.`,
    }),
  },
  {
    path: 'socials',
    loadComponent: () => import('./pages/socials/socials').then(module => module.Socials),
    data: seo({
      title: $localize`:@@seo.socials.title:Socials – Boundfox Studios`,
      description: $localize`:@@seo.socials.description:Hier findest du uns: GitHub für unsere Open-Source-Projekte, Discord für die Community und YouTube für Tutorials zu Unity, Blender und Gamedev.`,
    }),
  },
  {
    path: 'legal-details-imprint',
    loadComponent: () => import('./pages/imprint/imprint').then(module => module.Imprint),
    data: seo({
      title: $localize`:@@seo.legal-details-imprint.title:Impressum – Boundfox Studios`,
      description: $localize`:@@seo.legal-details-imprint.description:Impressum von Boundfox Studios: Anbieterkennzeichnung nach § 5 DDG, Kontakt, Umsatzsteuer-ID sowie Hinweise zu Haftung und Urheberrecht.`,
    }),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy').then(module => module.PrivacyPolicy),
    data: seo({
      title: $localize`:@@seo.privacy-policy.title:Datenschutzerklärung – Boundfox Studios`,
      description: $localize`:@@seo.privacy-policy.description:Datenschutzerklärung von Boundfox Studios: ohne Cookies, ohne Tracking, ohne Analyse-Skripte – und was beim Aufruf der Website trotzdem verarbeitet wird.`,
    }),
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then(module => module.NotFound),
    data: notFoundSeo(),
  },
  {
    // Same component as /404, so the DOM hydrated at a missed URL matches the prerendered one.
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(module => module.NotFound),
    data: notFoundSeo(),
  },
];
