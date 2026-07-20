import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

function useModalA11y(isOpen, onClose) {
  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement;

    // Focus the panel itself first so Tab enters its contents naturally;
    // individual modals can still autofocus a specific field if they need to.
    panelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }

      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  return panelRef;
}

export default function BottomSheetModal({ isOpen, onClose, children, panelClassName = "", animated = false, centered = false }) {
  // `centered` renders the panel dialog-style (vertically/horizontally centered)
  // at every breakpoint — for confirmations. The default docks to the bottom on
  // mobile and only centers from sm+ — for action sheets / overflow menus.
  const overlayClassName = centered
    ? "fixed inset-0 z-[200] flex items-center justify-center p-4"
    : "fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4";
  const panelWidthClass = centered ? "w-full max-w-sm" : "w-full";

  const panelRef = useModalA11y(isOpen, onClose);

  if (!animated) {
    if (!isOpen) return null;
    return createPortal(
      <div className={overlayClassName}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className={`relative bg-white ${panelWidthClass} shadow-xl ${panelClassName} focus:outline-none`}
        >
          {children}
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={overlayClassName}>
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className={`relative bg-white ${panelWidthClass} shadow-xl ${panelClassName} focus:outline-none`}
            initial={{ opacity: 0, y: centered ? 12 : 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: centered ? 12 : 40, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
