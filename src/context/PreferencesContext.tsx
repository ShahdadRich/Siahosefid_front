import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { AppLanguage, AppTheme, formatLocalizedPrice } from '../utils/siahSefidLogic';

interface PreferencesContextValue {
  lang: AppLanguage;
  theme: AppTheme;
  isRtl: boolean;
  isDark: boolean;
  setLang: (lang: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  setIsDark: (isDark: boolean) => void;
  toggleLang: () => void;
  toggleTheme: () => void;
  t: (fa: string, en: string) => string;
  formatPrice: (amount: number) => string;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLang] = useState<AppLanguage>('fa');
  const [theme, setTheme] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('siah_sefid_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('siah_sefid_theme', theme);
    }
  }, [theme]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'fa' ? 'en' : 'fa'));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setIsDark = useCallback((dark: boolean) => {
    setTheme(dark ? 'dark' : 'light');
  }, []);

  const t = useCallback(
    (fa: string, en: string) => (lang === 'fa' ? fa : en),
    [lang]
  );

  const formatPrice = useCallback(
    (amount: number) => formatLocalizedPrice(amount, lang),
    [lang]
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      lang,
      theme,
      isRtl: lang === 'fa',
      isDark: theme === 'dark',
      setLang,
      setTheme,
      setIsDark,
      toggleLang,
      toggleTheme,
      t,
      formatPrice,
    }),
    [lang, theme, setIsDark, toggleLang, toggleTheme, t, formatPrice]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return ctx;
}
