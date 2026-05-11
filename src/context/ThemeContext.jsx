import { createContext, useContext, useState, useEffect } from 'react';
import { THEMES } from '../constants';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [themeName, setThemeName] = useState('lavender_dream');

  useEffect(() => {
    if (user?.theme) {
      setThemeName(user.theme);
    }
  }, [user]);

  const theme = THEMES[themeName] || THEMES.lavender_dream;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-light', theme.primaryLight);
    root.style.setProperty('--primary-gradient', theme.primaryGradient);
    root.style.setProperty('--sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--sidebar-text', theme.sidebarText);
    root.style.setProperty('--sidebar-active', theme.sidebarActive);
    root.style.setProperty('--card-bg', theme.cardBg);
    root.style.setProperty('--bg-main', theme.bgMain);
    root.style.setProperty('--bg-gradient', theme.bgGradient);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-light', theme.accentLight);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--shadow', theme.shadow);
    root.style.setProperty('--glass', theme.glass);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setThemeName(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, changeTheme, allThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}
