export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let activeToasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function notify() {
  const snapshot = [...activeToasts];
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribeToasts(listener: ToastListener) {
  listeners.add(listener);
  listener([...activeToasts]);
  return () => {
    listeners.delete(listener);
  };
}

export function dismissToast(id: string) {
  activeToasts = activeToasts.filter((t) => t.id !== id);
  notify();
}

function addToast(
  type: ToastType,
  title: string,
  description?: string,
  duration = 4000
) {
  const id = "toast_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const newToast: ToastItem = { id, type, title, description, duration };

  // Stack at top, keep max 4 toasts
  activeToasts = [newToast, ...activeToasts].slice(0, 4);
  notify();

  if (duration > 0 && typeof window !== "undefined") {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }

  return id;
}

export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    addToast("success", title, description, duration ?? 3500),
  error: (title: string, description?: string, duration?: number) =>
    addToast("error", title, description, duration ?? 5000),
  info: (title: string, description?: string, duration?: number) =>
    addToast("info", title, description, duration ?? 3500),
  warning: (title: string, description?: string, duration?: number) =>
    addToast("warning", title, description, duration ?? 4500),
  dismiss: (id: string) => dismissToast(id),
};

export default toast;
