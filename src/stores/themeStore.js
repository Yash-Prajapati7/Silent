import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      // State
      isDarkMode: false, // Default to light mode

      // Actions
      toggleTheme: () => set((state) => ({
        isDarkMode: !state.isDarkMode
      })),

      setTheme: (isDarkMode) => set({ isDarkMode }),

      // Computed values
      get theme() {
        return get().isDarkMode ? 'dark' : 'light';
      }
    }),
    {
      name: 'silentchat-theme-storage',
      // Custom storage implementation for backwards compatibility
      getStorage: () => ({
        getItem: (key) => {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              return JSON.parse(value);
            } catch {
              // Handle legacy theme storage format
              const legacyTheme = localStorage.getItem('silentchat-theme');
              if (legacyTheme) {
                return { state: { isDarkMode: legacyTheme === 'dark' } };
              }
            }
          }
          return null;
        },
        setItem: (key, value) => {
          localStorage.setItem(key, JSON.stringify(value));
          // Also maintain legacy format for compatibility
          localStorage.setItem('silentchat-theme', value.state.isDarkMode ? 'dark' : 'light');
        },
        removeItem: (key) => {
          localStorage.removeItem(key);
          localStorage.removeItem('silentchat-theme');
        }
      })
    }
  )
);

// Selectors for better performance
export const useIsDarkMode = () => useThemeStore((state) => state.isDarkMode);
export const useTheme = () => useThemeStore((state) => state.theme);

// Individual action selectors to prevent re-renders
export const useToggleTheme = () => useThemeStore((state) => state.toggleTheme);
export const useSetTheme = () => useThemeStore((state) => state.setTheme);

export default useThemeStore;
