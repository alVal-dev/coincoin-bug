import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';

import { ChatFlowService } from '../../core/services/chat-flow.service';
import { ChatRuntimeService } from '../../core/services/chat-runtime.service';
import { CreditsAccessService } from '../../core/services/credits-access.service';
import { SessionService } from '../../core/services/session.service';
import { CreditsRollComponent } from '../../features/credits/credits-roll/credits-roll.component';

@Component({
  selector: 'app-credits-page',
  standalone: true,
  imports: [CreditsRollComponent],
  templateUrl: './credits-page.component.html',
  styleUrl: './credits-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditsPageComponent implements AfterViewInit {
  private readonly chatFlowService = inject(ChatFlowService);
  private readonly sessionService = inject(SessionService);
  private readonly creditsAccessService = inject(CreditsAccessService);
  private readonly chatRuntimeService = inject(ChatRuntimeService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('newSessionButton')
  private newSessionButton?: ElementRef<HTMLButtonElement>;

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (!(event instanceof NavigationStart)) {
        return;
      }

      if (event.navigationTrigger !== 'popstate') {
        return;
      }

      this.handleBrowserBackNavigationFromCredits();
    });
  }

  ngAfterViewInit(): void {
    this.newSessionButton?.nativeElement.focus();
  }

  onStartNewSession(): void {
    this.chatFlowService.startNewSessionFromCredits();
    this.chatRuntimeService.showCreditsExitBanner(
      'Tu as quitté les crédits. Le canard reprend son poste.',
    );
  }

  private handleBrowserBackNavigationFromCredits(): void {
    this.sessionService.clearSession();
    this.creditsAccessService.revokeAccess();
    this.chatRuntimeService.showCreditsExitBanner(
      'Tu as quitté les crédits. Le canard reprend son poste.',
    );
  }
}
