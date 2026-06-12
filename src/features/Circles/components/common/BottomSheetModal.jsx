import { AnimatePresence, motion } from "framer-motion";

// Shared overlay + panel shell for the Circles modals: a bottom sheet on
// mobile (sm:items-center centers it on larger screens). z-[60] keeps it
// above BottomNavigation (z-50).
export default function BottomSheetModal({ isOpen, onClose, children, panelClassName = "", animated = false }) {
  if (!animated) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative bg-white w-full shadow-xl ${panelClassName}`}>{children}</div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className={`relative bg-white w-full shadow-xl ${panelClassName}`}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
