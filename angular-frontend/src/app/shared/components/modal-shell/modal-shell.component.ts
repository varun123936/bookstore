import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-shell.component.html'
})
export class ModalShellComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() primaryText = 'Save';
  @Input() closeText = 'Cancel';
  @Input() hidePrimary = false;
  @Input() primaryDisabled = false;
  @Input() dangerPrimary = false;

  @Output() closed = new EventEmitter<void>();
  @Output() primaryAction = new EventEmitter<void>();

  closeModal(): void {
    this.closed.emit();
  }

  handlePrimaryAction(): void {
    this.primaryAction.emit();
  }

  handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
