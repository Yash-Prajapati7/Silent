import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useIsDarkMode } from '../stores/themeStore';

const Notification = ({ notification, onClose }) => {
  const isDarkMode = useIsDarkMode();

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    const base = 'flex items-center gap-3 p-3 sm:p-4 rounded-md border-2';

    switch (notification.type) {
      case 'success':
        return `${base} ${
          isDarkMode
            ? 'bg-[#111111] border-white text-[#b7f5cb] neo-dark'
            : 'bg-[#fffaf5] border-black text-[#146c43] neo-light'
        }`;
      case 'error':
        return `${base} ${
          isDarkMode
            ? 'bg-[#111111] border-white text-[#ff8f8f] neo-dark'
            : 'bg-[#fffaf5] border-black text-[#a31717] neo-light'
        }`;
      case 'warning':
        return `${base} ${
          isDarkMode
            ? 'bg-[#111111] border-white text-[#ffe500] neo-dark'
            : 'bg-[#fffaf5] border-black text-[#7d5b00] neo-light'
        }`;
      default:
        return `${base} ${
          isDarkMode
            ? 'bg-[#111111] border-white text-[#FAFAFA] neo-dark'
            : 'bg-[#fffaf5] border-black text-[#111111] neo-light'
        }`;
    }
  };

  return (
    <div className={getStyles()}>
      {getIcon()}
      <span className="flex-1 text-sm font-medium">{notification.message}</span>
      <button
        onClick={() => onClose(notification.id)}
        className={`
          p-1.5 rounded transition-colors border-2 neo-btn
          ${isDarkMode ? 'hover:bg-[#ff2d2d] border-white' : 'hover:bg-[#ffe500] border-black'}
        `}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const NotificationContainer = ({ notifications, onClose }) => {
  if (!notifications.length) return null;

  return (
    <div className="fixed top-20 right-3 sm:right-4 z-50 space-y-2 w-[calc(100%-1.5rem)] sm:w-auto sm:max-w-sm">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
