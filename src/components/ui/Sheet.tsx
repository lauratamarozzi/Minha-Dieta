"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/** Bottom sheet modal — padrão usado em todas as telas de edição do app. */
export default function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-surface rounded-t-[var(--radius-lg)] max-h-[85dvh] overflow-y-auto animate-[sheet-up_0.2s_ease-out]">
        <div className="sticky top-0 bg-surface flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <h2 className="font-semibold text-foreground text-base">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-muted text-foreground-muted"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes sheet-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
