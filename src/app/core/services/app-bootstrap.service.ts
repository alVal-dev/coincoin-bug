import { inject, Injectable } from '@angular/core';

import { ChatFlowService } from './chat-flow.service';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root',
})
export class AppBootstrapService {
  private readonly themeService = inject(ThemeService);
  private readonly chatFlowService = inject(ChatFlowService);

  private initialized = false;

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.themeService.initialize();
    this.chatFlowService.tryRestore();

    this.initialized = true;
  }
}
