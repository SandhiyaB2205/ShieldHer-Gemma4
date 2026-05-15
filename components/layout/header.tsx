'use client';

import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
  showSettings?: boolean;
}

export function Header({ 
  title = 'ShieldHer', 
  showNotifications = true,
  showSettings = false 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 safe-area-top">
      <div className="glass-strong border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="font-semibold text-lg text-foreground">{title}</h1>
          </div>

          <div className="flex items-center gap-1">
            {showNotifications && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            )}
            {showSettings && (
              <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
