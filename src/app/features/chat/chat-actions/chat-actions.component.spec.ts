import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatActionsComponent } from './chat-actions.component';

describe('ChatActionsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatActionsComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('emits the expected actions', () => {
    const fixture = TestBed.createComponent(ChatActionsComponent);
    const component = fixture.componentInstance;

    const bugResolvedSpy = vi.spyOn(component.bugResolved, 'emit');
    const newSessionSpy = vi.spyOn(component.newSessionRequested, 'emit');

    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;

    buttons[0].click();
    buttons[1].click();

    expect(bugResolvedSpy).toHaveBeenCalledTimes(1);
    expect(newSessionSpy).toHaveBeenCalledTimes(1);
  });
});
