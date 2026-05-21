'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

export const AnimatedSection = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  (props, ref) => {
    return <motion.div ref={ref} {...props} />;
  }
);

AnimatedSection.displayName = 'AnimatedSection';

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
