'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Shield, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SafetyAlert } from '@/types';

interface DangerAlertProps {
  alert: SafetyAlert | null;
  onDismiss: () => void;
  onViewDetails?: () => void;
}

export function DangerAlert({ alert, onDismiss, onViewDetails }: DangerAlertProps) {
  if (!alert) return null;

  const severityConfig = {
    low: {
      bg: 'bg-warning/20',
      border: 'border-warning/50',
      icon: Shield,
      iconColor: 'text-warning',
    },
    medium: {
      bg: 'bg-warning/30',
      border: 'border-warning/60',
      icon: AlertTriangle,
      iconColor: 'text-warning',
    },
    high: {
      bg: 'bg-destructive/30',
      border: 'border-destructive/60',
      icon: AlertTriangle,
      iconColor: 'text-destructive',
    },
  };

  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`fixed top-4 left-4 right-4 z-50 ${config.bg} ${config.border} border rounded-xl p-4 backdrop-blur-lg`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${config.bg}`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-foreground">
                {alert.type === 'danger_zone' && 'Danger Zone Alert'}
                {alert.type === 'route_deviation' && 'Route Deviation'}
                {alert.type === 'stationary_warning' && 'Safety Check'}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={onDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">
              {alert.message}
            </p>
            
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={onViewDetails}
              >
                <MapPin className="w-4 h-4 mr-1" />
                View on Map
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
