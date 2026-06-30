import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useApp } from "./AppProvider";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { isDark, isRTL, ds } = useApp();

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);

    // Auto dismiss
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toastMethods = {
    toast: addToast,
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    warning: (msg: string) => addToast(msg, "warning"),
    info: (msg: string) => addToast(msg, "info"),
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success": return <CheckCircle2 size={20} color="#10B981" />;
      case "error": return <XCircle size={20} color="#EF4444" />;
      case "warning": return <AlertTriangle size={20} color="#F59E0B" />;
      case "info": return <Info size={20} color="#3B82F6" />;
    }
  };

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <div style={{
        position: "fixed",
        bottom: 24,
        [isRTL ? "left" : "right"]: 24,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "none"
      }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: isDark ? ds.surface2 : "#FFFFFF",
                border: `1px solid ${isDark ? ds.border : "#E2E8F0"}`,
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                borderRadius: 14,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 280,
                maxWidth: 400,
                pointerEvents: "auto",
                direction: isRTL ? "rtl" : "ltr"
              }}
            >
              <div style={{ flexShrink: 0 }}>
                {getIcon(t.type)}
              </div>
              <div style={{ flex: 1, color: ds.textPrimary, fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>
                {t.message}
              </div>
              <button 
                onClick={() => removeToast(t.id)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6, transition: "opacity 0.2s", flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
              >
                <X size={16} color={ds.textPrimary} />
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
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
