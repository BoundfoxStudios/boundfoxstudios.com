import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(module => module.Home),
  },
  {
    path: 'apps-and-games',
    loadComponent: () =>
      import('./pages/apps-and-games/apps-and-games').then(module => module.AppsAndGames),
  },
  {
    path: 'support',
    loadComponent: () => import('./pages/support/support').then(module => module.Support),
  },
  {
    path: 'socials',
    loadComponent: () => import('./pages/socials/socials').then(module => module.Socials),
  },
  {
    path: 'legal-details-imprint',
    loadComponent: () => import('./pages/imprint/imprint').then(module => module.Imprint),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy').then(module => module.PrivacyPolicy),
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then(module => module.NotFound),
  },
  {
    // Same component as /404, so the DOM hydrated at a missed URL matches the prerendered one.
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(module => module.NotFound),
  },
];
