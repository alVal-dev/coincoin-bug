import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ChatRuntimeService } from '../../../core/services/chat-runtime.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  templateUrl: './app-banner.component.html',
  styleUrl: './app-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBannerComponent {
  readonly chatRuntimeService = inject(ChatRuntimeService);
}
