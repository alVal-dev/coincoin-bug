import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { CreditsAccessService } from '../services/credits-access.service';

export const creditsAccessGuard: CanActivateFn = () => {
  const creditsAccessService = inject(CreditsAccessService);
  const router = inject(Router);

  if (creditsAccessService.hasAccess()) {
    return true;
  }

  return router.parseUrl('/');
};
