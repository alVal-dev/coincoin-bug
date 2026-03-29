import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { type DuckAnimationState, type DuckMood } from '../../../models';

@Component({
  selector: 'app-duck-avatar',
  standalone: true,
  templateUrl: './duck-avatar.component.html',
  styleUrl: './duck-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuckAvatarComponent {
  readonly mood = input<DuckMood>('curious');
  readonly animation = input<DuckAnimationState>('none');

  readonly ariaLabelByMood: Record<DuckMood, string> = {
    welcoming: 'Canard jaune accueillant',
    curious: 'Canard jaune curieux',
    thinking: 'Canard jaune en réflexion',
    sarcastic: 'Canard jaune sarcastique',
    empathetic: 'Canard jaune empathique',
    confused: 'Canard jaune confus',
    celebrating: 'Canard jaune en célébration',
    sleeping: 'Canard jaune endormi',
  };

  readonly ariaLabel = computed(() => this.ariaLabelByMood[this.mood()]);
}
