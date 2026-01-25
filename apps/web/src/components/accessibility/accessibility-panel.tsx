'use client';

import {
  Sun,
  Moon,
  Type,
  Eye,
  Contrast,
  RotateCcw,
  Check,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAccessibility, useIsMounted, type TextSize } from '@/contexts/accessibility-context';

export function AccessibilityPanel() {
  const {
    seniorMode,
    dyslexicMode,
    highContrast,
    textSize,
    reducedMotion,
    setSeniorMode,
    setDyslexicMode,
    setHighContrast,
    setTextSize,
    setReducedMotion,
    resetSettings,
    theme,
    setTheme,
  } = useAccessibility();

  const mounted = useIsMounted();

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
            {(['normal', 'large', 'xlarge'] as TextSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setTextSize(size)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                  textSize === size
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-muted hover:bg-muted/80'
                )}
              >
                <span className={cn(
                  'font-medium',
                  size === 'normal' && 'text-base',
                  size === 'large' && 'text-lg',
                  size === 'xlarge' && 'text-xl'
                )}>Aa</span>
                <span className="text-sm">
                  {size === 'normal' && 'Normal'}
                  {size === 'large' && 'Grand'}
                  {size === 'xlarge' && 'Très grand'}
                </span>
                {textSize === size && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility modes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Modes d&apos;accessibilité
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
              checked={seniorMode}
              onChange={(e) => setSeniorMode(e.target.checked)}
              className="h-5 w-5 rounded border-input accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Mode dyslexie</p>
                <p className="text-sm text-muted-foreground">
                  Police OpenDyslexic et espacement des lettres
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={dyslexicMode}
              onChange={(e) => setDyslexicMode(e.target.checked)}
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
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="h-5 w-5 rounded border-input accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Réduire les animations</p>
                <p className="text-sm text-muted-foreground">
                  Désactive les animations et transitions
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
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
