import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone: true,
  templateUrl: './app-banner.component.html',
  styleUrl: './app-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBannerComponent {}
