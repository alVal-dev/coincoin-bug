import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-credits-page',
  standalone: true,
  templateUrl: './credits-page.component.html',
  styleUrl: './credits-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditsPageComponent {}
