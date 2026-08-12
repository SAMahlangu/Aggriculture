import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Divider
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
  Image as ImageIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import './App.css';

const PlantIdentification = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plantName, setPlantName] = useState(null);
  const [plantInfo, setPlantInfo] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setMessages([]);
        setPlantName(null);
        setPlantInfo('');
        setConfidence(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert base64 to blob
  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Handle plant detection
  const handleDetectPlant = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const blob = dataURLtoBlob(image);
      const formData = new FormData();
      formData.append('file', blob);

      const response = await fetch('http://localhost:5000/api/plant_identification/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Detection failed');
      }

      setPlantName(data.label);
      setPlantInfo(data.info);
      setConfidence(data.confidence);
      setMessages([
        { sender: 'bot', text: `Detected Plant: ${data.label}` },
        { sender: 'bot', text: data.info }
      ]);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle chat message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !plantName) {
      if (!plantName) setError('Please detect a plant first');
      return;
    }

    const userMessage = chatInput;
    setChatInput('');
    setChatLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/plant_identification/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages([
        ...messages,
        { sender: 'user', text: userMessage },
        { sender: 'bot', text: data.response }
      ]);
    } catch (err) {
      setError(`Chat error: ${err.message}`);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}>
          4IR Plant Recognition App
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
          🌿 Leaf it to Us: Upload Your Plant Pic Now!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          We'll identify and tell you all there is to know about it.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left side - Image upload and detection */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Preview
            </Typography>

            {/* Image preview */}
            {image && (
              <Box sx={{ mb: 2 }}>
                <img
                  src={image}
                  alt="Plant preview"
                  style={{
                    maxWidth: '100%',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0'
                  }}
                />
              </Box>
            )}

            {/* File input */}
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="plant-image-input"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="plant-image-input">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<ImageIcon />}
                  sx={{ mb: 2 }}
                >
                  Choose File
                </Button>
              </label>
            </Box>

            {/* Detect button */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleDetectPlant}
              disabled={!image || loading}
              sx={{ mb: 2, bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Detecting...
                </>
              ) : (
                'Process'
              )}
            </Button>

            {/* Detection results */}
            {plantName && (
              <Card sx={{ bgcolor: '#f5f5f5', mt: 2 }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Detected Plant
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1, color: '#2e7d32' }}>
                    {plantName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Confidence: {(confidence * 100).toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>

        {/* Right side - Chat interface */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Botanist Chat
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Chat messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                mb: 2,
                p: 2,
                bgcolor: '#fafafa',
                borderRadius: '8px'
              }}
            >
              {messages.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  {plantName
                    ? 'Ask me anything about this plant...'
                    : 'Upload and detect a plant to start chatting'}
                </Typography>
              ) : (
                messages.map((msg, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      mb: 1,
                      p: 1.5,
                      bgcolor: msg.sender === 'user' ? '#e3f2fd' : '#f1f8e9',
                      borderRadius: '8px',
                      border: `1px solid ${msg.sender === 'user' ? '#bbdefb' : '#dcedc8'}`
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{msg.sender === 'user' ? 'You:' : 'Botanist:'}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {msg.text}
                    </Typography>
                  </Box>
                ))
              )}
              {chatLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </Box>

            {/* Chat input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!plantName || chatLoading}
                multiline
                maxRows={3}
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={!plantName || !chatInput.trim() || chatLoading}
                sx={{ minWidth: '100px', bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PlantIdentification;
