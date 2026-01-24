'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';
import { AccessibilityProvider } from '@/contexts/accessibility-context';

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <AccessibilityProvider>
        {children}
      </AccessibilityProvider>
    </NextThemesProvider>
  );
}
