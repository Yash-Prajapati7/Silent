import React, { useState, useEffect } from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { useIsDarkMode } from '../stores/themeStore';
import { apiService } from '../services/api';

const ConnectionStatus = () => {
  const isDarkMode = useIsDarkMode();
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsChecking(true);
        await apiService.healthCheck();
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Check initially
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isConnected) {
    return null; // Don't show anything when connected
  }

  return (
    <div className={`
      fixed top-16 right-4 z-40 p-3 rounded-lg border-2
      ${isDarkMode 
        ? 'bg-[#111111] border-white text-[#ff8f8f] neo-dark' 
        : 'bg-[#fffaf5] border-black text-[#a31717] neo-light'
      }
      flex items-center gap-2 text-sm
    `}>
      {isChecking ? (
        <AlertCircle className="w-4 h-4 animate-pulse" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
      <span>
        {isChecking ? 'Checking connection...' : 'Backend server offline'}
      </span>
    </div>
  );
};

export default ConnectionStatus;
