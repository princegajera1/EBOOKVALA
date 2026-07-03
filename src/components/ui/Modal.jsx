import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ 
              y: window.innerWidth < 640 ? "100%" : 15, 
              scale: window.innerWidth < 640 ? 1 : 0.95,
              opacity: 0 
            }}
            animate={{ 
              y: 0, 
              scale: 1,
              opacity: 1 
            }}
            exit={{ 
              y: window.innerWidth < 640 ? "100%" : 10, 
              scale: window.innerWidth < 640 ? 1 : 0.95,
              opacity: 0 
            }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className={`relative z-10 w-full max-w-lg bg-brand-bg border border-brand-border shadow-brand rounded-t-[24px] sm:rounded-brand p-6 overflow-hidden max-h-[90vh] flex flex-col ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 select-none">
              {title && (
                <h3 className="text-xl font-display font-bold text-brand-text">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-full text-brand-text-secondary hover:bg-brand-bg-secondary hover:text-brand-text transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto no-scrollbar flex-1 pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
