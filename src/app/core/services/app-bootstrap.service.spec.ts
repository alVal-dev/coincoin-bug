import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppBootstrapService } from './app-bootstrap.service';
import { ChatFlowService } from './chat-flow.service';
import { ThemeService } from './theme.service';

describe('AppBootstrapService', () => {
  let service: AppBootstrapService;
  let themeService: ThemeService;
  let chatFlowService: ChatFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    service = TestBed.inject(AppBootstrapService);
    themeService = TestBed.inject(ThemeService);
    chatFlowService = TestBed.inject(ChatFlowService);
  });

  it('initializes the theme and tries to restore the session', () => {
    const initializeThemeSpy = vi.spyOn(themeService, 'initialize');
    const tryRestoreSpy = vi.spyOn(chatFlowService, 'tryRestore');

    service.initialize();

    expect(initializeThemeSpy).toHaveBeenCalledTimes(1);
    expect(tryRestoreSpy).toHaveBeenCalledTimes(1);
  });

  it('does not initialize twice', () => {
    const initializeThemeSpy = vi.spyOn(themeService, 'initialize');
    const tryRestoreSpy = vi.spyOn(chatFlowService, 'tryRestore');

    service.initialize();
    service.initialize();

    expect(initializeThemeSpy).toHaveBeenCalledTimes(1);
    expect(tryRestoreSpy).toHaveBeenCalledTimes(1);
  });
});
