import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
} from '@angular/core';

import { SessionService } from '../../core/services/session.service';
import { DuckAvatarComponent } from '../../features/duck/duck-avatar/duck-avatar.component';
import { WelcomePanelComponent } from '../../features/welcome/welcome-panel/welcome-panel.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [DuckAvatarComponent, WelcomePanelComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements AfterViewInit {
  private readonly sessionService = inject(SessionService);

  @ViewChild(WelcomePanelComponent)
  private welcomePanelComponent?: WelcomePanelComponent;

  readonly hasActiveSession = this.sessionService.hasActiveSession;

  ngAfterViewInit(): void {
    if (!this.hasActiveSession()) {
      this.welcomePanelComponent?.focusStartButton();
    }
  }

  onStartSession(): void {
    // Étape 4.1 : l’orchestration réelle arrive en 4.2.
  }
}
