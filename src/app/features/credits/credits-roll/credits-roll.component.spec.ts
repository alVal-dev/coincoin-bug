import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreditsRollComponent } from './credits-roll.component';

describe('CreditsRollComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditsRollComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the credits lines', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
      }),
    );

    const fixture = TestBed.createComponent(CreditsRollComponent);
    fixture.detectChanges();

    const textContent = fixture.nativeElement.textContent;

    expect(textContent).toContain('coincoin-bug');
    expect(textContent).toContain('Direction émotionnelle : le canard.');
  });

  it('uses animated mode when reduced motion is not requested', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
      }),
    );

    const fixture = TestBed.createComponent(CreditsRollComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.credits-roll') as HTMLElement;

    expect(root.classList.contains('credits-roll--animated')).toBe(true);
    expect(root.classList.contains('credits-roll--static')).toBe(false);
  });

  it('uses static mode when reduced motion is requested', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
      }),
    );

    const fixture = TestBed.createComponent(CreditsRollComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.credits-roll') as HTMLElement;

    expect(root.classList.contains('credits-roll--static')).toBe(true);
    expect(root.classList.contains('credits-roll--animated')).toBe(false);
  });
});
