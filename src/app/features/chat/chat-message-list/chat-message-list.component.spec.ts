import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ChatMessageListComponent } from './chat-message-list.component';

describe('ChatMessageListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageListComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the message log with polite live announcements', () => {
    const fixture = TestBed.createComponent(ChatMessageListComponent);

    fixture.componentRef.setInput('messages', [
      {
        id: 'duck-001',
        author: 'duck',
        text: 'Coin',
        createdAt: 1,
        kind: 'opening',
        mood: 'welcoming',
        category: 'opening',
      },
      {
        id: 'user-001',
        author: 'user',
        text: 'Bonjour',
        createdAt: 2,
      },
    ]);

    fixture.detectChanges();

    const log = fixture.nativeElement.querySelector('[role="log"]') as HTMLElement;

    expect(log).not.toBeNull();
    expect(log.getAttribute('aria-live')).toBe('polite');
    expect(fixture.nativeElement.querySelector('app-duck-message-bubble')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-user-message-bubble')).not.toBeNull();
  });
});
