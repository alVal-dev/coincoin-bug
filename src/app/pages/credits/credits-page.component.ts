import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

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
export class CreditsPageComponent implements AfterViewInit, OnDestroy {
  private readonly chatFlowService = inject(ChatFlowService);
  private readonly sessionService = inject(SessionService);
  private readonly creditsAccessService = inject(CreditsAccessService);
  private readonly chatRuntimeService = inject(ChatRuntimeService);
  private readonly router = inject(Router);

  @ViewChild('newSessionButton')
  private newSessionButton?: ElementRef<HTMLButtonElement>;

  private routerEventsSubscription?: Subscription;

  constructor() {
    this.routerEventsSubscription = this.router.events.subscribe((event) => {
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

  ngOnDestroy(): void {
    this.routerEventsSubscription?.unsubscribe();
  }

  onStartNewSession(): void {
    this.chatFlowService.startNewSessionFromCredits();
  }

  private handleBrowserBackNavigationFromCredits(): void {
    this.sessionService.clearSession();
    this.creditsAccessService.revokeAccess();
    this.chatRuntimeService.showCreditsExitBanner(
      'Tu as quitté les crédits. Le canard reprend son poste.',
    );
  }
}
