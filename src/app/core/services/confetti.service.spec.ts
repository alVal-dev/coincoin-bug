import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfettiService } from './confetti.service';

describe('ConfettiService', () => {
  let service: ConfettiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    service = TestBed.inject(ConfettiService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('does nothing in celebrate() when reduced motion is requested', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
      }),
    );

    const schoolPrideSpy = vi.spyOn(service, 'schoolPride');
    const fireworksSpy = vi.spyOn(service, 'fireworks');

    service.celebrate();

    expect(schoolPrideSpy).not.toHaveBeenCalled();
    expect(fireworksSpy).not.toHaveBeenCalled();
  });

  it('triggers both school pride and fireworks in celebrate()', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
      }),
    );

    const schoolPrideSpy = vi.spyOn(service, 'schoolPride').mockImplementation(() => undefined);
    const fireworksSpy = vi.spyOn(service, 'fireworks').mockImplementation(() => undefined);

    service.celebrate();

    expect(schoolPrideSpy).toHaveBeenCalledTimes(1);
    expect(schoolPrideSpy).toHaveBeenCalledWith(3_000, ['#ffd54a', '#f59e0b', '#ffffff']);
    expect(fireworksSpy).toHaveBeenCalledTimes(1);
    expect(fireworksSpy).toHaveBeenCalledWith(4_000);
  });

  it('does not schedule school pride when reduced motion is requested', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
      }),
    );

    const requestAnimationFrameSpy = vi.spyOn(globalThis, 'requestAnimationFrame');

    service.schoolPride();

    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
  });

  it('does not schedule fireworks when reduced motion is requested', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
      }),
    );

    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

    service.fireworks();

    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('reset can be called safely', () => {
    expect(() => service.reset()).not.toThrow();
  });
});
