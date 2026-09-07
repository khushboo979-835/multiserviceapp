import React, { createContext, useContext, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react-native";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ id: number; message: string; type: ToastType } | null>(null);

  const showToast = useCallback((options: ToastOptions | string) => {
    const opts: ToastOptions = typeof options === "string" ? { message: options } : options;
    const type = opts.type || "info";
    const duration = opts.duration || 3500;
    const id = Date.now();

    setToast({ id, message: opts.message, type });

    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, duration);
  }, []);

  const showSuccess = useCallback((message: string) => showToast({ message, type: "success" }), [showToast]);
  const showError = useCallback((message: string) => showToast({ message, type: "error" }), [showToast]);
  const showInfo = useCallback((message: string) => showToast({ message, type: "info" }), [showToast]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={20} color="#10b981" />;
      case "error":
        return <AlertCircle size={20} color="#f43f5e" />;
      case "warning":
        return <AlertTriangle size={20} color="#f59e0b" />;
      default:
        return <Info size={20} color="#8b5cf6" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/40 bg-dark-900";
      case "error":
        return "border-rose-500/40 bg-dark-900";
      case "warning":
        return "border-amber-500/40 bg-dark-900";
      default:
        return "border-primary-500/40 bg-dark-900";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      {toast && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOutUp.duration(200)}
          style={[styles.toastContainer]}
          pointerEvents="box-none"
        >
          <View className={`flex-row items-center p-4 rounded-2xl border shadow-xl shadow-black/50 ${getBorderColor(toast.type)}`}>
            {getToastIcon(toast.type)}
            <Text className="text-white text-sm font-medium ml-3 flex-1">{toast.message}</Text>
            <TouchableOpacity onPress={() => setToast(null)} className="ml-2 p-1">
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 44,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
});
