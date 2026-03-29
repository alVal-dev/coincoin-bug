import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { type MessageExampleEntry } from '../../../content';

@Component({
  selector: 'app-message-examples-panel',
  standalone: true,
  templateUrl: './message-examples-panel.component.html',
  styleUrl: './message-examples-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageExamplesPanelComponent {
  readonly examples = input.required<readonly MessageExampleEntry[]>();

  readonly exampleSelected = output<string>();

  onSelectExample(text: string): void {
    this.exampleSelected.emit(text);
  }
}
