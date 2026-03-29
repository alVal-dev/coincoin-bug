import { Routes } from '@angular/router';

import { creditsAccessGuard } from './core/guards/credits-access.guard';

export const appRoutes: Routes = [
  {
    path: '',
    title: 'coincoin-bug',
    loadComponent: () =>
      import('./pages/home/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'credits',
    title: 'Crédits • coincoin-bug',
    canActivate: [creditsAccessGuard],
    loadComponent: () =>
      import('./pages/credits/credits-page.component').then((m) => m.CreditsPageComponent),
  },
];
