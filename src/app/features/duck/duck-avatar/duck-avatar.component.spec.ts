import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { DuckAvatarComponent } from './duck-avatar.component';

describe('DuckAvatarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuckAvatarComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the duck avatar with an accessible label', () => {
    const fixture = TestBed.createComponent(DuckAvatarComponent);

    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;

    expect(avatar).not.toBeNull();
    expect(avatar.getAttribute('aria-label')).toBe('Canard jaune curieux');
  });

  it('renders the welcoming mood', () => {
    const fixture = TestBed.createComponent(DuckAvatarComponent);

    fixture.componentRef.setInput('mood', 'welcoming');
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;

    expect(avatar.getAttribute('aria-label')).toBe('Canard jaune accueillant');
    expect(avatar.getAttribute('data-mood')).toBe('welcoming');
  });

  it('renders the thinking mood', () => {
    const fixture = TestBed.createComponent(DuckAvatarComponent);

    fixture.componentRef.setInput('mood', 'thinking');
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;

    expect(avatar.getAttribute('aria-label')).toBe('Canard jaune en réflexion');
    expect(avatar.getAttribute('data-mood')).toBe('thinking');
  });

  it('renders the celebrating mood', () => {
    const fixture = TestBed.createComponent(DuckAvatarComponent);

    fixture.componentRef.setInput('mood', 'celebrating');
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;

    expect(avatar.getAttribute('aria-label')).toBe('Canard jaune en célébration');
    expect(avatar.getAttribute('data-mood')).toBe('celebrating');
  });

  it('renders the sleeping mood', () => {
    const fixture = TestBed.createComponent(DuckAvatarComponent);

    fixture.componentRef.setInput('mood', 'sleeping');
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;

    expect(avatar.getAttribute('aria-label')).toBe('Canard jaune endormi');
    expect(avatar.getAttribute('data-mood')).toBe('sleeping');
  });

  it('exposes the animation state through a data attribute', () => {
    const fixture = TestBed.createComponent(DuckAvatarComponent);

    fixture.componentRef.setInput('animation', 'thinking');
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('[role="img"]') as HTMLElement;

    expect(avatar.getAttribute('data-animation')).toBe('thinking');
  });
});
