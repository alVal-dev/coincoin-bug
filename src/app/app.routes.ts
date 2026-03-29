import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('./pages/credits/credits-page.component').then((m) => m.CreditsPageComponent),
  },
];
