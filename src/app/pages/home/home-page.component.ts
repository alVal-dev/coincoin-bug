import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
} from '@angular/core';

import { ChatFlowService } from '../../core/services/chat-flow.service';
import { SessionService } from '../../core/services/session.service';
import { ChatSessionComponent } from '../../features/chat/chat-session/chat-session.component';
import { DuckAvatarComponent } from '../../features/duck/duck-avatar/duck-avatar.component';
import { WelcomePanelComponent } from '../../features/welcome/welcome-panel/welcome-panel.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [DuckAvatarComponent, WelcomePanelComponent, ChatSessionComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements AfterViewInit {
  private readonly sessionService = inject(SessionService);
  private readonly chatFlowService = inject(ChatFlowService);

  @ViewChild(WelcomePanelComponent)
  private welcomePanelComponent?: WelcomePanelComponent;

  readonly hasActiveSession = this.sessionService.hasActiveSession;

  ngAfterViewInit(): void {
    if (!this.hasActiveSession()) {
      this.welcomePanelComponent?.focusStartButton();
    }
  }

  onStartSession(): void {
    this.chatFlowService.startSession();
  }
}
