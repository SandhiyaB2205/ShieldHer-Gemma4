'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Map, AlertTriangle, MapPin, RefreshCw, Layers } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { GlassmorphismCard } from '@/components/layout/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useGeolocation } from '@/hooks/use-geolocation';
import { FadeIn } from '@/components/shared/page-transition';
import { MapSkeleton } from '@/components/shared/skeleton-loader';
import type { Report } from '@/types';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
export default function HeatmapPage() {
  const { getAuthHeaders } = useAuth();
  const { latitude, longitude, loading: locationLoading, refresh: refreshLocation } = useGeolocation();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReports, setShowReports] = useState(true);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const center = useMemo(() => ({ lat: latitude || 0, lng: longitude || 0 }), [latitude, longitude]);

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch('/api/community-report?limit=100', {
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          setReports(data.reports);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, [getAuthHeaders]);

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'harassment':
      case 'assault':
      case 'stalking':
        return 'bg-destructive';
      case 'theft':
      case 'unsafe_area':
        return 'bg-warning';
      case 'poor_lighting':
      default:
        return 'bg-warning/60';
    }
  };

  const recentReports = reports.slice(0, 5);

  return (
    <div className="min-h-screen">
      <Header title="Safety Heatmap" />
      
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Map Placeholder */}
        <FadeIn>
          <GlassmorphismCard variant="strong" className="p-0 overflow-hidden">
            <div className="relative h-[60vh] min-h-[400px] w-full bg-muted/30">
              {isLoading || locationLoading || !isLoaded ? (
                <MapSkeleton />
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={center}
                  zoom={14}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles: [
                      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
                      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
                      { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
                      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
                      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
                      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
                      { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
                      { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
                      { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
                      { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
                      { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
                      { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
                    ]
                  }}
                >
                  {latitude && longitude && (
                    <Marker 
                      position={{ lat: latitude, lng: longitude }} 
                      icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} 
                    />
                  )}
                  {showReports && reports.map(report => (
                    <Marker
                      key={report.id}
                      position={{ lat: report.latitude, lng: report.longitude }}
                      icon={{
                        url: report.incident_type === 'safe_zone' 
                          ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png" 
                          : "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                      }}
                    />
                  ))}
                </GoogleMap>
              )}
              
              {/* Map Controls */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm"
                  onClick={refreshLocation}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className={`${showReports ? 'bg-primary text-white' : 'bg-background/80'} backdrop-blur-sm`}
                  onClick={() => setShowReports(!showReports)}
                >
                  <Layers className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </GlassmorphismCard>
        </FadeIn>

        {/* Legend */}
        <FadeIn delay={0.1}>
          <GlassmorphismCard className="py-3">
            <h3 className="text-sm font-medium mb-2">Heatmap Legend</h3>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-safe" />
                <span className="text-muted-foreground">Safe Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-muted-foreground">Caution</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Danger Zone</span>
              </div>
            </div>
          </GlassmorphismCard>
        </FadeIn>

        {/* Recent Reports */}
        {showReports && recentReports.length > 0 && (
          <FadeIn delay={0.2}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Recent Reports
                </h3>
                <span className="text-sm text-muted-foreground">
                  {reports.length} total
                </span>
              </div>
              
              {recentReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassmorphismCard className="py-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${getIncidentIcon(report.incident_type)} flex items-center justify-center`}>
                        <AlertTriangle className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">
                            {report.incident_type.replace('_', ' ')}
                          </span>
                          {report.ai_validated && (
                            <span className="text-xs text-safe">Verified</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </GlassmorphismCard>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Empty State */}
        {!isLoading && reports.length === 0 && (
          <FadeIn delay={0.2}>
            <GlassmorphismCard variant="subtle" className="text-center py-8">
              <Map className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No reports in this area yet
              </p>
            </GlassmorphismCard>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
