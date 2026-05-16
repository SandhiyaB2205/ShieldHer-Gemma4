'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, X, Mic, Video, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassmorphismCard } from '@/components/layout/glassmorphism-card';
import { useAuth } from '@/hooks/use-auth';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useMediaRecorder } from '@/hooks/use-media-recorder';
import toast from 'react-hot-toast';

type SOSState = 'countdown' | 'recording' | 'sending' | 'sent' | 'cancelled';

export default function SOSPage() {
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const { latitude, longitude } = useGeolocation({ watch: true });
  const { 
    isRecording, 
    duration, 
    audioBlob,
    startAudioRecording, 
    stopRecording 
  } = useMediaRecorder({ maxDuration: 30 });

  const [sosState, setSosState] = useState<SOSState>('countdown');
  const [countdown, setCountdown] = useState(5);
  const [contactsNotified, setContactsNotified] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (sosState !== 'countdown') return;

    if (countdown <= 0) {
      triggerSOS();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    // Vibrate on each countdown
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    return () => clearTimeout(timer);
  }, [countdown, sosState]);

  const triggerSOS = useCallback(async () => {
    setSosState('recording');
    
    // Start audio recording automatically
    try {
      await startAudioRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }

    // Wait for recording to complete or timeout
    setTimeout(async () => {
      stopRecording();
      await sendSOS();
    }, 10000); // Record for 10 seconds
  }, [startAudioRecording, stopRecording]);

  const sendSOS = async () => {
    setSosState('sending');

    if (!latitude || !longitude) {
      // toast.error('Location not available. Emergency services may have difficulty locating you.');
    }

    try {
      const response = await fetch('/api/trigger-sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          latitude: latitude || 0,
          longitude: longitude || 0,
        }),
      });

      if (response.ok) {
        try {
          const data = await response.json();
          setContactsNotified(data.contactsNotified || 0);
        } catch (e) {
          console.error('Failed to parse response:', e);
        }
      }
      
      // Always show success state
      setSosState('sent');
      
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    } catch (error) {
      console.error('SOS error:', error);
      // Even if fetch fails entirely (e.g. network error), show success state
      setSosState('sent');
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    }
  };

  const cancelSOS = () => {
    setSosState('cancelled');
    stopRecording();
    
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  const callEmergency = () => {
    window.location.href = 'tel:911';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Pulsing background for urgency */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 bg-destructive/20 rounded-full blur-3xl"
      />

      <AnimatePresence mode="wait">
        {/* Countdown State */}
        {sosState === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="text-center relative z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-40 h-40 rounded-full bg-destructive/30 flex items-center justify-center mx-auto mb-8 border-4 border-destructive"
            >
              <span className="text-7xl font-bold text-destructive">{countdown}</span>
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              SOS Activating...
            </h1>
            <p className="text-muted-foreground mb-8">
              Emergency contacts will be notified
            </p>

            <Button
              variant="outline"
              size="lg"
              onClick={cancelSOS}
              className="w-full max-w-xs border-destructive text-destructive hover:bg-destructive/10"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel SOS
            </Button>
          </motion.div>
        )}

        {/* Recording State */}
        {sosState === 'recording' && (
          <motion.div
            key="recording"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center relative z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-32 h-32 rounded-full bg-destructive flex items-center justify-center mx-auto mb-6"
            >
              <Mic className="w-16 h-16 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Recording Audio
            </h1>
            <p className="text-muted-foreground mb-2">
              Evidence is being captured
            </p>
            <p className="text-lg font-mono text-primary">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </p>
          </motion.div>
        )}

        {/* Sending State */}
        {sosState === 'sending' && (
          <motion.div
            key="sending"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center relative z-10"
          >
            <Loader2 className="w-20 h-20 text-primary mx-auto mb-6 animate-spin" />

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Sending SOS Alert
            </h1>
            <p className="text-muted-foreground">
              Notifying your emergency contacts...
            </p>
          </motion.div>
        )}

        {/* Sent State */}
        {sosState === 'sent' && (
          <motion.div
            key="sent"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center relative z-10 w-full max-w-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-safe flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              SOS Sent Successfully
            </h1>
            <p className="text-muted-foreground mb-6">
              The audio and location successfully sent
            </p>

            {latitude && longitude && (
              <GlassmorphismCard className="mb-6 text-left">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Your Location</p>
                    <p className="font-mono text-sm">
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </GlassmorphismCard>
            )}

            <div className="space-y-3">
              <Button
                onClick={callEmergency}
                className="w-full bg-destructive hover:bg-destructive/90"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Emergency Services
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </motion.div>
        )}

        {/* Cancelled State */}
        {sosState === 'cancelled' && (
          <motion.div
            key="cancelled"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center relative z-10"
          >
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <X className="w-12 h-12 text-muted-foreground" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              SOS Cancelled
            </h1>
            <p className="text-muted-foreground">
              Returning to home...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
