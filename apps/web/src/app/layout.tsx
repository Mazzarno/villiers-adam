import type { Metadata } from 'next';
import { Inter, Forum } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SkipLink } from '@/components/layout/skip-link';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const forum = Forum({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-forum',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.villiers-adam.fr'),
  title: {
    default: 'Villiers-Adam | Site officiel de la commune',
    template: '%s | Villiers-Adam',
  },
  description:
    'Site officiel de la commune de Villiers-Adam dans le Val-d\'Oise. Actualités, événements, démarches administratives et vie locale.',
  keywords: [
    'Villiers-Adam',
    'mairie',
    'Val-d\'Oise',
    'commune',
    'Île-de-France',
    'Vexin français',
  ],
  authors: [{ name: 'Mairie de Villiers-Adam' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.villiers-adam.fr',
    siteName: 'Villiers-Adam',
    title: 'Villiers-Adam | Site officiel de la commune',
    description:
      'Site officiel de la commune de Villiers-Adam dans le Val-d\'Oise.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Villiers-Adam',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Villiers-Adam | Site officiel de la commune',
    description:
      'Site officiel de la commune de Villiers-Adam dans le Val-d\'Oise.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${forum.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
