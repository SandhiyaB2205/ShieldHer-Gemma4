'use client';

import { motion } from 'framer-motion';
import { Shield, Sun, Moon, CloudSun } from 'lucide-react';
import { GlassmorphismCard } from '@/components/layout/glassmorphism-card';

interface GreetingCardProps {
  userName: string;
}

function getGreeting(): { text: string; icon: typeof Sun } {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { text: 'Good Morning', icon: Sun };
  } else if (hour >= 12 && hour < 17) {
    return { text: 'Good Afternoon', icon: CloudSun };
  } else {
    return { text: 'Good Evening', icon: Moon };
  }
}

export function GreetingCard({ userName }: GreetingCardProps) {
  const { text: greeting, icon: TimeIcon } = getGreeting();
  const firstName = userName.split(' ')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassmorphismCard variant="strong" className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TimeIcon className="w-4 h-4" />
              <span className="text-sm">{greeting}</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">{firstName}</h2>
            <p className="text-sm text-muted-foreground">Stay safe today</p>
          </div>
        </div>
      </GlassmorphismCard>
    </motion.div>
  );
}
