'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Navigation as NavigationIcon, MapPin, Clock, Shield, Loader2, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { GlassmorphismCard } from '@/components/layout/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useGeolocation } from '@/hooks/use-geolocation';
import { FadeIn } from '@/components/shared/page-transition';
import toast from 'react-hot-toast';
import type { RouteOption } from '@/types';

export default function NavigatePage() {
  const { getAuthHeaders } = useAuth();
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);

  const useCurrentLocation = () => {
    if (latitude && longitude) {
      setOrigin(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      toast.success('Using current location');
    } else {
      toast.error('Location not available');
    }
  };

  const findSafeRoute = async () => {
    if (!origin || !destination) {
      toast.error('Please enter origin and destination');
      return;
    }

    setIsLoading(true);
    setRoutes([]);
    setSelectedRoute(null);

    try {
      const response = await fetch('/api/safe-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ origin, destination }),
      });

      if (!response.ok) {
        throw new Error('Failed to find routes');
      }

      const data = await response.json();
      setRoutes(data.routes);
      
      if (data.routes.length > 0) {
        toast.success(`Found ${data.routes.length} route options`);
      }
    } catch (error) {
      console.error('Route finding error:', error);
      toast.error('Failed to find safe routes');
    } finally {
      setIsLoading(false);
    }
  };

  const getRouteColor = (color: string) => {
    switch (color) {
      case 'green': return 'border-safe bg-safe/10';
      case 'yellow': return 'border-warning bg-warning/10';
      case 'red': return 'border-destructive bg-destructive/10';
      default: return 'border-border';
    }
  };

  const getRouteIcon = (color: string) => {
    switch (color) {
      case 'green': return 'text-safe';
      case 'yellow': return 'text-warning';
      case 'red': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Safe Navigation" />
      
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <FadeIn>
          <GlassmorphismCard variant="strong" className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <NavigationIcon className="w-5 h-5 text-primary" />
              Find Safe Route
            </h2>

            {/* Origin Input */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">From</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter starting point"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="pl-10 bg-background/50"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={useCurrentLocation}
                  disabled={locationLoading}
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Destination Input */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">To</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>

            <Button
              onClick={findSafeRoute}
              disabled={isLoading || !origin || !destination}
              className="w-full bg-gradient-to-r from-primary to-primary/80"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing routes...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Find Safest Route
                </>
              )}
            </Button>
          </GlassmorphismCard>
        </FadeIn>

        {/* Route Results */}
        {routes.length > 0 && (
          <FadeIn delay={0.1}>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Route Options</h3>
              
              {routes.map((route, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassmorphismCard
                    className={`cursor-pointer transition-all ${getRouteColor(route.color)} ${
                      selectedRoute === index ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedRoute(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Shield className={`w-5 h-5 ${getRouteIcon(route.color)}`} />
                          <span className="font-medium">{route.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className={`font-semibold ${getRouteIcon(route.color)}`}>
                            {route.safety_percent}% Safe
                          </span>
                          {route.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {route.duration}
                            </span>
                          )}
                        </div>
                        
                        <p className="mt-2 text-sm text-muted-foreground">
                          {route.reasoning}
                        </p>
                      </div>
                      
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </GlassmorphismCard>
                </motion.div>
              ))}

              {selectedRoute !== null && (
                <Button className="w-full bg-gradient-to-r from-safe to-safe/80">
                  <NavigationIcon className="w-4 h-4 mr-2" />
                  Start Navigation
                </Button>
              )}
            </div>
          </FadeIn>
        )}

        {/* Empty State */}
        {!isLoading && routes.length === 0 && (
          <FadeIn delay={0.2}>
            <GlassmorphismCard variant="subtle" className="text-center py-8">
              <NavigationIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Enter your origin and destination to find the safest route
              </p>
            </GlassmorphismCard>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
