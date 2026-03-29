import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, output } from '@angular/core';

@Component({
  selector: 'app-welcome-panel',
  standalone: true,
  templateUrl: './welcome-panel.component.html',
  styleUrl: './welcome-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePanelComponent {
  readonly startSession = output<void>();

  @ViewChild('startButton', { read: ElementRef })
  private startButtonRef?: ElementRef<HTMLButtonElement>;

  focusStartButton(): void {
    this.startButtonRef?.nativeElement.focus();
  }
}
