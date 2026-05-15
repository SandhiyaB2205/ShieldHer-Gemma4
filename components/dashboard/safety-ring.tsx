'use client';

import { motion } from 'framer-motion';
import { GlassmorphismCard } from '@/components/layout/glassmorphism-card';

interface SafetyRingProps {
  safetyScore: number; // 0-100, where 100 is safest
  isLoading?: boolean;
}

export function SafetyRing({ safetyScore, isLoading = false }: SafetyRingProps) {
  // Convert safety score (0-100) to display
  // Higher score = safer = green, lower = dangerous = red
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (safetyScore / 100) * circumference;

  const getColor = () => {
    if (safetyScore >= 70) return { stroke: 'var(--safe)', glow: 'safe' as const, label: 'Safe' };
    if (safetyScore >= 40) return { stroke: 'var(--warning)', glow: 'none' as const, label: 'Caution' };
    return { stroke: 'var(--danger)', glow: 'danger' as const, label: 'Alert' };
  };

  const { stroke, glow, label } = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-3">Safety Status</h3>
      
      <GlassmorphismCard variant="strong" glow={glow} className="flex items-center justify-center py-6">
        <div className="relative">
          {/* Background ring */}
          <svg className="w-32 h-32 -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="8"
              className="opacity-30"
            />
            {/* Animated progress ring */}
            {!isLoading && (
              <motion.circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke={stroke}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
              />
            )}
            {/* Loading animation */}
            {isLoading && (
              <motion.circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * 0.75}
                className="animate-safety-ring"
                style={{ transformOrigin: 'center' }}
              />
            )}
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoading ? (
              <span className="text-sm text-muted-foreground">Loading...</span>
            ) : (
              <>
                <span className="text-3xl font-bold" style={{ color: stroke }}>
                  {safetyScore}%
                </span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </>
            )}
          </div>
        </div>

        <div className="ml-6 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-safe" />
            <span className="text-xs text-muted-foreground">70-100% Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">40-69% Caution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span className="text-xs text-muted-foreground">0-39% Alert</span>
          </div>
        </div>
      </GlassmorphismCard>
    </motion.div>
  );
}
