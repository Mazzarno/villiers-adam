'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AccessibilityProvider } from '@/contexts/accessibility-context';

type ProvidersProps = React.ComponentProps<typeof NextThemesProvider>;

export function Providers({ children, ...props }: ProvidersProps) {
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
