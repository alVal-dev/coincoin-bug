import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  effect,
  input,
} from '@angular/core';

import { type ChatMessage } from '../../../models';
import { DuckMessageBubbleComponent } from '../duck-message-bubble/duck-message-bubble.component';
import { UserMessageBubbleComponent } from '../user-message-bubble/user-message-bubble.component';

@Component({
  selector: 'app-chat-message-list',
  standalone: true,
  imports: [DuckMessageBubbleComponent, UserMessageBubbleComponent],
  templateUrl: './chat-message-list.component.html',
  styleUrl: './chat-message-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageListComponent {
  readonly messages = input.required<readonly ChatMessage[]>();

  @ViewChild('scrollViewport')
  private scrollViewport?: ElementRef<HTMLDivElement>;

  private previousMessageCount = 0;

  constructor() {
    effect(() => {
      const currentMessageCount = this.messages().length;

      if (currentMessageCount <= this.previousMessageCount) {
        this.previousMessageCount = currentMessageCount;
        return;
      }

      this.previousMessageCount = currentMessageCount;

      queueMicrotask(() => {
        this.scrollToBottom();
      });
    });
  }

  private scrollToBottom(): void {
    const viewport = this.scrollViewport?.nativeElement;

    if (!viewport) {
      return;
    }

    viewport.scrollTop = viewport.scrollHeight;
  }
}
