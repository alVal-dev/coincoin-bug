import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { DuckMessageBubbleComponent } from './duck-message-bubble.component';

describe('DuckMessageBubbleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuckMessageBubbleComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the duck message content and mini avatar', () => {
    const fixture = TestBed.createComponent(DuckMessageBubbleComponent);

    fixture.componentRef.setInput('message', {
      id: 'duck-001',
      author: 'duck',
      text: 'Je compatis avec style.',
      createdAt: 1,
      kind: 'reply',
      mood: 'empathetic',
      category: 'empathic',
    });

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Canard');
    expect(fixture.nativeElement.textContent).toContain('Je compatis avec style.');
    expect(fixture.nativeElement.querySelector('svg')).not.toBeNull();
  });
});
