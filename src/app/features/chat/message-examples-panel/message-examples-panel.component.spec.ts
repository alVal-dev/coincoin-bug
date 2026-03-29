import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MESSAGE_EXAMPLES } from '../../../content';
import { MessageExamplesPanelComponent } from './message-examples-panel.component';

describe('MessageExamplesPanelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageExamplesPanelComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders all examples and emits the selected text', () => {
    const fixture = TestBed.createComponent(MessageExamplesPanelComponent);
    const component = fixture.componentInstance;
    const emitSpy = vi.spyOn(component.exampleSelected, 'emit');

    fixture.componentRef.setInput('examples', MESSAGE_EXAMPLES);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;

    expect(buttons.length).toBe(4);

    buttons[0].click();

    expect(emitSpy).toHaveBeenCalledWith(MESSAGE_EXAMPLES[0].text);
  });
});
