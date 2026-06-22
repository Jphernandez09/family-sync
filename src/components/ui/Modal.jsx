import { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-xl",
    full: "max-w-full mx-2",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet — slides up on mobile, centered on desktop */}
      <div
        className={clsx(
          "relative w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-float",
          "p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]",
          sizes[size],
          "max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        )}
      >
        {/* Handle bar (mobile sheet indicator) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-200 rounded-full sm:hidden" />

        <div className="flex items-center justify-between mb-4 mt-2 sm:mt-0">
          {title && <h2 className="text-lg font-bold text-slate-800">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
