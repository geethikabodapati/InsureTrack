import { useState } from "react";
 
/**
 * useToast — fixed-position toast, never causes layout shift.
 * Usage:
 *   const { toast, showToast, ToastEl } = useToast();
 *   showToast("success", "Done!");
 *   return <div>{ToastEl}{...rest of page}</div>
 */
export function useToast(duration = 4000) {
  const [toast, setToast] = useState(null);
 
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), duration);
  };
 
  const ToastEl = toast ? (
    <div className={`adj-toast-fixed adj-toast-${toast.type}`}>
      <span style={{ flexShrink: 0, fontSize: 15 }}>
        {toast.type === "success" ? "✓" : toast.type === "warning" ? "⚠" : "✕"}
      </span>
      {toast.text}
    </div>
  ) : null;
 
  return { toast, showToast, ToastEl };
}