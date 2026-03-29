import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  effect,
  input,
  signal,
} from '@angular/core';

import { type ChatMessage } from '../../../models';
import { DuckMessageBubbleComponent } from '../duck-message-bubble/duck-message-bubble.component';
import { UserMessageBubbleComponent } from '../user-message-bubble/user-message-bubble.component';

const BOTTOM_PROXIMITY_THRESHOLD_PX = 32;

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

  readonly showNewMessageIndicator = signal(false);

  private previousMessageCount = 0;

  constructor() {
    effect(() => {
      const currentMessages = this.messages();
      const currentMessageCount = currentMessages.length;

      if (currentMessageCount <= this.previousMessageCount) {
        this.previousMessageCount = currentMessageCount;
        return;
      }

      if (this.previousMessageCount === 0) {
        this.previousMessageCount = currentMessageCount;
        return;
      }

      if (!this.isNearBottom()) {
        this.showNewMessageIndicator.set(true);
      }

      this.previousMessageCount = currentMessageCount;
    });
  }

  onScroll(): void {
    if (this.isNearBottom()) {
      this.showNewMessageIndicator.set(false);
    }
  }

  scrollToBottom(): void {
    const viewport = this.scrollViewport?.nativeElement;

    if (!viewport) {
      return;
    }

    viewport.scrollTop = viewport.scrollHeight;
    this.showNewMessageIndicator.set(false);
  }

  private isNearBottom(): boolean {
    const viewport = this.scrollViewport?.nativeElement;

    if (!viewport) {
      return true;
    }

    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;

    return distanceFromBottom <= BOTTOM_PROXIMITY_THRESHOLD_PX;
  }
}
