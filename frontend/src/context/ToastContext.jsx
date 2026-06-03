import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 18px",
              borderRadius: "12px",
              minWidth: "260px",
              maxWidth: "360px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              cursor: "pointer",
              animation: "slideInToast 0.3s ease",
              fontFamily: "inherit",
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: 1.4,
              ...(toast.type === "success"
                ? {
                    background: "linear-gradient(135deg, #1a7f4b 0%, #22c55e 100%)",
                    color: "#fff",
                    border: "1px solid #16a34a",
                  }
                : toast.type === "error"
                ? {
                    background: "linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)",
                    color: "#fff",
                    border: "1px solid #dc2626",
                  }
                : {
                    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                    color: "#fff",
                    border: "1px solid #2563eb",
                  }),
            }}
          >
            <span style={{ fontSize: "20px", flexShrink: 0 }}>
              {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)   scale(1);    }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
