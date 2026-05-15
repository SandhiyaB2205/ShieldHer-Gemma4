'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Navigation, Map, MessageCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/navigate', icon: Navigation, label: 'Navigate' },
  { href: '/heatmap', icon: Map, label: 'Heatmap' },
  { href: '/chat', icon: MessageCircle, label: 'AI Chat' },
  { href: '/contacts', icon: Users, label: 'Contacts' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
      <div className="glass-strong border-t border-border/50">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors relative',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] mt-1 font-medium relative z-10">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
