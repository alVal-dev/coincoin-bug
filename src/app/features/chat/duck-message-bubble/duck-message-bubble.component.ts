import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type DuckChatMessage } from '../../../models';

@Component({
  selector: 'app-duck-message-bubble',
  standalone: true,
  templateUrl: './duck-message-bubble.component.html',
  styleUrl: './duck-message-bubble.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuckMessageBubbleComponent {
  readonly message = input.required<DuckChatMessage>();
}
