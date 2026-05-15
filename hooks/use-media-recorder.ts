'use client';

import { useState, useRef, useCallback } from 'react';

interface MediaRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  error: string | null;
  audioBlob: Blob | null;
  videoBlob: Blob | null;
  audioUrl: string | null;
  videoUrl: string | null;
  duration: number;
}

interface UseMediaRecorderOptions {
  onDataAvailable?: (blob: Blob, type: 'audio' | 'video') => void;
  maxDuration?: number; // in seconds
}

export function useMediaRecorder(options: UseMediaRecorderOptions = {}) {
  const { onDataAvailable, maxDuration = 60 } = options;

  const [state, setState] = useState<MediaRecorderState>({
    isRecording: false,
    isPaused: false,
    error: null,
    audioBlob: null,
    videoBlob: null,
    audioUrl: null,
    videoUrl: null,
    duration: 0
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (durationRef.current) {
      clearInterval(durationRef.current);
      durationRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false
    }));
  }, []);

  const startAudioRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, audioBlob: null, audioUrl: null, duration: 0 }));

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const url = URL.createObjectURL(blob);
        
        setState(prev => ({
          ...prev,
          audioBlob: blob,
          audioUrl: url,
          isRecording: false
        }));

        onDataAvailable?.(blob, 'audio');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second

      setState(prev => ({ ...prev, isRecording: true }));

      // Duration counter
      durationRef.current = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      // Auto-stop after max duration
      timerRef.current = setTimeout(() => {
        stopRecording();
      }, maxDuration * 1000);

    } catch (error) {
      console.error('Audio recording error:', error);
      setState(prev => ({
        ...prev,
        error: 'Could not start audio recording. Please check microphone permissions.',
        isRecording: false
      }));
    }
  }, [maxDuration, onDataAvailable, stopRecording]);

  const startVideoRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, videoBlob: null, videoUrl: null, duration: 0 }));

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const url = URL.createObjectURL(blob);
        
        setState(prev => ({
          ...prev,
          videoBlob: blob,
          videoUrl: url,
          isRecording: false
        }));

        onDataAvailable?.(blob, 'video');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);

      setState(prev => ({ ...prev, isRecording: true }));

      durationRef.current = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      timerRef.current = setTimeout(() => {
        stopRecording();
      }, maxDuration * 1000);

    } catch (error) {
      console.error('Video recording error:', error);
      setState(prev => ({
        ...prev,
        error: 'Could not start video recording. Please check camera permissions.',
        isRecording: false
      }));
    }
  }, [maxDuration, onDataAvailable, stopRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, []);

  const clearRecording = useCallback(() => {
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    if (state.videoUrl) URL.revokeObjectURL(state.videoUrl);
    
    setState({
      isRecording: false,
      isPaused: false,
      error: null,
      audioBlob: null,
      videoBlob: null,
      audioUrl: null,
      videoUrl: null,
      duration: 0
    });
  }, [state.audioUrl, state.videoUrl]);

  return {
    ...state,
    startAudioRecording,
    startVideoRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    stream: streamRef.current
  };
}
