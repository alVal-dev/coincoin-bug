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

  it('renders a scrollable message viewport', () => {
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
    ]);

    fixture.detectChanges();

    const viewport = fixture.nativeElement.querySelector('.chat-message-list') as HTMLElement;

    expect(viewport).not.toBeNull();
  });

  it('shows the new message indicator when a message arrives out of view', () => {
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
    ]);

    fixture.detectChanges();

    const viewport = fixture.nativeElement.querySelector('.chat-message-list') as HTMLDivElement;

    Object.defineProperty(viewport, 'scrollHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(viewport, 'clientHeight', {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(viewport, 'scrollTop', {
      value: 100,
      writable: true,
      configurable: true,
    });

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

    const indicator = fixture.nativeElement.querySelector(
      '.chat-message-list__new-message-indicator',
    ) as HTMLButtonElement | null;

    expect(indicator).not.toBeNull();
    expect(indicator?.textContent).toContain('Nouveau message');
  });

  it('does not show the indicator when the viewport is already near the bottom', () => {
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
    ]);

    fixture.detectChanges();

    const viewport = fixture.nativeElement.querySelector('.chat-message-list') as HTMLDivElement;

    Object.defineProperty(viewport, 'scrollHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(viewport, 'clientHeight', {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(viewport, 'scrollTop', {
      value: 575,
      writable: true,
      configurable: true,
    });

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

    const indicator = fixture.nativeElement.querySelector(
      '.chat-message-list__new-message-indicator',
    );

    expect(indicator).toBeNull();
  });

  it('scrolls to the bottom and hides the indicator when clicking the button', () => {
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
    ]);

    fixture.detectChanges();

    const viewport = fixture.nativeElement.querySelector('.chat-message-list') as HTMLDivElement;

    Object.defineProperty(viewport, 'scrollHeight', {
      value: 900,
      configurable: true,
    });
    Object.defineProperty(viewport, 'clientHeight', {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(viewport, 'scrollTop', {
      value: 100,
      writable: true,
      configurable: true,
    });

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

    const indicator = fixture.nativeElement.querySelector(
      '.chat-message-list__new-message-indicator',
    ) as HTMLButtonElement;

    indicator.click();
    fixture.detectChanges();

    expect(viewport.scrollTop).toBe(900);
    expect(
      fixture.nativeElement.querySelector('.chat-message-list__new-message-indicator'),
    ).toBeNull();
  });
});
