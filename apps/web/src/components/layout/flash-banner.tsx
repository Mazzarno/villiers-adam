'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, Info, AlertCircle, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FlashInfo {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  link?: string;
}

interface FlashBannerProps {
  items: FlashInfo[];
}

const typeConfig = {
  info: {
    icon: Info,
    className: 'bg-villiers-blue text-white',
    borderColor: 'border-villiers-blue-light',
    iconAnimation: {},
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-villiers-gold text-villiers-blue',
    borderColor: 'border-villiers-gold-soft',
    iconAnimation: {
      rotate: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3 },
    },
  },
  urgent: {
    icon: AlertCircle,
    className: 'bg-destructive text-destructive-foreground',
    borderColor: 'border-destructive/50',
    iconAnimation: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.8, repeat: Infinity },
    },
  },
};

export function FlashBanner({ items }: FlashBannerProps) {
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());
  const [isHovered, setIsHovered] = React.useState(false);

  const visibleItems = items.filter((item) => !dismissedIds.has(item.id));

  if (visibleItems.length === 0) return null;

  const dismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="sync">
        {visibleItems.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'relative border-b-2 border-dashed',
                config.className,
                config.borderColor
              )}
            >
              {/* Style télégramme avec bordure pointillée */}
              <div className="container flex items-center justify-between py-3 gap-4">
                {/* Icône avec animation selon le type */}
                <div className="flex items-center gap-4 overflow-hidden flex-1">
                  <motion.div
                    animate={config.iconAnimation}
                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/10"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>

                  {/* Contenu avec animation marquee ou typewriter */}
                  <div className="overflow-hidden flex-1">
                    <motion.div
                      className={cn(
                        'flex items-center gap-8 font-mono text-sm',
                        !isHovered && 'animate-marquee'
                      )}
                      style={{
                        animationPlayState: isHovered ? 'paused' : 'running',
                      }}
                    >
                      {/* Premier message */}
                      <FlashMessage item={item} />
                      {/* Séparateur style télégramme */}
                      <span className="shrink-0 flex items-center gap-2 opacity-50">
                        <Bell className="h-3 w-3" />
                        <span>•••</span>
                        <Bell className="h-3 w-3" />
                      </span>
                      {/* Message dupliqué pour l'effet de boucle */}
                      <FlashMessage item={item} />
                    </motion.div>
                  </div>
                </div>

                {/* Bouton fermer */}
                <motion.button
                  onClick={() => dismiss(item.id)}
                  className="shrink-0 p-2 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Fermer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Indicateur de priorité pour urgent */}
              {item.type === 'urgent' && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-white/30"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Composant message séparé pour réutilisation
function FlashMessage({ item }: { item: FlashInfo }) {
  const content = (
    <span className="whitespace-nowrap">
      {/* Préfixe style télégramme */}
      <span className="opacity-60 mr-2">
        [{item.type === 'urgent' ? 'URGENT' : item.type === 'warning' ? 'ATTENTION' : 'INFO'}]
      </span>
      {item.message}
    </span>
  );

  if (item.link) {
    return (
      <Link href={item.link} className="hover:underline underline-offset-4">
        {content}
      </Link>
    );
  }

  return content;
}
