import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { DuckAvatarComponent } from './duck-avatar.component';

describe('DuckAvatarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuckAvatarComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the duck avatar with an accessible label', () => {
    const fixture = TestBed.createComponent(DuckAvatarComponent);

    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;

    expect(avatar).not.toBeNull();
    expect(avatar.getAttribute('aria-label')).toBe('Canard jaune curieux');
  });
});
