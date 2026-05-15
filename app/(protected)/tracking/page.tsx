'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Share2, Navigation, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { GlassmorphismCard } from '@/components/layout/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useGeolocation } from '@/hooks/use-geolocation';
import { FadeIn } from '@/components/shared/page-transition';
import toast from 'react-hot-toast';

export default function TrackingPage() {
  const { user, getAuthHeaders } = useAuth();
  const { latitude, longitude, accuracy, loading, refresh } = useGeolocation({ watch: true });
  
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (latitude && longitude) {
      setLastUpdate(new Date());
    }
  }, [latitude, longitude]);

  const startSharing = () => {
    if (!latitude || !longitude) {
      toast.error('Location not available');
      return;
    }

    // Generate shareable link (in production, this would create a real tracking session)
    const trackingId = Math.random().toString(36).substring(7);
    const link = `${window.location.origin}/track/${trackingId}`;
    setShareLink(link);
    setIsSharing(true);
    toast.success('Live tracking started');
  };

  const stopSharing = () => {
    setIsSharing(false);
    setShareLink(null);
    toast.success('Tracking stopped');
  };

  const copyLink = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareViaWhatsApp = () => {
    if (!shareLink) return;
    const message = `Track my live location: ${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaSMS = () => {
    if (!shareLink) return;
    const message = `Track my live location: ${shareLink}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      <Header title="Live Tracking" />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Current Location Card */}
        <FadeIn>
          <GlassmorphismCard variant="strong" glow={isSharing ? 'safe' : 'none'}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Your Location
              </h3>
              {isSharing && (
                <span className="flex items-center gap-1 text-xs text-safe">
                  <span className="w-2 h-2 bg-safe rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : latitude && longitude ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Coordinates</p>
                    <p className="font-mono text-sm">
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={refresh}>
                    <Navigation className="w-4 h-4" />
                  </Button>
                </div>

                {accuracy && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-safe" />
                    Accuracy: {accuracy.toFixed(0)}m
                  </p>
                )}

                {lastUpdate && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last update: {lastUpdate.toLocaleTimeString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="w-12 h-12 mx-auto text-destructive mb-2" />
                <p className="text-muted-foreground">Location unavailable</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={refresh}>
                  Try Again
                </Button>
              </div>
            )}
          </GlassmorphismCard>
        </FadeIn>

        {/* Share Controls */}
        <FadeIn delay={0.1}>
          {!isSharing ? (
            <Button
              onClick={startSharing}
              disabled={!latitude || !longitude}
              className="w-full bg-gradient-to-r from-safe to-safe/80"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Start Live Tracking
            </Button>
          ) : (
            <div className="space-y-3">
              <GlassmorphismCard className="border-safe/30">
                <p className="text-sm text-muted-foreground mb-2">Share this link:</p>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 bg-background/50 rounded-lg text-sm truncate">
                    {shareLink}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyLink}>
                    Copy
                  </Button>
                </div>
              </GlassmorphismCard>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={shareViaWhatsApp}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={shareViaSMS}
                >
                  SMS
                </Button>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={stopSharing}
              >
                Stop Tracking
              </Button>
            </div>
          )}
        </FadeIn>

        {/* Safety Tips */}
        <FadeIn delay={0.2}>
          <GlassmorphismCard variant="subtle">
            <h4 className="font-medium mb-3">Safety Tips</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-safe shrink-0 mt-0.5" />
                Share your live location with trusted contacts when traveling alone
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-safe shrink-0 mt-0.5" />
                Keep your phone charged and location services enabled
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-safe shrink-0 mt-0.5" />
                Set a check-in time with your emergency contacts
              </li>
            </ul>
          </GlassmorphismCard>
        </FadeIn>
      </div>
    </div>
  );
}
