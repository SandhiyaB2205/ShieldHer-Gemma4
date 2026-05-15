'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function FadeIn({ 
  children, 
  delay = 0,
  duration = 0.4,
  className = ''
}: { 
  children: ReactNode; 
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({
  children,
  direction = 'left',
  delay = 0,
  className = ''
}: {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
}) {
  const variants = {
    left: { x: -50, opacity: 0 },
    right: { x: 50, opacity: 0 },
    up: { y: 50, opacity: 0 },
    down: { y: -50, opacity: 0 },
  };

  return (
    <motion.div
      initial={variants[direction]}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  delay = 0,
  className = ''
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  staggerDelay = 0.1,
  className = ''
}: {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: index * staggerDelay,
            ease: 'easeOut' 
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
