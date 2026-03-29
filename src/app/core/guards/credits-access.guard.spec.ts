import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  type ActivatedRouteSnapshot,
  Router,
  type RouterStateSnapshot,
  provideRouter,
} from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { creditsAccessGuard } from './credits-access.guard';
import { CreditsAccessService } from '../services/credits-access.service';

describe('creditsAccessGuard', () => {
  let creditsAccessService: CreditsAccessService;
  let router: Router;

  const routeSnapshot = {} as ActivatedRouteSnapshot;
  const routerStateSnapshot = { url: '/credits' } as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

    creditsAccessService = TestBed.inject(CreditsAccessService);
    router = TestBed.inject(Router);
  });

  it('allows access when the credits flag is present', () => {
    vi.spyOn(creditsAccessService, 'hasAccess').mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      creditsAccessGuard(routeSnapshot, routerStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('redirects to home when the credits flag is missing', () => {
    vi.spyOn(creditsAccessService, 'hasAccess').mockReturnValue(false);
    const parseUrlSpy = vi.spyOn(router, 'parseUrl');

    const result = TestBed.runInInjectionContext(() =>
      creditsAccessGuard(routeSnapshot, routerStateSnapshot),
    );

    expect(parseUrlSpy).toHaveBeenCalledWith('/');
    expect(result).toBe(parseUrlSpy.mock.results[0]?.value);
  });
});
