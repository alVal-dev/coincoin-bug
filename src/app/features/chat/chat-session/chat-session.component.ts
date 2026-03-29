import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
} from '@angular/core';

import { MESSAGE_EXAMPLES } from '../../../content';
import { ChatFlowService } from '../../../core/services/chat-flow.service';
import { ChatRuntimeService } from '../../../core/services/chat-runtime.service';
import { SessionService } from '../../../core/services/session.service';
import { ChatActionsComponent } from '../chat-actions/chat-actions.component';
import { ChatComposerComponent } from '../chat-composer/chat-composer.component';
import { MessageExamplesPanelComponent } from '../message-examples-panel/message-examples-panel.component';

@Component({
  selector: 'app-chat-session',
  standalone: true,
  imports: [ChatComposerComponent, ChatActionsComponent, MessageExamplesPanelComponent],
  templateUrl: './chat-session.component.html',
  styleUrl: './chat-session.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatSessionComponent implements AfterViewInit {
  private readonly sessionService = inject(SessionService);
  private readonly chatRuntimeService = inject(ChatRuntimeService);
  private readonly chatFlowService = inject(ChatFlowService);

  @ViewChild(ChatComposerComponent)
  private chatComposerComponent?: ChatComposerComponent;

  readonly examples = MESSAGE_EXAMPLES;
  readonly messages = this.sessionService.messages;
  readonly isThinking = this.chatRuntimeService.isThinking;

  ngAfterViewInit(): void {
    this.chatComposerComponent?.focusTextarea();
  }

  onSubmitMessage(): void {
    this.chatFlowService.sendMessage();
  }

  onSelectExample(): void {
    this.chatFlowService.sendMessage();
  }

  onBugResolved(): void {
    this.chatFlowService.resolveBug();
  }

  onNewSessionRequested(): void {
    this.chatFlowService.startNewSession();
  }
}
