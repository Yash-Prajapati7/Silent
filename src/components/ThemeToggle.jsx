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
          ? 'p-2.5 rounded-md transition-all duration-200 border-2 neo-btn'
          : 'fixed top-4 right-4 z-50 p-2.5 rounded-md transition-all duration-200 border-2 neo-btn'
        }
        ${isDarkMode
          ? 'text-[#FAFAFA] bg-[#111111] border-white neo-dark hover:bg-[#2f60ff]'
          : 'text-[#111111] bg-[#fffaf5] border-black neo-light hover:bg-[#ffe500]'
        }
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
