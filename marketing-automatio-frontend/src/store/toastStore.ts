import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto remove toast after duration
    const duration = toast.duration || 3000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  success: (message, duration) =>
    get().addToast({ type: 'success', message, duration }),

  error: (message, duration = 5000) =>
    get().addToast({ type: 'error', message, duration }),

  info: (message, duration) =>
    get().addToast({ type: 'info', message, duration }),

  warning: (message, duration) =>
    get().addToast({ type: 'warning', message, duration }),
}));
