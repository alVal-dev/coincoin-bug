import { describe, expect, it } from 'vitest';

import { appRoutes } from './app.routes';

describe('appRoutes', () => {
  it('defines a lazy-loaded home route', () => {
    expect(appRoutes[0]?.path).toBe('');
    expect(typeof appRoutes[0]?.loadComponent).toBe('function');
  });

  it('defines a lazy-loaded credits route', () => {
    expect(appRoutes[1]?.path).toBe('credits');
    expect(typeof appRoutes[1]?.loadComponent).toBe('function');
  });
});
