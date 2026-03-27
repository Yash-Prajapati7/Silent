import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useIsDarkMode } from '../stores/themeStore';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false 
}) => {
  const isDarkMode = useIsDarkMode();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative w-full max-w-md rounded-xl border-2 neo-card transform transition-all duration-200
        ${isDarkMode
          ? 'bg-[#111111] border-white text-[#FAFAFA] neo-dark'
          : 'bg-[#fffaf5] border-black text-[#111111] neo-light'
        }
      `}>
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center space-x-3 mb-4">
            <div className={`
              p-2 rounded-full
              ${isDestructive
                ? isDarkMode
                  ? 'text-red-400'
                  : 'text-red-600'
                : isDarkMode
                  ? 'text-[#FAFAFA]'
                  : 'text-[#09090B]'
              }
            `}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">
              {title}
            </h3>
          </div>

          {/* Message */}
          <p className={`
            mb-6 text-sm
            ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}
          `}>
            {message}
          </p>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`
                flex-1 px-4 py-2.5 rounded-md font-bold text-sm transition-colors duration-200 border-2 neo-btn
                ${isDarkMode
                  ? 'bg-[#111111] hover:bg-[#2f60ff] text-[#FAFAFA] border-white neo-dark'
                  : 'bg-[#fffaf5] hover:bg-[#ffe500] text-[#111111] border-black neo-light'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`
                flex-1 px-4 py-2.5 rounded-md font-bold text-sm transition-colors duration-200 border-2 neo-btn
                ${isDestructive
                  ? isDarkMode
                    ? 'bg-[#ff2d2d] hover:bg-[#e72626] text-white border-white neo-dark'
                    : 'bg-[#ff2d2d] hover:bg-[#e72626] text-white border-black neo-light'
                  : isDarkMode
                    ? 'bg-[#ffe500] hover:bg-[#ffdd00] text-[#111111] border-white neo-dark'
                    : 'bg-[#2f60ff] hover:bg-[#2450df] text-[#FAFAFA] border-black neo-light'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isLoading ? 'cursor-wait' : ''}
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
