import { Injectable, signal } from '@angular/core';

export interface ConfirmationModal {
  title: string;
  message: string;
  onConfirm: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  readonly modal = signal<ConfirmationModal | null>(null);

  showConfirmation(title: string, message: string, onConfirm: () => void) {
    this.modal.set({ title, message, onConfirm });
  }

  close() {
    this.modal.set(null);
  }

  confirm() {
    const current = this.modal();
    if (current) {
      current.onConfirm();
      this.close();
    }
  }
}
