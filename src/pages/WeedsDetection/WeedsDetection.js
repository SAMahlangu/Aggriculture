import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Box, Button, Card, CardContent, Typography, Stack, LinearProgress } from '@mui/material';
import { CloudUpload as CloudUploadIcon, PlayArrow as PlayArrowIcon, Stop as StopIcon } from '@mui/icons-material';
import './App.css';

const WeedsDetection = () => {
  const [video, setVideo] = useState(null);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [frameSrc, setFrameSrc] = useState('');
  const [weedCount, setWeedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInput = useRef(null);
  const eventSourceRef = useRef(null);
  const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideo(file);
      setFrameSrc('');
      setWeedCount(0);
    }
  };

  const uploadVideo = async () => {
    if (!video) return;

    const formData = new FormData();
    formData.append('file', video, video.name);

    try {
      setIsUploading(true);
      await axios.post(`${backendURL}/api/weeds_detection/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadPercentage(percentCompleted);
        },
      });

      setIsUploading(false);
      setUploadPercentage(100);
      startStreaming();
    } catch (error) {
      console.error('Error uploading video:', error);
      setIsUploading(false);
      alert('Failed to upload video');
    }
  };

  const startStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      setIsProcessing(true);
      const eventSource = new EventSource(`${backendURL}/api/weeds_detection/stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.frame) {
            setFrameSrc(`data:image/jpeg;base64,${data.frame}`);
            setWeedCount(data.count || 0);
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
      await axios.post(`${backendURL}/api/weeds_detection/stop`);
    } catch (error) {
      console.error('Error stopping processing:', error);
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsProcessing(false);
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
          Weeds Detection & Tracking
        </Typography>
        <Typography variant="body1" align="center" paragraph sx={{ mb: 4, color: '#666' }}>
          Upload a video to detect and track weeds in your agricultural field using advanced AI
        </Typography>

        {/* Upload Section */}
        <Box sx={{ mb: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  ref={fileInput}
                  onChange={handleVideoChange}
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    onClick={handleButtonClick}
                    disabled={isUploading || isProcessing}
                  >
                    Select Video
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PlayArrowIcon />}
                    onClick={uploadVideo}
                    disabled={!video || isUploading || isProcessing}
                  >
                    Process Video
                  </Button>

                  {isProcessing && (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<StopIcon />}
                      onClick={stopProcessing}
                    >
                      Stop
                    </Button>
                  )}
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
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Processing Results */}
        {(frameSrc || isProcessing) && (
          <Box sx={{ mb: 4 }}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Live Processing Results</Typography>

                  {frameSrc && (
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
                  )}

                  {isProcessing && !frameSrc && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <LinearProgress />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Processing video...
                      </Typography>
                    </Box>
                  )}

                  <Card variant="outlined" sx={{ backgroundColor: '#e8f5e9' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                        {weedCount}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#558b2f' }}>
                        Total Weeds Detected
                      </Typography>
                    </CardContent>
                  </Card>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default WeedsDetection;
