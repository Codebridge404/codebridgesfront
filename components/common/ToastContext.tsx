'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
  showToast: (item: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
  error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
};

const TOAST_STYLES = {
  success: 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-900/5',
  error: 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-900/5',
  warning: 'bg-amber-50/95 border-amber-200 text-amber-900 shadow-amber-900/5',
  info: 'bg-blue-50/95 border-blue-200 text-blue-900 shadow-blue-900/5',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...item, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = item.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const toast = {
    success: useCallback((message: string, title?: string, duration?: number) => {
      showToast({ type: 'success', message, title, duration });
    }, [showToast]),
    error: useCallback((message: string, title?: string, duration?: number) => {
      showToast({ type: 'error', message, title, duration: duration ?? 5000 });
    }, [showToast]),
    warning: useCallback((message: string, title?: string, duration?: number) => {
      showToast({ type: 'warning', message, title, duration });
    }, [showToast]),
    info: useCallback((message: string, title?: string, duration?: number) => {
      showToast({ type: 'info', message, title, duration });
    }, [showToast]),
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, dismissToast }}>
      {children}

      {/* Global Floating Toast Container */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[100000] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-md shadow-lg flex items-start gap-3 text-xs ${TOAST_STYLES[t.type]}`}
            >
              {TOAST_ICONS[t.type]}
              <div className="flex-1 min-w-0 pr-1">
                {t.title && <h5 className="font-extrabold text-sm mb-0.5 leading-snug">{t.title}</h5>}
                <p className="font-semibold leading-relaxed break-words">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
