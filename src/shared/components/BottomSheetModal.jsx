import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function BottomSheetModal({ isOpen, onClose, children, panelClassName = "", animated = false, centered = false }) {
  // `centered` renders the panel dialog-style (vertically/horizontally centered)
  // at every breakpoint — for confirmations. The default docks to the bottom on
  // mobile and only centers from sm+ — for action sheets / overflow menus.
  const overlayClassName = centered
    ? "fixed inset-0 z-[200] flex items-center justify-center p-4"
    : "fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4";
  const panelWidthClass = centered ? "w-full max-w-sm" : "w-full";

  if (!animated) {
    if (!isOpen) return null;
    return createPortal(
      <div className={overlayClassName}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative bg-white ${panelWidthClass} shadow-xl ${panelClassName}`}>{children}</div>
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
            className={`relative bg-white ${panelWidthClass} shadow-xl ${panelClassName}`}
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
