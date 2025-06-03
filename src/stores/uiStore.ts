
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface UIState {
  // State
  isLoading: boolean;
  toasts: Toast[];
  networkStatus: 'online' | 'offline';
  
  // Actions
  setLoading: (loading: boolean) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setNetworkStatus: (status: 'online' | 'offline') => void;
  
  // Utility
  clearToasts: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isLoading: false,
      toasts: [],
      networkStatus: 'online',

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        
        set((state) => ({
          toasts: [...state.toasts, newToast]
        }));

        // Auto remove after duration
        const duration = toast.duration || 5000;
        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      },

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(toast => toast.id !== id)
      })),

      setNetworkStatus: (status) => set({ networkStatus: status }),

      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'ui-store',
    }
  )
);
