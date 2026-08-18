import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'design-harness',
    loadComponent: () =>
      import('./pages/design-harness/design-harness').then(module => module.DesignHarness),
  },
];
