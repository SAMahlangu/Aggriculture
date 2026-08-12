import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Videocam as VideocamIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import './App.css';

const AnimalCount = () => {
  const [video, setVideo] = useState(null);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [frameSrc, setFrameSrc] = useState('');
  const [stats, setStats] = useState({ total_count: 0, in_count: 0, out_count: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [source, setSource] = useState(null);
  const [mode, setMode] = useState('video'); // 'video' or 'webcam'
  const fileInput = useRef(null);
  const eventSourceRef = useRef(null);
  const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideo(file);
      setFrameSrc('');
      setStats({ total_count: 0, in_count: 0, out_count: 0 });
    }
  };

  const uploadVideo = async () => {
    if (!video) return;

    const formData = new FormData();
    formData.append('file', video, video.name);

    try {
      setIsUploading(true);
      const response = await fetch(`${backendURL}/api/animal_count/upload`, {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadPercentage(percentCompleted);
        },
      });

      if (!response.ok) throw new Error('Upload failed');
      setIsUploading(false);
      setUploadPercentage(100);
      startStreaming('video');
    } catch (error) {
      console.error('Error uploading video:', error);
      setIsUploading(false);
      alert('Failed to upload video');
    }
  };

  const startStreaming = (streamMode) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      setIsProcessing(true);
      const endpoint = streamMode === 'webcam' ? '/webcam' : '/stream';
      const eventSource = new EventSource(`${backendURL}/api/animal_count${endpoint}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.frame) {
            setFrameSrc(`data:image/jpeg;base64,${data.frame}`);
            if (data.stats) {
              setStats(data.stats);
            }
          }
        } catch (e) {
          console.error('Error parsing event data:', e);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsProcessing(false);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Error starting stream:', error);
      setIsProcessing(false);
    }
  };

  const stopProcessing = async () => {
    try {
      await fetch(`${backendURL}/api/animal_count/stop`, { method: 'POST' });
    } catch (error) {
      console.error('Error stopping processing:', error);
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsProcessing(false);
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      if (isProcessing) {
        stopProcessing();
      }
    }
  };

  const handleButtonClick = () => {
    fileInput.current.click();
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Animal Count & Tracking
        </Typography>
        <Typography variant="body1" align="center" paragraph sx={{ mb: 4, color: '#666' }}>
          Real-time animal detection, tracking, and counting with line crossing analysis
        </Typography>

        {/* Mode Selection */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            disabled={isProcessing}
          >
            <ToggleButton value="video">Video Upload</ToggleButton>
            <ToggleButton value="webcam">Webcam</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={3}>
          {/* Upload/Control Section */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {mode === 'video' ? 'Video Upload' : 'Webcam Stream'}
                </Typography>
                <Stack spacing={2}>
                  {mode === 'video' ? (
                    <>
                      <input
                        type="file"
                        accept="video/*"
                        hidden
                        ref={fileInput}
                        onChange={handleVideoChange}
                      />

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<CloudUploadIcon />}
                          onClick={handleButtonClick}
                          disabled={isUploading || isProcessing}
                          fullWidth
                        >
                          Select Video
                        </Button>

                        <Button
                          variant="contained"
                          color="success"
                          onClick={uploadVideo}
                          disabled={!video || isUploading || isProcessing}
                          fullWidth
                        >
                          Process
                        </Button>
                      </Box>

                      {isUploading && (
                        <Box>
                          <LinearProgress variant="determinate" value={uploadPercentage} />
                          <Typography variant="caption" sx={{ mt: 1 }}>
                            {uploadPercentage}% Uploaded
                          </Typography>
                        </Box>
                      )}

                      {video && !isUploading && (
                        <Typography variant="body2" sx={{ color: '#4caf50' }}>
                          ✓ Video selected: {video.name}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<VideocamIcon />}
                        onClick={() => startStreaming('webcam')}
                        disabled={isProcessing}
                        fullWidth
                      >
                        Start Webcam
                      </Button>

                      {isProcessing && (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<StopIcon />}
                          onClick={stopProcessing}
                          fullWidth
                        >
                          Stop
                        </Button>
                      )}
                    </Box>
                  )}

                  {isProcessing && (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<StopIcon />}
                      onClick={stopProcessing}
                      fullWidth
                    >
                      Stop Processing
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats Section */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ backgroundColor: '#e8f5e9' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      {stats.total_count}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#558b2f' }}>
                      Total Detected
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ backgroundColor: '#e3f2fd' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                      {stats.in_count}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0d47a1' }}>
                      Entered
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ backgroundColor: '#fff3e0' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ color: '#e65100', fontWeight: 'bold' }}>
                      {stats.out_count}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bf360c' }}>
                      Exited
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ backgroundColor: isProcessing ? '#fff9c4' : '#f5f5f5' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isProcessing ? '#f57f17' : '#999',
                        fontWeight: 'bold',
                      }}
                    >
                      {isProcessing ? 'Processing...' : 'Ready'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Video Display */}
          {frameSrc && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Live Detection Feed
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={frameSrc}
                      alt="Detection Frame"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '600px',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Processing Indicator */}
          {isProcessing && !frameSrc && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <LinearProgress />
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Processing video stream...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default AnimalCount;
