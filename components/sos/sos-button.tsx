'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export function SOSButton() {
  return (
    <Link href="/sos">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-4 bottom-24 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center shadow-lg animate-sos-pulse"
      >
        <div className="text-center">
          <AlertTriangle className="w-6 h-6 text-white mx-auto" />
          <span className="text-[10px] font-bold text-white">SOS</span>
        </div>
      </motion.button>
    </Link>
  );
}
