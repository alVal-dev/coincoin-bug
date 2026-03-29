import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CREDITS_EXIT_BANNER_DURATION_MS, SLEEP_DELAY_MS } from '../../config/business-rules';
import { ChatRuntimeService } from './chat-runtime.service';

describe('ChatRuntimeService', () => {
  let service: ChatRuntimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    vi.useFakeTimers();
    service = TestBed.inject(ChatRuntimeService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in the ready state', () => {
    expect(service.state()).toBe('ready');
    expect(service.isReady()).toBe(true);
    expect(service.isThinking()).toBe(false);
    expect(service.isSleeping()).toBe(false);
    expect(service.isCelebrating()).toBe(false);
  });

  it('transitions between runtime states', () => {
    service.setThinking();
    expect(service.state()).toBe('thinking');

    service.setSleeping();
    expect(service.state()).toBe('sleeping');

    service.setCelebrating();
    expect(service.state()).toBe('celebrating');

    service.setReady();
    expect(service.state()).toBe('ready');
  });

  it('starts and executes the sleep timer callback', () => {
    const callback = vi.fn();

    service.startSleepTimer(callback);

    vi.advanceTimersByTime(SLEEP_DELAY_MS - 1);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('clears the sleep timer before it fires', () => {
    const callback = vi.fn();

    service.startSleepTimer(callback);
    service.clearSleepTimer();

    vi.advanceTimersByTime(SLEEP_DELAY_MS);
    expect(callback).not.toHaveBeenCalled();
  });

  it('recalculates the sleep timer with the remaining delay', () => {
    const callback = vi.fn();
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(11_000);

    service.recalculateSleepTimer(5_000, callback);

    vi.advanceTimersByTime(3_999);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);

    nowSpy.mockRestore();
  });

  it('executes the callback immediately when the recalculated sleep delay is already elapsed', () => {
    const callback = vi.fn();
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(20_500);

    service.recalculateSleepTimer(10_000, callback);

    expect(callback).toHaveBeenCalledTimes(1);

    nowSpy.mockRestore();
  });

  it('shows and clears the credits exit banner automatically', () => {
    service.showCreditsExitBanner('Tu as quitté les crédits.');

    expect(service.creditsExitBanner()).toBe('Tu as quitté les crédits.');
    expect(service.hasCreditsExitBanner()).toBe(true);

    vi.advanceTimersByTime(CREDITS_EXIT_BANNER_DURATION_MS - 1);
    expect(service.creditsExitBanner()).toBe('Tu as quitté les crédits.');

    vi.advanceTimersByTime(1);
    expect(service.creditsExitBanner()).toBeNull();
    expect(service.hasCreditsExitBanner()).toBe(false);
  });

  it('replaces the previous credits exit banner timer when called again', () => {
    service.showCreditsExitBanner('Premier message');
    vi.advanceTimersByTime(1_000);

    service.showCreditsExitBanner('Deuxième message');

    vi.advanceTimersByTime(CREDITS_EXIT_BANNER_DURATION_MS - 1);
    expect(service.creditsExitBanner()).toBe('Deuxième message');

    vi.advanceTimersByTime(1);
    expect(service.creditsExitBanner()).toBeNull();
  });

  it('clears the credits exit banner explicitly', () => {
    service.showCreditsExitBanner('Message temporaire');
    service.clearCreditsExitBanner();

    expect(service.creditsExitBanner()).toBeNull();
    expect(service.hasCreditsExitBanner()).toBe(false);
  });

  it('does not persist anything accidentally', () => {
    service.setThinking();
    service.startSleepTimer(() => undefined);
    service.showCreditsExitBanner('Message');

    expect(sessionStorage.length).toBe(0);
  });
});
