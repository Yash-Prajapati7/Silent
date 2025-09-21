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
    const base = 'flex items-center gap-3 p-4 rounded-lg border shadow-lg';
    
    switch (notification.type) {
      case 'success':
        return `${base} ${
          isDarkMode 
            ? 'bg-green-900 border-green-700 text-green-200' 
            : 'bg-green-100 border-green-300 text-green-800'
        }`;
      case 'error':
        return `${base} ${
          isDarkMode 
            ? 'bg-red-900 border-red-700 text-red-200' 
            : 'bg-red-100 border-red-300 text-red-800'
        }`;
      case 'warning':
        return `${base} ${
          isDarkMode 
            ? 'bg-yellow-900 border-yellow-700 text-yellow-200' 
            : 'bg-yellow-100 border-yellow-300 text-yellow-800'
        }`;
      default:
        return `${base} ${
          isDarkMode 
            ? 'bg-blue-900 border-blue-700 text-blue-200' 
            : 'bg-blue-100 border-blue-300 text-blue-800'
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
          p-1 rounded transition-colors
          ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'}
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
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
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
