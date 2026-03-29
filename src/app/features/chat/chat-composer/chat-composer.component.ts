import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-chat-composer',
  standalone: true,
  templateUrl: './chat-composer.component.html',
  styleUrl: './chat-composer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComposerComponent {
  readonly disabled = input(false);

  readonly messageSubmitted = output<string>();

  readonly draft = signal('');
  readonly canSubmit = computed(() => this.draft().trim().length > 0 && !this.disabled());

  @ViewChild('messageTextarea', { read: ElementRef })
  private messageTextareaRef?: ElementRef<HTMLTextAreaElement>;

  onInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }

    this.draft.set(target.value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.submit();
  }

  submit(): void {
    if (!this.canSubmit()) {
      return;
    }

    const message = this.draft().trim();
    this.messageSubmitted.emit(message);
    this.draft.set('');
  }

  focusTextarea(): void {
    this.messageTextareaRef?.nativeElement.focus();
  }
}
