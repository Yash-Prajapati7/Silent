import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useIsDarkMode, useToggleTheme } from '../stores/themeStore';

const ThemeToggle = ({ inline = false, showFixed = false }) => {
  const isDarkMode = useIsDarkMode();
  const toggleTheme = useToggleTheme();

  // Don't render fixed position theme toggle unless explicitly requested
  if (!inline && !showFixed) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${inline
          ? 'p-2 rounded-lg transition-all duration-300 border-2'
          : 'fixed top-4 right-4 z-50 p-3 rounded-full transition-all duration-300 border'
        }
        ${isDarkMode
          ? inline
            ? 'bg-white text-black border-white hover:bg-black hover:text-white'
            : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
          : inline
            ? 'bg-black text-white border-black hover:bg-white hover:text-black'
            : 'bg-black/10 hover:bg-black/20 text-black border-black/20'
        }
        hover:scale-110 active:scale-95
      `}
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
