import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { SessionService } from '../../core/services/session.service';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let sessionService: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.clearSession();
  });

  it('renders the welcome state when there is no active session', () => {
    const fixture = TestBed.createComponent(HomePageComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Raconte ton bug au canard.');
    expect(fixture.nativeElement.querySelector('app-duck-avatar')).not.toBeNull();
  });

  it('focuses the start session button on initial welcome view', async () => {
    const fixture = TestBed.createComponent(HomePageComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(document.activeElement).toBe(button);
  });
});
