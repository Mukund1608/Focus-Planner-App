import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  fontScale: number; // 1.0 = base, 1.125 = md, 1.25 = lg
  toggleHighContrast: () => void;
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'focusboard-accessibility';

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).highContrast ?? false;
      } catch (_) {}
    }
    return false;
  });

  const [fontScale, setFontScale] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).fontScale ?? 1.0;
      } catch (_) {}
    }
    return 1.0;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ highContrast, fontScale }));
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast, fontScale]);

  const value = useMemo<AccessibilityContextType>(() => ({
    highContrast,
    fontScale,
    toggleHighContrast: () => setHighContrast((v) => !v),
    increaseFont: () => setFontScale((v) => Math.min(1.5, parseFloat((v + 0.125).toFixed(3)))),
    decreaseFont: () => setFontScale((v) => Math.max(0.875, parseFloat((v - 0.125).toFixed(3)))),
    resetFont: () => setFontScale(1.0),
  }), [highContrast, fontScale]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export function useAccessibility(): AccessibilityContextType {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}
