import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatComposerComponent } from './chat-composer.component';

describe('ChatComposerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComposerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders an accessible textarea', () => {
    const fixture = TestBed.createComponent(ChatComposerComponent);

    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;

    expect(textarea).not.toBeNull();
    expect(textarea.id).toBe('chat-message');
    expect(label.getAttribute('for')).toBe('chat-message');
  });

  it('submits on Enter and keeps line break behavior on Shift+Enter', () => {
    const fixture = TestBed.createComponent(ChatComposerComponent);
    const component = fixture.componentInstance;
    const emitSpy = vi.spyOn(component.messageSubmitted, 'emit');

    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    textarea.value = 'Bonjour';
    textarea.dispatchEvent(new Event('input'));

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    textarea.dispatchEvent(enterEvent);

    expect(emitSpy).toHaveBeenCalledWith('Bonjour');

    textarea.value = 'Ligne 1';
    textarea.dispatchEvent(new Event('input'));

    const shiftEnterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
    textarea.dispatchEvent(shiftEnterEvent);

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('disables the textarea when disabled input is true', () => {
    const fixture = TestBed.createComponent(ChatComposerComponent);

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });
});
