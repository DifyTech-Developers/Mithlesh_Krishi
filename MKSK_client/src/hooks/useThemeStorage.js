import { useState, useEffect } from 'react';

export const useThemeStorage = (defaultTheme = 'light') => {
  const [storedTheme, setStoredTheme] = useState(() => {
    try {
      const item = window.localStorage.getItem('theme');
      return item ? item : defaultTheme;
    } catch (error) {
      return defaultTheme;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('theme', storedTheme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  }, [storedTheme]);

  return [storedTheme, setStoredTheme];
};

export default useThemeStorage;