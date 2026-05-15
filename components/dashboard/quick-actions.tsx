'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation, Map, FileText, Users, MessageCircle, MapPin } from 'lucide-react';
import { GlassmorphismCard } from '@/components/layout/glassmorphism-card';

const actions = [
  {
    href: '/navigate',
    icon: Navigation,
    label: 'Safe Route',
    description: 'AI navigation',
    color: 'from-primary to-primary/60',
  },
  {
    href: '/heatmap',
    icon: Map,
    label: 'Live Heatmap',
    description: 'Danger zones',
    color: 'from-destructive to-destructive/60',
  },
  {
    href: '/reports',
    icon: FileText,
    label: 'Reports',
    description: 'Community alerts',
    color: 'from-warning to-warning/60',
  },
  {
    href: '/contacts',
    icon: Users,
    label: 'Contacts',
    description: 'Emergency',
    color: 'from-accent to-accent/60',
  },
  {
    href: '/chat',
    icon: MessageCircle,
    label: 'AI Assistant',
    description: 'Safety chat',
    color: 'from-safe to-safe/60',
  },
  {
    href: '/tracking',
    icon: MapPin,
    label: 'Live Track',
    description: 'Share location',
    color: 'from-chart-4 to-chart-4/60',
  },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              <Link href={action.href}>
                <GlassmorphismCard 
                  className="h-full hover:scale-[1.02] transition-transform cursor-pointer text-center py-4 px-2"
                >
                  <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground">{action.description}</p>
                </GlassmorphismCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
