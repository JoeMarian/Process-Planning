import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, LinearProgress, Alert, Paper, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

declare global {
  interface Window {
    GazeCloudAPI: {
      StartEyeTracking: () => void;
      StopEyeTracking: () => void;
      OnResult: (GazeData: {
        docX: number;
        docY: number;
        state: string;
        time: number;
      }) => void;
      APIKey: string;
      OnCalibrationComplete: () => void;
      OnCamDenied: () => void;
      OnConnectionLost: () => void;
    };
  }
}

export interface AttentionMetrics {
  attentionScore: number;
  focusTime: number;
  distractions: number;
  lastUpdate: number;
}

interface EyeTrackerProps {
  participantId: string;
  onMetricsUpdate: (metrics: Partial<AttentionMetrics>) => void;
}

const EyeTracker: React.FC<EyeTrackerProps> = ({ participantId, onMetricsUpdate }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [metrics, setMetrics] = useState<AttentionMetrics>({
    attentionScore: 100,
    focusTime: 0,
    distractions: 0,
    lastUpdate: Date.now(),
  });

  const startTracking = useCallback(() => {
    if (window.GazeCloudAPI) {
      try {
        window.GazeCloudAPI.StartEyeTracking();
        setIsReconnecting(false);
        setError(null);
      } catch (err) {
        console.error('Failed to start eye tracking:', err);
        setError('Failed to start eye tracking. Please try again.');
        setIsTracking(false);
      }
    }
  }, []);

  const handleConnectionLost = useCallback(() => {
    setIsTracking(false);
    setError('Connection lost. Attempting to reconnect...');
    setIsReconnecting(true);

    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Attempt to reconnect after 3 seconds
    reconnectTimeoutRef.current = setTimeout(() => {
      startTracking();
    }, 3000);
  }, [startTracking]);

  const updateAttentionMetrics = useCallback((gazeState: string) => {
    const now = Date.now();
    
    setMetrics(prev => {
      const timeDiff = now - prev.lastUpdate;
      let newScore = prev.attentionScore;
      let newDistractions = prev.distractions;
      let newFocusTime = prev.focusTime;

      if (gazeState === 'fixation') {
        newScore = Math.min(100, prev.attentionScore + 1);
        newFocusTime += timeDiff;
      } else if (gazeState === 'saccade') {
        newScore = Math.max(0, prev.attentionScore - 0.5);
      } else if (gazeState === 'lost') {
        newScore = Math.max(0, prev.attentionScore - 2);
        newDistractions += 1;
      }

      const updatedMetrics = {
        attentionScore: newScore,
        focusTime: newFocusTime,
        distractions: newDistractions,
        lastUpdate: now,
      };

      onMetricsUpdate(updatedMetrics);
      return updatedMetrics;
    });
  }, [onMetricsUpdate]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api.gazerecorder.com/GazeCloudAPI.js';
    script.async = true;
    
    script.onload = () => {
      if (window.GazeCloudAPI) {
        // Configure GazeCloudAPI callbacks
        window.GazeCloudAPI.OnCalibrationComplete = () => {
          setIsTracking(true);
          setError(null);
          setIsReconnecting(false);
        };

        window.GazeCloudAPI.OnCamDenied = () => {
          setError('Camera access denied. Please enable camera permissions.');
          setIsTracking(false);
        };

        window.GazeCloudAPI.OnConnectionLost = () => {
          handleConnectionLost();
        };

        window.GazeCloudAPI.OnResult = (GazeData: any) => {
          updateAttentionMetrics(GazeData.state);
        };

        // Start tracking initially
        startTracking();
      }
    };

    script.onerror = () => {
      setError('Failed to load eye tracking script. Please refresh the page.');
      setIsTracking(false);
    };

    document.body.appendChild(script);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (window.GazeCloudAPI) {
        window.GazeCloudAPI.StopEyeTracking();
      }
      document.body.removeChild(script);
    };
  }, [updateAttentionMetrics, handleConnectionLost, startTracking]);

  const getAttentionColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 50) return 'warning.main';
    return 'error.main';
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2, maxWidth: 400 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <VisibilityIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Attention Tracking</Typography>
      </Box>

      {error && (
        <Alert 
          severity={isReconnecting ? "warning" : "error"} 
          sx={{ mb: 2 }}
          action={
            isReconnecting ? null : (
              <Button color="inherit" size="small" onClick={startTracking}>
                Try again
              </Button>
            )
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Attention Score
        </Typography>
        <LinearProgress
          variant="determinate"
          value={metrics.attentionScore}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getAttentionColor(metrics.attentionScore),
            },
          }}
        />
        <Typography
          variant="body2"
          sx={{ mt: 0.5, color: getAttentionColor(metrics.attentionScore) }}
        >
          {metrics.attentionScore}%
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">
          Focus Time: {formatTime(metrics.focusTime)}
        </Typography>
        <Typography variant="body2">
          Distractions: {metrics.distractions}
        </Typography>
      </Box>

      <Typography
        variant="caption"
        sx={{ display: 'block', textAlign: 'center', color: 'text.secondary' }}
      >
        {isReconnecting ? 'Reconnecting...' : isTracking ? 'Eye tracking active' : 'Eye tracking inactive'}
      </Typography>
    </Paper>
  );
};

export default EyeTracker; 