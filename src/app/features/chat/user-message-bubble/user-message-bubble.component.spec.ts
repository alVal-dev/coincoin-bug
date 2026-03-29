import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { UserMessageBubbleComponent } from './user-message-bubble.component';

describe('UserMessageBubbleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMessageBubbleComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the user message content', () => {
    const fixture = TestBed.createComponent(UserMessageBubbleComponent);

    fixture.componentRef.setInput('message', {
      id: 'user-001',
      author: 'user',
      text: 'Mon bug est bizarre',
      createdAt: 1,
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Toi');
    expect(fixture.nativeElement.textContent).toContain('Mon bug est bizarre');
  });
});
