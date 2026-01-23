'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  Sun,
  Moon,
  Type,
  Eye,
  Contrast,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AccessibilitySettings {
  seniorMode: boolean;
  dyslexicMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}

const defaultSettings: AccessibilitySettings = {
  seniorMode: false,
  dyslexicMode: false,
  highContrast: false,
  reducedMotion: false,
  fontSize: 'normal',
};

export function AccessibilityPanel() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Charger les préférences sauvegardées
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      applySettings(parsed);
    }

    // Détecter les préférences système
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings((prev) => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Mode senior
    if (newSettings.seniorMode) {
      root.classList.add('senior-mode');
    } else {
      root.classList.remove('senior-mode');
    }

    // Mode dyslexique
    if (newSettings.dyslexicMode) {
      root.classList.add('dyslexic-mode');
    } else {
      root.classList.remove('dyslexic-mode');
    }

    // Contraste élevé
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Taille de police
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-xlarge');
    root.classList.add(`font-size-${newSettings.fontSize}`);
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
    setTheme('system');
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Apparence
          </CardTitle>
          <CardDescription>Choisissez le thème de couleurs du site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                theme === 'light'
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted hover:bg-muted/80'
              )}
            >
              <Sun className="h-6 w-6" />
              <span className="text-sm font-medium">Clair</span>
              {theme === 'light' && <Check className="h-4 w-4 text-primary" />}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                theme === 'dark'
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted hover:bg-muted/80'
              )}
            >
              <Moon className="h-6 w-6" />
              <span className="text-sm font-medium">Sombre</span>
              {theme === 'dark' && <Check className="h-4 w-4 text-primary" />}
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                theme === 'system'
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted hover:bg-muted/80'
              )}
            >
              <Contrast className="h-6 w-6" />
              <span className="text-sm font-medium">Système</span>
              {theme === 'system' && <Check className="h-4 w-4 text-primary" />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Font size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Taille du texte
          </CardTitle>
          <CardDescription>Ajustez la taille de la police pour faciliter la lecture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => updateSetting('fontSize', 'normal')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                settings.fontSize === 'normal'
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted hover:bg-muted/80'
              )}
            >
              <span className="text-base font-medium">Aa</span>
              <span className="text-sm">Normal</span>
            </button>
            <button
              onClick={() => updateSetting('fontSize', 'large')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                settings.fontSize === 'large'
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted hover:bg-muted/80'
              )}
            >
              <span className="text-lg font-medium">Aa</span>
              <span className="text-sm">Grand</span>
            </button>
            <button
              onClick={() => updateSetting('fontSize', 'xlarge')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                settings.fontSize === 'xlarge'
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted hover:bg-muted/80'
              )}
            >
              <span className="text-xl font-medium">Aa</span>
              <span className="text-sm">Très grand</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility modes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Modes d'accessibilité
          </CardTitle>
          <CardDescription>Activez les options adaptées à vos besoins</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Mode senior</p>
                <p className="text-sm text-muted-foreground">
                  Texte agrandi et espacement augmenté
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.seniorMode}
              onChange={(e) => updateSetting('seniorMode', e.target.checked)}
              className="h-5 w-5 rounded border-input accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Mode dyslexie</p>
                <p className="text-sm text-muted-foreground">
                  Police adaptée et espacement des lettres
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.dyslexicMode}
              onChange={(e) => updateSetting('dyslexicMode', e.target.checked)}
              className="h-5 w-5 rounded border-input accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
            <div className="flex items-center gap-3">
              <Contrast className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Contraste élevé</p>
                <p className="text-sm text-muted-foreground">
                  Améliore la lisibilité des textes
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => updateSetting('highContrast', e.target.checked)}
              className="h-5 w-5 rounded border-input accent-primary"
            />
          </label>
        </CardContent>
      </Card>

      {/* Reset */}
      <Button variant="outline" onClick={resetSettings} className="w-full">
        <RotateCcw className="h-4 w-4 mr-2" />
        Réinitialiser les paramètres
      </Button>
    </div>
  );
}
