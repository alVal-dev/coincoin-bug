import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatFlowService } from '../../core/services/chat-flow.service';
import { CreditsPageComponent } from './credits-page.component';

describe('CreditsPageComponent', () => {
  beforeEach(async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [CreditsPageComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the credits page', () => {
    const fixture = TestBed.createComponent(CreditsPageComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Crédits');
    expect(fixture.nativeElement.textContent).toContain('Nouvelle session');
  });

  it('starts a new session from credits when clicking the button', () => {
    const fixture = TestBed.createComponent(CreditsPageComponent);
    const chatFlowService = TestBed.inject(ChatFlowService);
    const startNewSessionFromCreditsSpy = vi.spyOn(chatFlowService, 'startNewSessionFromCredits');

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(startNewSessionFromCreditsSpy).toHaveBeenCalledTimes(1);
  });

  it('focuses the new session button on arrival', () => {
    const fixture = TestBed.createComponent(CreditsPageComponent);

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(document.activeElement).toBe(button);
  });
});
