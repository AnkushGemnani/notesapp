import { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Only check localStorage or system preference once at initial render
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
      return false;
    }
  });

  // Simple toggle function - no useMemo needed here as it was causing issues
  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Apply theme to document when darkMode changes
  useEffect(() => {
    try {
      // Apply theme class to the root HTML element
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Store preference in localStorage (only in the effect, not in toggleTheme)
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 