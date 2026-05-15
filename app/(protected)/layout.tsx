'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useSafetyAlert } from '@/hooks/use-safety-alert';
import { BottomNav } from '@/components/layout/bottom-nav';
import { DangerAlert } from '@/components/shared/danger-alert';
import { SOSButton } from '@/components/sos/sos-button';
import { SkeletonLoader } from '@/components/shared/skeleton-loader';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, getAuthHeaders } = useAuth();
  
  const { currentAlert, dismissAlert } = useSafetyAlert({
    enabled: isAuthenticated,
    interval: 30000, // Check every 30 seconds
    getAuthHeaders,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <SkeletonLoader variant="circular" className="w-16 h-16 mx-auto" />
          <SkeletonLoader className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Don't show floating SOS on the dedicated SOS page
  const showFloatingSOS = pathname !== '/sos';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Safety Alert Banner */}
      <DangerAlert 
        alert={currentAlert} 
        onDismiss={dismissAlert}
        onViewDetails={() => router.push('/heatmap')}
      />
      
      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* Floating SOS Button */}
      {showFloatingSOS && <SOSButton />}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
