'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { SafetyAlert } from '@/types';

interface UseSafetyAlertOptions {
  enabled?: boolean;
  interval?: number; // Check interval in ms
  getAuthHeaders: () => Record<string, string>;
}

export function useSafetyAlert(options: UseSafetyAlertOptions) {
  const { enabled = true, interval = 30000, getAuthHeaders } = options;
  
  const [currentAlert, setCurrentAlert] = useState<SafetyAlert | null>(null);
  const [lastPosition, setLastPosition] = useState<{ lat: number; lng: number } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkLocation = useCallback(async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLastPosition({ lat: latitude, lng: longitude });

        try {
          const response = await fetch('/api/live-location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            },
            body: JSON.stringify({ latitude, longitude })
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.safetyAlert) {
              setCurrentAlert(data.safetyAlert);
              
              // Trigger vibration for high severity alerts
              if (data.safetyAlert.severity === 'high' && navigator.vibrate) {
                navigator.vibrate([500, 200, 500, 200, 500]);
              }
            } else {
              setCurrentAlert(null);
            }
          }
        } catch (error) {
          console.error('Safety check error:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [getAuthHeaders]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial check
    checkLocation();

    // Set up interval
    intervalRef.current = setInterval(checkLocation, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, checkLocation]);

  const dismissAlert = useCallback(() => {
    setCurrentAlert(null);
  }, []);

  return {
    currentAlert,
    lastPosition,
    dismissAlert,
    checkNow: checkLocation
  };
}
