'use client';

import * as React from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Mountain, Ruler, TreePine, Building2 } from 'lucide-react';

const highlights = [
  {
    value: 858,
    label: 'habitants',
    icon: Users,
    suffix: '',
  },
  {
    value: 9.82,
    label: 'km\u00b2 de superficie',
    icon: Ruler,
    suffix: '',
    decimals: 2,
  },
  {
    value: 157,
    label: "m d'altitude max",
    icon: Mountain,
    suffix: '',
  },
  {
    value: 1995,
    label: 'PNR du Vexin francais',
    prefix: 'Depuis ',
    icon: TreePine,
    isYear: true,
  },
  {
    value: 15,
    label: 'elus municipaux',
    icon: Building2,
    suffix: '',
  },
];

function CountUp({
  end,
  decimals = 0,
  prefix = '',
  isYear = false,
}: {
  end: number;
  decimals?: number;
  prefix?: string;
  isYear?: boolean;
}) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  React.useEffect(() => {
    if (!isInView) return;

    const duration = 1500;
    const startTime = performance.now();
    const startValue = isYear ? end - 30 : 0;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (end - startValue) * eased;
      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [isInView, end, isYear]);

  const displayValue = isYear
    ? Math.round(count).toString()
    : decimals > 0
      ? count.toFixed(decimals).replace('.', ',')
      : Math.round(count).toLocaleString('fr-FR');

  return (
    <span ref={ref}>
      {prefix}
      {displayValue}
    </span>
  );
}

export function CommuneHighlights() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Fond subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-villiers-blue/[0.03] via-transparent to-villiers-green/[0.03]" />
      <div className="absolute inset-0 texture-grain opacity-20" />

      {/* Cercles decoratifs */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full border border-villiers-gold/10 hidden lg:block" />
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full border border-villiers-blue/10 hidden lg:block" />

      <div className="container relative">
        {/* Header editorial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-sm font-mono text-villiers-gold mb-4">
            <span className="w-8 h-px bg-villiers-gold" />
            La commune en bref
            <span className="w-8 h-px bg-villiers-gold" />
          </span>
          <h2 className="text-3xl lg:text-5xl font-heading font-semibold text-foreground">
            Villiers-Adam en chiffres
          </h2>
        </motion.div>

        {/* Grille de chiffres */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col items-center text-center p-6 rounded-organic bg-background border border-border/50 hover:border-villiers-gold/30 hover:shadow-organic-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-villiers-gold/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-villiers-gold" />
                </div>
                <span className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-1 tabular-nums">
                  <CountUp
                    end={item.value}
                    decimals={item.decimals}
                    prefix={item.prefix}
                    isYear={item.isYear}
                  />
                </span>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
