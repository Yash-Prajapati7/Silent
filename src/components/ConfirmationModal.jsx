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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative w-full max-w-md rounded-2xl shadow-2xl border transform transition-all duration-200
        ${isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-900'
        }
      `}>
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center space-x-3 mb-4">
            <div className={`
              p-2 rounded-full
              ${isDestructive 
                ? isDarkMode 
                  ? 'bg-red-900/20 text-red-400' 
                  : 'bg-red-100 text-red-600'
                : isDarkMode 
                  ? 'bg-blue-900/20 text-blue-400' 
                  : 'bg-blue-100 text-blue-600'
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
            ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
          `}>
            {message}
          </p>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`
                flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200
                ${isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
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
                flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200
                ${isDestructive
                  ? isDarkMode
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                  : isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
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
