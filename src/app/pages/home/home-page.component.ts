import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  inject,
} from '@angular/core';

import { type DuckAnimationState, type DuckChatMessage, type DuckMood } from '../../models';
import { ChatFlowService } from '../../core/services/chat-flow.service';
import { ChatRuntimeService } from '../../core/services/chat-runtime.service';
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
  private readonly chatRuntimeService = inject(ChatRuntimeService);

  @ViewChild(WelcomePanelComponent)
  private welcomePanelComponent?: WelcomePanelComponent;

  readonly hasActiveSession = this.sessionService.hasActiveSession;
  readonly messages = this.sessionService.messages;
  readonly runtimeState = this.chatRuntimeService.state;

  readonly lastDuckMessage = computed(() => {
    const messages = this.messages();

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];

      if (message.author === 'duck') {
        return message as DuckChatMessage;
      }
    }

    return null;
  });

  readonly duckMood = computed<DuckMood>(() => {
    const runtimeState = this.runtimeState();

    if (runtimeState === 'thinking') {
      return 'thinking';
    }

    if (runtimeState === 'sleeping') {
      return 'sleeping';
    }

    if (runtimeState === 'celebrating') {
      return 'celebrating';
    }

    return this.lastDuckMessage()?.mood ?? 'curious';
  });

  readonly duckAnimation = computed<DuckAnimationState>(() => {
    const runtimeState = this.runtimeState();

    if (runtimeState === 'thinking') {
      return 'thinking';
    }

    if (runtimeState === 'sleeping') {
      return 'sleeping';
    }

    if (runtimeState === 'celebrating') {
      return 'bounce';
    }

    const lastDuckMessage = this.lastDuckMessage();

    if (lastDuckMessage?.kind === 'opening') {
      return 'wave';
    }

    return this.hasActiveSession() ? 'idle' : 'none';
  });

  ngAfterViewInit(): void {
    if (!this.hasActiveSession()) {
      this.welcomePanelComponent?.focusStartButton();
    }
  }

  onStartSession(): void {
    this.chatFlowService.startSession();
  }
}
