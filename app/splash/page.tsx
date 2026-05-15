'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    // Show tagline after logo animation
    const taglineTimer = setTimeout(() => setShowTagline(true), 800);
    
    // Navigate to home or login after splash
    const navTimer = setTimeout(() => {
      const token = localStorage.getItem('shieldher-auth-token');
      if (token) {
        router.push('/');
      } else {
        router.push('/login');
      }
    }, 2500);

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 200, 
          damping: 20,
          duration: 0.8 
        }}
        className="relative"
      >
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center glow-primary">
          <Shield className="w-14 h-14 text-white" strokeWidth={2.5} />
        </div>
        
        {/* Animated ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: [0, 0.5, 0] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: 'easeOut' 
          }}
          className="absolute inset-0 rounded-3xl border-2 border-primary"
        />
      </motion.div>

      {/* App Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 text-4xl font-bold text-foreground"
      >
        Shield<span className="text-primary">Her</span>
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: showTagline ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="mt-3 text-muted-foreground text-center px-4"
      >
        Your AI-powered safety companion
      </motion.p>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 flex gap-1"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="w-2 h-2 rounded-full bg-primary"
          />
        ))}
      </motion.div>
    </div>
  );
}
