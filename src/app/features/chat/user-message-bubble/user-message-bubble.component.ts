import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type UserChatMessage } from '../../../models';

@Component({
  selector: 'app-user-message-bubble',
  standalone: true,
  templateUrl: './user-message-bubble.component.html',
  styleUrl: './user-message-bubble.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMessageBubbleComponent {
  readonly message = input.required<UserChatMessage>();
}
