'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import {
  Menu,
  X,
  Search,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  Eye,
  Type,
  Accessibility,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAccessibility, useIsMounted } from '@/contexts/accessibility-context';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    label: 'La Mairie',
    href: '/mairie',
    children: [
      { label: 'Le Maire et le Conseil', href: '/mairie/conseil-municipal' },
      { label: 'Services municipaux', href: '/mairie/services' },
      { label: 'Démarches administratives', href: '/mairie/demarches' },
      {
        label: 'Publications administratives',
        href: '/mairie/publications',
        children: [
          { label: 'Arrêtés municipaux', href: '/mairie/publications/arretes' },
          { label: 'Comptes-rendus du conseil', href: '/mairie/publications/comptes-rendus' },
          { label: 'Délibérations', href: '/mairie/publications/deliberations' },
        ],
      },
    ],
  },
  {
    label: 'Vie quotidienne',
    href: '/vie-quotidienne',
    children: [
      { label: 'Infos pratiques', href: '/vie-quotidienne/infos-pratiques' },
      {
        label: 'École et enfance',
        href: '/vie-quotidienne/ecole',
        children: [
          { label: 'Petite enfance', href: '/vie-quotidienne/ecole/petite-enfance' },
          { label: 'École primaire', href: '/vie-quotidienne/ecole/ecole-primaire' },
          { label: 'Restauration scolaire', href: '/vie-quotidienne/ecole/restauration-scolaire' },
          { label: 'Centre de loisirs', href: '/vie-quotidienne/ecole/centre-de-loisirs' },
          { label: 'Collège et lycée', href: '/vie-quotidienne/ecole/college-lycee' },
        ],
      },
      {
        label: 'Transports',
        href: '/vie-quotidienne/transports',
        children: [
          { label: 'Transport scolaire', href: '/vie-quotidienne/transports/transport-scolaire' },
        ],
      },
      { label: 'Commerces & entreprises', href: '/vie-quotidienne/commerces' },
      { label: 'Urbanisme', href: '/vie-quotidienne/urbanisme' },
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

function AccessibilityMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const mounted = useIsMounted();
  const {
    theme,
    setTheme,
    seniorMode,
    setSeniorMode,
    dyslexicMode,
    setDyslexicMode,
    highContrast,
    setHighContrast,
    resetSettings,
  } = useAccessibility();

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-villiers-gold/10 hover:text-villiers-gold transition-colors"
        aria-label="Accessibilité"
      >
        <Accessibility className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-villiers-gold/10 hover:text-villiers-gold transition-colors"
        aria-label="Menu accessibilité"
        aria-expanded={isOpen}
      >
        <Accessibility className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour fermer le menu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-full mt-2 w-72 bg-background/95 backdrop-blur-lg border rounded-organic shadow-organic-lg py-3 z-50"
            >
              <div className="px-4 pb-2 mb-2 border-b border-border/50">
                <h3 className="font-heading font-semibold text-sm text-foreground">
                  Accessibilité
                </h3>
              </div>

              {/* Thème */}
              <div className="px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thème
                </span>
                <div className="flex gap-1 mt-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="flex-1 gap-1.5"
                  >
                    <Sun className="h-4 w-4" />
                    Clair
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="flex-1 gap-1.5"
                  >
                    <Moon className="h-4 w-4" />
                    Sombre
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                    className="flex-1 gap-1.5"
                  >
                    <Monitor className="h-4 w-4" />
                    Auto
                  </Button>
                </div>
              </div>

              {/* Options d'accessibilité */}
              <div className="px-4 py-2 space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Options
                </span>

                {/* Mode Senior */}
                <label className="flex items-center justify-between py-2 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Mode Senior</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={seniorMode}
                    onClick={() => setSeniorMode(!seniorMode)}
                    className={cn(
                      'relative w-10 h-6 rounded-full transition-colors',
                      seniorMode ? 'bg-villiers-gold' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                        seniorMode && 'translate-x-4'
                      )}
                    />
                  </button>
                </label>

                {/* Mode Dyslexique */}
                <label className="flex items-center justify-between py-2 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 text-muted-foreground font-bold text-xs flex items-center justify-center">
                      Aa
                    </span>
                    <span className="text-sm">Police Dyslexie</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={dyslexicMode}
                    onClick={() => setDyslexicMode(!dyslexicMode)}
                    className={cn(
                      'relative w-10 h-6 rounded-full transition-colors',
                      dyslexicMode ? 'bg-villiers-gold' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                        dyslexicMode && 'translate-x-4'
                      )}
                    />
                  </button>
                </label>

                {/* Contraste élevé */}
                <label className="flex items-center justify-between py-2 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Contraste élevé</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={highContrast}
                    onClick={() => setHighContrast(!highContrast)}
                    className={cn(
                      'relative w-10 h-6 rounded-full transition-colors',
                      highContrast ? 'bg-villiers-gold' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform',
                        highContrast && 'translate-x-4'
                      )}
                    />
                  </button>
                </label>
              </div>

              {/* Réinitialiser */}
              <div className="px-4 pt-2 mt-2 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSettings}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Réinitialiser les paramètres
                </Button>
                <Link
                  href="/accessibilite"
                  className="block text-center text-xs text-muted-foreground hover:text-primary mt-2 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  Plus d&apos;options →
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [expandedMobileItems, setExpandedMobileItems] = React.useState<string[]>([]);

  // Scroll detection pour glassmorphism
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Bloquer le scroll du body quand le menu mobile est ouvert
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Fermer le menu avec Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [searchOpen, mobileMenuOpen]);

  const toggleMobileExpand = (href: string) => {
    setExpandedMobileItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main header avec glassmorphism */}
      <motion.div
        className={cn(
          'transition-all duration-500 ease-organic border-b',
          isScrolled
            ? 'bg-background/85 backdrop-blur-lg border-border/50 shadow-sm'
            : 'bg-background border-border'
        )}
      >
        <div className="container flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Image
                src="/images/blason.svg"
                alt="Blason de Villiers-Adam"
                width={48}
                height={56}
                className="h-14 w-auto"
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-heading text-xl font-semibold text-primary tracking-tight">
                Villiers-Adam
              </span>
              <span className="text-xs text-muted-foreground font-mono">Val-d&apos;Oise • 95840</span>
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
                    'relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors group',
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'text-primary'
                      : 'text-foreground/70 hover:text-foreground'
                  )}
                >
                  {item.label}
                  {item.children && (
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-300',
                        activeDropdown === item.href && 'rotate-180'
                      )}
                    />
                  )}
                  {/* Underline animation */}
                  <span
                    className={cn(
                      'absolute bottom-0 left-4 right-4 h-0.5 bg-villiers-gold transition-transform duration-300 origin-left',
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    )}
                  />
                </Link>

                {/* Dropdown avec animation */}
                {item.children && (
                  <AnimatePresence>
                    {activeDropdown === item.href && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-full left-0 mt-2 w-72 bg-background/95 backdrop-blur-lg border rounded-organic shadow-organic-lg py-2 overflow-hidden"
                      >
                        {item.children.map((child, index) => (
                          <motion.div
                            key={child.href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              href={child.href}
                              className={cn(
                                'block px-5 py-3 text-sm transition-all duration-200 border-l-2 border-transparent',
                                pathname === child.href
                                  ? 'text-primary bg-primary/5 border-l-villiers-gold'
                                  : 'text-foreground/80 hover:text-foreground hover:bg-muted/50 hover:border-l-villiers-gold/50'
                              )}
                            >
                              {child.label}
                            </Link>
                            {/* Sous-menu imbriqué */}
                            {child.children && (
                              <div className="ml-4 border-l border-border/50">
                                {child.children.map((subChild) => (
                                  <Link
                                    key={subChild.href}
                                    href={subChild.href}
                                    className={cn(
                                      'block px-5 py-2 text-xs transition-all duration-200',
                                      pathname === subChild.href
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                    )}
                                  >
                                    {subChild.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </motion.div>
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
              className="hover:bg-villiers-gold/10 hover:text-villiers-gold transition-colors"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Menu accessibilité */}
            <AccessibilityMenu />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-villiers-gold/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Navigation - Fixed Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 z-50 w-full max-w-sm h-[100svh] bg-background border-l shadow-xl lg:hidden overflow-hidden"
            >
              {/* Header du drawer */}
              <div className="flex items-center justify-between h-20 px-6 border-b">
                <span className="font-heading text-lg font-semibold text-primary">
                  Menu
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation scrollable */}
              <nav className="flex-1 overflow-y-auto max-h-[calc(100svh-5rem)] py-4 px-4">
                <div className="space-y-1">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      {item.children ? (
                        <div>
                          <button
                            onClick={() => toggleMobileExpand(item.href)}
                            className={cn(
                              'flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-organic transition-all duration-200',
                              pathname.startsWith(item.href)
                                ? 'text-primary bg-primary/5'
                                : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'
                            )}
                          >
                            {item.label}
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform duration-200',
                                expandedMobileItems.includes(item.href) && 'rotate-180'
                              )}
                            />
                          </button>
                          <AnimatePresence>
                            {expandedMobileItems.includes(item.href) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-4 mt-1 space-y-1 border-l-2 border-muted pl-4">
                                  {item.children.map((child) => (
                                    <div key={child.href}>
                                      <Link
                                        href={child.href}
                                        className={cn(
                                          'block px-4 py-2 text-sm transition-colors',
                                          pathname === child.href
                                            ? 'text-primary font-medium'
                                            : 'text-muted-foreground hover:text-foreground'
                                        )}
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        {child.label}
                                      </Link>
                                      {/* Sous-sous-menu */}
                                      {child.children && (
                                        <div className="ml-4 space-y-1">
                                          {child.children.map((subChild) => (
                                            <Link
                                              key={subChild.href}
                                              href={subChild.href}
                                              className={cn(
                                                'block px-4 py-1.5 text-xs transition-colors',
                                                pathname === subChild.href
                                                  ? 'text-primary'
                                                  : 'text-muted-foreground hover:text-foreground'
                                              )}
                                              onClick={() => setMobileMenuOpen(false)}
                                            >
                                              {subChild.label}
                                            </Link>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            'block px-4 py-3 text-base font-medium rounded-organic transition-all duration-200',
                            pathname === item.href
                              ? 'text-primary bg-primary/5 border-l-4 border-villiers-gold'
                              : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search overlay avec design amélioré */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-villiers-blue/90 backdrop-blur-xl"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="container pt-32"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-2xl mx-auto">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/60 text-sm mb-4 font-mono"
                >
                  Rechercher sur le site
                </motion.p>
                <form action="/recherche" method="get" className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/50" />
                  <input
                    type="search"
                    name="q"
                    placeholder="Démarches, actualités, événements..."
                    className="w-full h-16 pl-16 pr-6 text-xl bg-white/10 border border-white/20 rounded-organic text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-villiers-gold focus:border-transparent"
                    autoFocus
                  />
                </form>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 text-sm text-white/40 text-center"
                >
                  Appuyez sur <kbd className="px-2 py-1 bg-white/10 rounded text-white/60">Entrée</kbd> pour rechercher
                  ou <kbd className="px-2 py-1 bg-white/10 rounded text-white/60">Échap</kbd> pour fermer
                </motion.p>
              </div>
            </motion.div>
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-8 right-8 p-3 text-white/60 hover:text-white transition-colors"
              aria-label="Fermer la recherche"
            >
              <X className="h-8 w-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
