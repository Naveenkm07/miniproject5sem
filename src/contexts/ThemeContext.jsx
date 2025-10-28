import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Available theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Available color schemes
export const COLOR_SCHEMES = {
  DEFAULT: 'default',      // Purple gradient (current)
  OCEAN: 'ocean',          // Blue gradient
  SUNSET: 'sunset',        // Orange/Pink gradient
  FOREST: 'forest',        // Green gradient
  LAVENDER: 'lavender',    // Purple/Pink gradient
  CRIMSON: 'crimson',      // Red gradient
  MIDNIGHT: 'midnight',    // Dark blue gradient
  AURORA: 'aurora'         // Multi-color gradient
};

export const ThemeProvider = ({ children }) => {
  // Load saved preferences or use defaults
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme-mode') || THEME_MODES.AUTO;
  });

  const [colorScheme, setColorScheme] = useState(() => {
    return localStorage.getItem('color-scheme') || COLOR_SCHEMES.DEFAULT;
  });

  // Determine actual theme based on mode
  const [actualTheme, setActualTheme] = useState('light');

  useEffect(() => {
    if (themeMode === THEME_MODES.AUTO) {
      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        setActualTheme(e.matches ? 'dark' : 'light');
      };
      
      setActualTheme(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setActualTheme(themeMode);
    }
  }, [themeMode]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', actualTheme);
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    
    // Save preferences
    localStorage.setItem('theme-mode', themeMode);
    localStorage.setItem('color-scheme', colorScheme);
  }, [actualTheme, themeMode, colorScheme]);

  const changeThemeMode = (mode) => {
    setThemeMode(mode);
  };

  const changeColorScheme = (scheme) => {
    setColorScheme(scheme);
  };

  const toggleTheme = () => {
    if (themeMode === THEME_MODES.AUTO) {
      setThemeMode(THEME_MODES.LIGHT);
    } else if (themeMode === THEME_MODES.LIGHT) {
      setThemeMode(THEME_MODES.DARK);
    } else {
      setThemeMode(THEME_MODES.AUTO);
    }
  };

  const value = {
    themeMode,
    colorScheme,
    actualTheme,
    changeThemeMode,
    changeColorScheme,
    toggleTheme,
    THEME_MODES,
    COLOR_SCHEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
