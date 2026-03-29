import { Injectable, NgZone, inject } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({
  providedIn: 'root',
})
export class ConfettiService {
  private readonly ngZone = inject(NgZone);

  protected readonly confettiFn = confetti;
  protected readonly resetFn = confetti.reset.bind(confetti);

  celebrate(): void {
    if (this.prefersReducedMotion()) {
      return;
    }

    this.schoolPride(3_000, ['#ffd54a', '#f59e0b', '#ffffff']);
    this.fireworks(4_000);
  }

  schoolPride(durationMs = 5_000, colors: string[] = ['#ffd54a', '#f59e0b']): void {
    if (this.prefersReducedMotion()) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const end = Date.now() + durationMs;

      const frame = (): void => {
        this.confettiFn({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });

        this.confettiFn({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          globalThis.requestAnimationFrame(frame);
        }
      };

      frame();
    });
  }

  fireworks(durationMs = 5_000): void {
    if (this.prefersReducedMotion()) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const animationEnd = Date.now() + durationMs;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
      };

      const intervalId = globalThis.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          globalThis.clearInterval(intervalId);
          return;
        }

        const particleCount = 50 * (timeLeft / durationMs);

        this.confettiFn({
          ...defaults,
          particleCount,
          colors: ['#ffd54a', '#f59e0b', '#ffffff'],
          origin: {
            x: this.randomInRange(0.1, 0.3),
            y: Math.random() - 0.2,
          },
        });

        this.confettiFn({
          ...defaults,
          particleCount,
          colors: ['#ffd54a', '#f59e0b', '#ffffff'],
          origin: {
            x: this.randomInRange(0.7, 0.9),
            y: Math.random() - 0.2,
          },
        });
      }, 250);
    });
  }

  reset(): void {
    this.resetFn();
  }

  private prefersReducedMotion(): boolean {
    const supportsMatchMedia = typeof globalThis.matchMedia === 'function';

    if (!supportsMatchMedia) {
      return false;
    }

    return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
