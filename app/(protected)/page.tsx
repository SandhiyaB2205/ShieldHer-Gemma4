'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { GreetingCard } from '@/components/dashboard/greeting-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { SafetyRing } from '@/components/dashboard/safety-ring';
import { useAuth } from '@/hooks/use-auth';
import { useGeolocation } from '@/hooks/use-geolocation';
import { FadeIn } from '@/components/shared/page-transition';

export default function HomePage() {
  const { user, getAuthHeaders } = useAuth();
  const { latitude, longitude } = useGeolocation();
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [isLoadingSafety, setIsLoadingSafety] = useState(true);

  useEffect(() => {
    async function fetchSafetyScore() {
      if (!latitude || !longitude) {
        // If we don't have location yet, we shouldn't keep it loading forever
        // if geolocation itself has failed or is just delayed.
        // But let's check if geolocation is still loading? For now just set false.
        setIsLoadingSafety(false);
        setSafetyScore(75);
        return;
      }

      setIsLoadingSafety(true);
      try {
        const response = await fetch(
          `/api/safety-score?lat=${latitude}&lng=${longitude}`,
          { headers: getAuthHeaders() as HeadersInit }
        );

        if (response.ok) {
          const data = await response.json();
          // Convert risk_score (higher = more dangerous) to safety score (higher = safer)
          setSafetyScore(100 - data.risk_score);
        } else {
          setSafetyScore(75);
        }
      } catch (error) {
        console.error('Failed to fetch safety score:', error);
        setSafetyScore(75); // Default fallback
      } finally {
        setIsLoadingSafety(false);
      }
    }

    fetchSafetyScore();
  }, [latitude, longitude, getAuthHeaders]);

  return (
    <div className="min-h-screen">
      <Header showSettings />

      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        <FadeIn>
          <GreetingCard userName={user?.name || 'User'} />
        </FadeIn>

        <FadeIn delay={0.1}>
          <SafetyRing
            safetyScore={safetyScore ?? 0}
            isLoading={isLoadingSafety}
          />
        </FadeIn>

        <FadeIn delay={0.2}>
          
          <QuickActions />
        </FadeIn>
      </div>
    </div>
  );
}
