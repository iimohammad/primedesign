'use client';
import { brandScale, contrastRatio, type Density, type ThemeMode } from '@primedesign/tokens';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
export type Locale = 'fa-IR' | 'en-US' | 'ar';
interface DesignContext {
  brand: string;
  radius: number;
  density: Density;
  fontFamily: string;
  locale: Locale;
  dir: 'rtl' | 'ltr';
  digits: 'fa' | 'latin';
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
}
const Context = createContext<DesignContext>({
  brand: '#6254df',
  radius: 16,
  density: 'comfortable',
  fontFamily: 'Vazirmatn, Tahoma, system-ui, sans-serif',
  locale: 'fa-IR',
  dir: 'rtl',
  digits: 'fa',
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
});
export interface PrimeProviderProps {
  children: ReactNode;
  locale?: Locale;
  dir?: 'rtl' | 'ltr';
  digits?: 'fa' | 'latin';
  theme?: ThemeMode;
  defaultTheme?: ThemeMode;
  onThemeChange?: (v: ThemeMode) => void;
  brand?: string;
  radius?: number;
  fontFamily?: string;
  density?: Density;
  storageKey?: string;
  className?: string;
}
export function PrimeProvider({
  children,
  locale = 'fa-IR',
  dir = locale === 'en-US' ? 'ltr' : 'rtl',
  digits = locale === 'fa-IR' ? 'fa' : 'latin',
  theme: controlled,
  defaultTheme = 'light',
  onThemeChange,
  brand = '#6254df',
  radius = 16,
  fontFamily = 'Vazirmatn, Tahoma, system-ui, sans-serif',
  density = 'comfortable',
  storageKey,
  className,
}: PrimeProviderProps) {
  const [inner, setInner] = useState<ThemeMode>(defaultTheme),
    [system, setSystem] = useState<'light' | 'dark'>('light');
  const theme = controlled ?? inner;
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const sync = () => setSystem(media.matches ? 'dark' : 'light');
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (!storageKey || controlled !== undefined) return;
    try {
      const v = localStorage.getItem(storageKey);
      if (v === 'light' || v === 'dark' || v === 'system') setInner(v);
    } catch {}
  }, [storageKey, controlled]);
  const setTheme = (v: ThemeMode) => {
    if (controlled === undefined) setInner(v);
    onThemeChange?.(v);
    if (storageKey)
      try {
        localStorage.setItem(storageKey, v);
      } catch {}
  };
  const resolvedTheme = theme === 'system' ? system : theme;
  const style = useMemo(() => {
    const scale = brandScale(brand);
    return {
      '--pd-brand': brand,
      '--pd-on-brand':
        contrastRatio(brand, '#ffffff') >= contrastRatio(brand, '#101725') ? '#ffffff' : '#101725',
      '--pd-font': fontFamily,
      '--pd-radius': `${Math.max(0, Math.min(40, radius))}px`,
      ...Object.fromEntries(Object.entries(scale).map(([k, v]) => [`--pd-brand-${k}`, v])),
    } as CSSProperties;
  }, [brand, radius, fontFamily]);
  return (
    <Context.Provider
      value={{
        locale,
        dir,
        digits,
        theme,
        setTheme,
        resolvedTheme,
        brand,
        radius,
        density,
        fontFamily,
      }}
    >
      <div
        className={['pd-root', className].filter(Boolean).join(' ')}
        dir={dir}
        lang={locale}
        data-pd-theme={resolvedTheme}
        data-pd-density={density}
        style={style}
      >
        {children}
      </div>
    </Context.Provider>
  );
}
export const usePrime = () => useContext(Context);
export const useTheme = usePrime;
export function useLabels<T>(fa: T, en: T): T {
  return usePrime().locale === 'fa-IR' ? fa : en;
}
