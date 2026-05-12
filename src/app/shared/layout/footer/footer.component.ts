import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeToggleComponent } from '../../theme/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ThemeToggleComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
