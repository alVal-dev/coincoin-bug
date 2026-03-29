import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { CreditsPageComponent } from './credits-page.component';

describe('CreditsPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditsPageComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the credits page placeholder', () => {
    const fixture = TestBed.createComponent(CreditsPageComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Crédits');
  });
});
