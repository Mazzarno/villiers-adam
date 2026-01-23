'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
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
    className: 'bg-primary text-primary-foreground',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-secondary text-secondary-foreground',
  },
  urgent: {
    icon: AlertCircle,
    className: 'bg-destructive text-destructive-foreground',
  },
};

export function FlashBanner({ items }: FlashBannerProps) {
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());

  const visibleItems = items.filter((item) => !dismissedIds.has(item.id));

  if (visibleItems.length === 0) return null;

  const dismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  return (
    <div className="relative overflow-hidden">
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
              className={cn('relative', config.className)}
            >
              <div className="container flex items-center justify-between py-2 gap-4">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="flash-banner-content">
                      {item.link ? (
                        <Link href={item.link} className="hover:underline">
                          {item.message}
                        </Link>
                      ) : (
                        <span>{item.message}</span>
                      )}
                      <span className="mx-8">•</span>
                      {item.link ? (
                        <Link href={item.link} className="hover:underline">
                          {item.message}
                        </Link>
                      ) : (
                        <span>{item.message}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismiss(item.id)}
                  className="shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
