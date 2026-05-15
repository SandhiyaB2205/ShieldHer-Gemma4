import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphismCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'subtle';
  glow?: 'none' | 'primary' | 'safe' | 'danger';
}

export function GlassmorphismCard({
  children,
  className,
  variant = 'default',
  glow = 'none'
}: GlassmorphismCardProps) {
  const variantClasses = {
    default: 'glass',
    strong: 'glass-strong',
    subtle: 'bg-card/50 backdrop-blur-sm border border-border/50',
  };

  const glowClasses = {
    none: '',
    primary: 'glow-primary',
    safe: 'glow-safe',
    danger: 'glow-danger',
  };

  return (
    <div
      className={cn(
        'rounded-xl p-4',
        variantClasses[variant],
        glowClasses[glow],
        className
      )}
    >
      {children}
    </div>
  );
}
