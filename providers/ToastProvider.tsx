import React, { createContext, useContext, useState, useCallback } from "react";

import Toast from "@/components/Toast";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState({
    message: "",
    type: "info" as ToastType,
    visible: false,
  });

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({
      message,
      type,
      visible: true,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useGlobalToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useGlobalToast must be used within a ToastProvider");
  }
  return context;
}
