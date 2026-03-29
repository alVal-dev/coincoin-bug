import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the home page placeholder', () => {
    const fixture = TestBed.createComponent(HomePageComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('coincoin-bug');
    expect(fixture.nativeElement.textContent).toContain('Accueil');
  });
});
