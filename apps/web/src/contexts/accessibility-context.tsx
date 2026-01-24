'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

// Types pour les paramètres d'accessibilité
export type TextSize = 'normal' | 'large' | 'xlarge';

export interface AccessibilitySettings {
  seniorMode: boolean;
  dyslexicMode: boolean;
  highContrast: boolean;
  textSize: TextSize;
  reducedMotion: boolean;
}

interface AccessibilityContextValue extends AccessibilitySettings {
  // Setters individuels
  setSeniorMode: (value: boolean) => void;
  setDyslexicMode: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  setTextSize: (value: TextSize) => void;
  setReducedMotion: (value: boolean) => void;
  // Réinitialiser
  resetSettings: () => void;
  // État du thème (next-themes)
  theme: string | undefined;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
}

const defaultSettings: AccessibilitySettings = {
  seniorMode: false,
  dyslexicMode: false,
  highContrast: false,
  textSize: 'normal',
  reducedMotion: false,
};

const AccessibilityContext = React.createContext<AccessibilityContextValue | undefined>(
  undefined
);

const STORAGE_KEY = 'villiers-adam-accessibility';

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [settings, setSettings] = React.useState<AccessibilitySettings>(defaultSettings);
  const [mounted, setMounted] = React.useState(false);

  // Charger les paramètres depuis localStorage au montage
  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AccessibilitySettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres d\'accessibilité:', error);
    }

    // Détecter la préférence système pour reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setSettings((prev) => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // Sauvegarder les paramètres dans localStorage
  React.useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des paramètres d\'accessibilité:', error);
      }
    }
  }, [settings, mounted]);

  // Appliquer les classes CSS sur le document
  React.useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;

    // Senior mode
    if (settings.seniorMode) {
      html.classList.add('senior-mode');
    } else {
      html.classList.remove('senior-mode');
    }

    // Dyslexic mode
    if (settings.dyslexicMode) {
      html.classList.add('dyslexic-mode');
    } else {
      html.classList.remove('dyslexic-mode');
    }

    // High contrast
    if (settings.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }

    // Text size
    html.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
    html.classList.add(`text-size-${settings.textSize}`);

    // Reduced motion
    if (settings.reducedMotion) {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }
  }, [settings, mounted]);

  // Setters
  const setSeniorMode = React.useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, seniorMode: value }));
  }, []);

  const setDyslexicMode = React.useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, dyslexicMode: value }));
  }, []);

  const setHighContrast = React.useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, highContrast: value }));
  }, []);

  const setTextSize = React.useCallback((value: TextSize) => {
    setSettings((prev) => ({ ...prev, textSize: value }));
  }, []);

  const setReducedMotion = React.useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, reducedMotion: value }));
  }, []);

  const resetSettings = React.useCallback(() => {
    setSettings(defaultSettings);
    setTheme('system');
  }, [setTheme]);

  const value: AccessibilityContextValue = {
    ...settings,
    setSeniorMode,
    setDyslexicMode,
    setHighContrast,
    setTextSize,
    setReducedMotion,
    resetSettings,
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility doit être utilisé dans un AccessibilityProvider');
  }
  return context;
}

// Hook pour vérifier si on est côté client
export function useIsMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
