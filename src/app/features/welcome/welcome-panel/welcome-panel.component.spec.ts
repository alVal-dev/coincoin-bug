import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WelcomePanelComponent } from './welcome-panel.component';

describe('WelcomePanelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomePanelComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the welcome content and emits startSession', () => {
    const fixture = TestBed.createComponent(WelcomePanelComponent);
    const component = fixture.componentInstance;
    const emitSpy = vi.spyOn(component.startSession, 'emit');

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(fixture.nativeElement.textContent).toContain('Commencer une session');
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});
