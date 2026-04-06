"use client";

import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{ toast: (message: string, type?: ToastType) => void }>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// Backward-compatible standalone function for non-hook usage
let _toastFn: ((message: string, type?: ToastType) => void) | null = null;
export function _registerToastFn(fn: (message: string, type?: ToastType) => void) { _toastFn = fn; }
export function showToast(message: string, type: ToastType = "success") { _toastFn?.(message, type); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  // Register for standalone showToast usage
  useEffect(() => {
    _registerToastFn(toast);
    return () => { _toastFn = null; };
  }, [toast]);

  const icons = { success: CheckCircle, error: XCircle, info: Info };
  const colors = {
    success: "border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]",
    error: "border-[#EB5757]/30 bg-[#EB5757]/10 text-[#EB5757]",
    info: "border-[#6E9FFF]/30 bg-[#6E9FFF]/10 text-[#6E9FFF]",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] space-y-2">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm animate-slideUp ${colors[t.type]}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
