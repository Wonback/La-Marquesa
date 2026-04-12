import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  success(message: string, duration = 3000) { this.show(message, 'success', duration); }
  error(message: string, duration = 4000)   { this.show(message, 'error',   duration); }
  info(message: string, duration = 3000)    { this.show(message, 'info',    duration); }

  dismiss(id: number) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }

  private show(message: string, type: ToastType, duration: number) {
    const id = this.nextId++;
    this.toastsSubject.next([...this.toastsSubject.value, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
