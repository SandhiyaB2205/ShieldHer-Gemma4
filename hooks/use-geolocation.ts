'use client';

import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false
  } = options;

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true
  });

  const updatePosition = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Unable to retrieve location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
    }

    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      updatePosition,
      handleError,
      { enableHighAccuracy, timeout, maximumAge }
    );
  }, [enableHighAccuracy, timeout, maximumAge, updatePosition, handleError]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false
      }));
      return;
    }

    if (watch) {
      const watchId = navigator.geolocation.watchPosition(
        updatePosition,
        handleError,
        { enableHighAccuracy, timeout, maximumAge }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      getCurrentPosition();
    }
  }, [watch, enableHighAccuracy, timeout, maximumAge, updatePosition, handleError, getCurrentPosition]);

  return {
    ...state,
    refresh: getCurrentPosition
  };
}
