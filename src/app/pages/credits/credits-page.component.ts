import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';

import { ChatFlowService } from '../../core/services/chat-flow.service';
import { CreditsRollComponent } from '../../features/credits/credits-roll/credits-roll.component';

@Component({
  selector: 'app-credits-page',
  standalone: true,
  imports: [CreditsRollComponent],
  templateUrl: './credits-page.component.html',
  styleUrl: './credits-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditsPageComponent implements AfterViewInit {
  private readonly chatFlowService = inject(ChatFlowService);

  @ViewChild('newSessionButton')
  private newSessionButton?: ElementRef<HTMLButtonElement>;

  ngAfterViewInit(): void {
    this.newSessionButton?.nativeElement.focus();
  }

  onStartNewSession(): void {
    this.chatFlowService.startNewSessionFromCredits();
  }
}
