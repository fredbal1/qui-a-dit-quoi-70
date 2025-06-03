
import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-80 max-w-md p-4 rounded-lg shadow-lg border animate-slide-in-right
            ${toast.variant === 'destructive' 
              ? 'bg-red-500/90 border-red-400 text-white' 
              : 'bg-green-500/90 border-green-400 text-white'
            }
          `}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {toast.variant === 'destructive' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{toast.title}</h4>
              {toast.description && (
                <p className="text-sm opacity-90 mt-1">{toast.description}</p>
              )}
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
