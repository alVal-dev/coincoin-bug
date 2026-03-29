import { Injectable, computed, signal } from '@angular/core';

import { CREDITS_EXIT_BANNER_DURATION_MS, SLEEP_DELAY_MS } from '../../config/business-rules';
import { type ChatRuntimeState } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class ChatRuntimeService {
  private readonly runtimeStateSignal = signal<ChatRuntimeState>('ready');
  private readonly creditsExitBannerSignal = signal<string | null>(null);

  private sleepTimerId: ReturnType<typeof setTimeout> | null = null;
  private creditsExitBannerTimerId: ReturnType<typeof setTimeout> | null = null;

  readonly state = this.runtimeStateSignal.asReadonly();
  readonly isReady = computed(() => this.runtimeStateSignal() === 'ready');
  readonly isThinking = computed(() => this.runtimeStateSignal() === 'thinking');
  readonly isSleeping = computed(() => this.runtimeStateSignal() === 'sleeping');
  readonly isCelebrating = computed(() => this.runtimeStateSignal() === 'celebrating');

  readonly creditsExitBanner = this.creditsExitBannerSignal.asReadonly();
  readonly hasCreditsExitBanner = computed(() => this.creditsExitBannerSignal() !== null);

  setReady(): void {
    this.runtimeStateSignal.set('ready');
  }

  setThinking(): void {
    this.runtimeStateSignal.set('thinking');
  }

  setSleeping(): void {
    this.runtimeStateSignal.set('sleeping');
  }

  setCelebrating(): void {
    this.runtimeStateSignal.set('celebrating');
  }

  startSleepTimer(callback: () => void, delayMs: number = SLEEP_DELAY_MS): void {
    this.clearSleepTimer();

    this.sleepTimerId = globalThis.setTimeout(() => {
      this.sleepTimerId = null;
      callback();
    }, delayMs);
  }

  clearSleepTimer(): void {
    if (this.sleepTimerId !== null) {
      globalThis.clearTimeout(this.sleepTimerId);
      this.sleepTimerId = null;
    }
  }

  recalculateSleepTimer(lastDuckReplyAt: number, callback: () => void): void {
    const elapsedMs = Date.now() - lastDuckReplyAt;
    const remainingDelayMs = SLEEP_DELAY_MS - elapsedMs;

    if (remainingDelayMs <= 0) {
      this.clearSleepTimer();
      callback();
      return;
    }

    this.startSleepTimer(callback, remainingDelayMs);
  }

  showCreditsExitBanner(
    message: string,
    durationMs: number = CREDITS_EXIT_BANNER_DURATION_MS,
  ): void {
    this.clearCreditsExitBanner();

    this.creditsExitBannerSignal.set(message);
    this.creditsExitBannerTimerId = globalThis.setTimeout(() => {
      this.creditsExitBannerSignal.set(null);
      this.creditsExitBannerTimerId = null;
    }, durationMs);
  }

  clearCreditsExitBanner(): void {
    if (this.creditsExitBannerTimerId !== null) {
      globalThis.clearTimeout(this.creditsExitBannerTimerId);
      this.creditsExitBannerTimerId = null;
    }

    this.creditsExitBannerSignal.set(null);
  }
}
