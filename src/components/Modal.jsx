import React from 'react';
import { X } from 'lucide-react';
import { useIsDarkMode } from '../stores/themeStore';

const Modal = ({ isOpen, onClose, title, children, showCloseButton = true }) => {
  const isDarkMode = useIsDarkMode();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/55"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative w-full max-w-md p-5 sm:p-6 rounded-xl border-2 neo-card
        transform transition-all duration-300 scale-100
        ${isDarkMode 
          ? 'bg-[#111111] border-white neo-dark' 
          : 'bg-[#fffaf5] border-black neo-light'
        }
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`
            text-xl font-bold tracking-tight
            ${isDarkMode ? 'text-[#FAFAFA]' : 'text-[#09090B]'}
          `}>
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className={`
                p-2 rounded-md transition-colors border-2 neo-btn
                ${isDarkMode 
                  ? 'bg-[#111111] border-white text-[#FAFAFA] hover:bg-[#ff2d2d]' 
                  : 'bg-[#fffaf5] border-black text-[#111111] hover:bg-[#ffe500]'
                }
              `}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
