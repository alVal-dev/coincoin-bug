import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();
  });

  it('renders the brand and theme toggle', () => {
    const fixture = TestBed.createComponent(HeaderComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('coincoin-bug');
    expect(fixture.nativeElement.querySelector('app-theme-toggle')).not.toBeNull();
  });
});
