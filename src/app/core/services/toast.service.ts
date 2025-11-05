import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private idCounter = 0;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    const toast: Toast = {
      id: ++this.idCounter,
      message,
      type
    };
    
    this.toasts.update(toasts => [...toasts, toast]);
    
    setTimeout(() => {
      this.remove(toast.id);
    }, 3000);
  }

  remove(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
