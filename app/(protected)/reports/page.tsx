'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, MapPin, AlertTriangle, Clock, Check, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { GlassmorphismCard } from '@/components/layout/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useGeolocation } from '@/hooks/use-geolocation';
import { FadeIn } from '@/components/shared/page-transition';
import { ListSkeleton } from '@/components/shared/skeleton-loader';
import toast from 'react-hot-toast';
import type { Report, IncidentType } from '@/types';

const INCIDENT_TYPES: { value: IncidentType; label: string; color: string }[] = [
  { value: 'harassment', label: 'Harassment', color: 'bg-destructive' },
  { value: 'assault', label: 'Assault', color: 'bg-destructive' },
  { value: 'stalking', label: 'Stalking', color: 'bg-destructive' },
  { value: 'theft', label: 'Theft', color: 'bg-warning' },
  { value: 'unsafe_area', label: 'Unsafe Area', color: 'bg-warning' },
  { value: 'poor_lighting', label: 'Poor Lighting', color: 'bg-warning/60' },
  { value: 'other', label: 'Other', color: 'bg-muted-foreground' },
];

export default function ReportsPage() {
  const { getAuthHeaders } = useAuth();
  const { latitude, longitude } = useGeolocation();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [incidentType, setIncidentType] = useState<IncidentType>('unsafe_area');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/community-report', {
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
  };

  const submitReport = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (!latitude || !longitude) {
      toast.error('Location is required. Please enable location services.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/community-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          latitude,
          longitude,
          incident_type: incidentType,
          description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReports((prev) => [data.report, ...prev]);
        setShowForm(false);
        setDescription('');
        toast.success(
          data.ai_validated 
            ? 'Report submitted and verified by AI' 
            : 'Report submitted for review'
        );
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIncidentColor = (type: string) => {
    return INCIDENT_TYPES.find((t) => t.value === type)?.color || 'bg-muted-foreground';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen">
      <Header title="Community Reports" />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Add Report Button */}
        <FadeIn>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-gradient-to-r from-primary to-primary/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            Report an Incident
          </Button>
        </FadeIn>

        {/* Report Form */}
        {showForm && (
          <FadeIn>
            <GlassmorphismCard variant="strong" className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                New Incident Report
              </h3>

              {/* Incident Type Selection */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Type of Incident</label>
                <div className="flex flex-wrap gap-2">
                  {INCIDENT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setIncidentType(type.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        incidentType === type.value
                          ? `${type.color} text-white`
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened..."
                  className="w-full h-24 px-3 py-2 bg-background/50 border border-border/50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              {/* Location */}
              {latitude && longitude && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReport}
                  disabled={isSubmitting || !description.trim()}
                  className="flex-1 bg-primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </Button>
              </div>
            </GlassmorphismCard>
          </FadeIn>
        )}

        {/* Reports List */}
        <FadeIn delay={0.1}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Recent Reports
          </h3>
        </FadeIn>

        {isLoading ? (
          <ListSkeleton count={3} />
        ) : reports.length === 0 ? (
          <FadeIn delay={0.2}>
            <GlassmorphismCard variant="subtle" className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No reports yet. Be the first to contribute to community safety.
              </p>
            </GlassmorphismCard>
          </FadeIn>
        ) : (
          <div className="space-y-3">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassmorphismCard className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getIncidentColor(report.incident_type)}`} />
                      <span className="font-medium capitalize">
                        {report.incident_type.replace('_', ' ')}
                      </span>
                    </div>
                    {report.ai_validated && (
                      <span className="flex items-center gap-1 text-xs text-safe">
                        <Check className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">{report.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(report.created_at)}
                    </span>
                  </div>
                </GlassmorphismCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
