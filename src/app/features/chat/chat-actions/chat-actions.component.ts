import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-chat-actions',
  standalone: true,
  templateUrl: './chat-actions.component.html',
  styleUrl: './chat-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatActionsComponent {
  readonly bugResolved = output<void>();
  readonly newSessionRequested = output<void>();
}
