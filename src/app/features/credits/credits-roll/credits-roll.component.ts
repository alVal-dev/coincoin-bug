import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ResponseCatalogService } from '../../../core/services/response-catalog.service';
import { type CreditsPresentationMode } from '../../../models';

@Component({
  selector: 'app-credits-roll',
  standalone: true,
  templateUrl: './credits-roll.component.html',
  styleUrl: './credits-roll.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditsRollComponent {
  private readonly responseCatalogService = inject(ResponseCatalogService);

  private readonly presentationModeSignal = signal<CreditsPresentationMode>(
    this.detectPresentationMode(),
  );

  readonly creditsLines = this.responseCatalogService.creditsLines;
  readonly presentationMode = computed(() => this.presentationModeSignal());
  readonly isAnimated = computed(() => this.presentationModeSignal() === 'animated');
  readonly isStatic = computed(() => this.presentationModeSignal() === 'static');

  private detectPresentationMode(): CreditsPresentationMode {
    const supportsMatchMedia = typeof globalThis.matchMedia === 'function';

    if (!supportsMatchMedia) {
      return 'animated';
    }

    return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'static'
      : 'animated';
  }
}
