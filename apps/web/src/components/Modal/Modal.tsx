"use client";

/**
 * Modal component
 *
 * Uses two hooks:
 *   useEffect — adds/removes a keyboard listener when the modal opens/closes
 *   (no useState here — the parent controls open/close via props)
 *
 * Props:
 *   open     → boolean controlled by parent's useState
 *   onClose  → calls parent's setOpen(false)
 *   title    → text shown in the modal header
 *   children → whatever you put inside <Modal>...</Modal>
 */

import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  // useEffect: close modal when user presses Escape
  // The dependency array [open, onClose] means this effect re-runs
  // whenever `open` or `onClose` changes.
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey); // cleanup
  }, [open, onClose]);

  // Conditional rendering — if not open, render nothing
  if (!open) return null;

  return (
    // Backdrop — clicking outside closes the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      {/* Modal panel — stopPropagation prevents clicking inside from closing */}
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
