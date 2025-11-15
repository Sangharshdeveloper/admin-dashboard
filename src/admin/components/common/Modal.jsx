import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 transition-opacity flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Modal content container */}
      <div
        className="relative bg-white rounded-xl shadow-2xl transform transition-all max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="bg-white p-6 rounded-xl">
          <div className="flex justify-between items-start border-b pb-3 sticky top-0 bg-white z-10">
            <h3 className="text-xl font-bold text-gray-900" id="modal-title">
              {title}
            </h3>
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              onClick={onClose}
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;