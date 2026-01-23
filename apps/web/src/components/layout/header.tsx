'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Search,
  ChevronDown,
  Sun,
  Moon,
  Eye,
  Type,
  Phone,
  Mail,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { label: 'Accueil', href: '/' },
  {
    label: 'Ma Mairie',
    href: '/mairie',
    children: [
      { label: 'Le Maire et le Conseil', href: '/mairie/conseil-municipal' },
      { label: 'Services municipaux', href: '/mairie/services' },
      { label: 'Démarches administratives', href: '/mairie/demarches' },
      { label: 'Marchés publics', href: '/mairie/marches-publics' },
      { label: 'Budget et finances', href: '/mairie/budget' },
    ],
  },
  {
    label: 'Vie quotidienne',
    href: '/vie-quotidienne',
    children: [
      { label: 'École et enfance', href: '/vie-quotidienne/ecole' },
      { label: 'Santé et social', href: '/vie-quotidienne/sante' },
      { label: 'Transports', href: '/vie-quotidienne/transports' },
      { label: 'Urbanisme', href: '/vie-quotidienne/urbanisme' },
      { label: 'Environnement', href: '/vie-quotidienne/environnement' },
    ],
  },
  {
    label: 'Culture & Loisirs',
    href: '/culture-loisirs',
    children: [
      { label: 'Associations', href: '/culture-loisirs/associations' },
      { label: 'Sports', href: '/culture-loisirs/sports' },
      { label: 'Patrimoine', href: '/culture-loisirs/patrimoine' },
      { label: 'Bibliothèque', href: '/culture-loisirs/bibliotheque' },
    ],
  },
  { label: 'Actualités', href: '/actualites' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  // Accessibility modes
  const [seniorMode, setSeniorMode] = React.useState(false);
  const [dyslexicMode, setDyslexicMode] = React.useState(false);

  React.useEffect(() => {
    if (seniorMode) {
      document.documentElement.classList.add('senior-mode');
    } else {
      document.documentElement.classList.remove('senior-mode');
    }
  }, [seniorMode]);

  React.useEffect(() => {
    if (dyslexicMode) {
      document.documentElement.classList.add('dyslexic-mode');
    } else {
      document.documentElement.classList.remove('dyslexic-mode');
    }
  }, [dyslexicMode]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between h-10 text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:+33134089000" className="flex items-center gap-1 hover:underline">
              <Phone className="h-3 w-3" />
              <span className="hidden sm:inline">01 34 08 90 00</span>
            </a>
            <a href="mailto:mairie@villiers-adam.fr" className="flex items-center gap-1 hover:underline">
              <Mail className="h-3 w-3" />
              <span className="hidden sm:inline">mairie@villiers-adam.fr</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            {/* Accessibility controls */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setSeniorMode(!seniorMode)}
              title="Mode senior (texte agrandi)"
            >
              <Type className={cn('h-4 w-4', seniorMode && 'text-secondary')} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setDyslexicMode(!dyslexicMode)}
              title="Mode dyslexique"
            >
              <Eye className={cn('h-4 w-4', dyslexicMode && 'text-secondary')} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Mode sombre/clair"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-background border-b">
        <div className="container flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/blason.svg"
              alt="Blason de Villiers-Adam"
              width={48}
              height={56}
              className="h-14 w-auto"
            />
            <div className="flex flex-col">
              <span className="font-heading text-xl font-semibold text-primary">
                Villiers-Adam
              </span>
              <span className="text-xs text-muted-foreground">Val-d&apos;Oise</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.href)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-4 w-4" />}
                </Link>

                {/* Dropdown */}
                {item.children && (
                  <AnimatePresence>
                    {activeDropdown === item.href && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-64 bg-background border rounded-lg shadow-lg py-2"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'block px-4 py-2 text-sm transition-colors',
                              pathname === child.href
                                ? 'text-primary bg-primary/5'
                                : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b overflow-hidden"
          >
            <nav className="container py-4 space-y-1">
              {navigation.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block px-4 py-3 text-sm font-medium rounded-md transition-colors',
                      pathname === item.href
                        ? 'text-primary bg-primary/5'
                        : 'text-foreground/80 hover:text-foreground hover:bg-accent/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-4 mt-1 space-y-1 border-l pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'block px-4 py-2 text-sm transition-colors',
                            pathname === child.href
                              ? 'text-primary'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container pt-24"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-2xl mx-auto">
                <form action="/recherche" method="get" className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="search"
                    name="q"
                    placeholder="Rechercher sur le site..."
                    className="w-full h-14 pl-12 pr-4 text-lg bg-background border rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </form>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Appuyez sur Entrée pour rechercher ou Échap pour fermer
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
