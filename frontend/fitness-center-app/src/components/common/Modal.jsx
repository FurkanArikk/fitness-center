import React, { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({ title, children, onClose, isOpen, size = "medium" }) => {
  // ESC tuşu ile modalın kapatılması
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // Body scroll'unu engelle
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [onClose, isOpen]);

  // Modal açık değilse render etme
  if (!isOpen) return null;

  // Modal dışına tıklanınca kapatma
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Modal boyutu için CSS sınıflarını belirle
  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    xl: "max-w-6xl",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClass} max-h-[90vh] overflow-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
