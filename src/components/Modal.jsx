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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative w-full max-w-md p-6 rounded-2xl shadow-2xl
        transform transition-all duration-300 scale-100
        ${isDarkMode 
          ? 'bg-black border border-white/20' 
          : 'bg-white border border-gray-300'
        }
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`
            text-xl font-bold
            ${isDarkMode ? 'text-white' : 'text-black'}
          `}>
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'hover:bg-white/10 text-white' 
                  : 'hover:bg-black/10 text-black'
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
