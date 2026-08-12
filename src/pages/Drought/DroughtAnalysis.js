import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Cloud as CloudIcon,
  Thermostat as TemperatureIcon,
  Air as WindIcon,
  Opacity as HumidityIcon,
  Info as InfoIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import './App.css';

const DROUGHT_CATEGORIES = {
  0: { name: 'Abnormally Dry', color: '#FFF44F', severity: 'Low' },
  1: { name: 'Moderate Drought', color: '#FF9800', severity: 'Medium' },
  2: { name: 'Severe Drought', color: '#FF5722', severity: 'High' },
  3: { name: 'Extreme Drought', color: '#D32F2F', severity: 'Very High' },
  4: { name: 'Exceptional Drought', color: '#8B0000', severity: 'Critical' }
};

const DEFAULT_VALUES = {
  PS: 1010.0,
  QV2M: 10.0,
  T2M: 25.0,
  T2MDEW: 20.0,
  T2M_MAX: 30.0,
  T2M_MIN: 15.0,
  T2M_RANGE: 15.0,
  TS: 25.0,
  WS10M: 5.0,
  WS10M_RANGE: 2.0,
  WS50M: 8.0,
  WS50M_MAX: 10.0,
  WS50M_RANGE: 3.0,
  YEAR: new Date().getFullYear(),
  DATE: Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
};

export default function DroughtAnalysis() {
  const [inputs, setInputs] = useState(DEFAULT_VALUES);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [features, setFeatures] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showFeatureInfo, setShowFeatureInfo] = useState(false);

  // Fetch feature descriptions on mount
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/drought/features');
        const data = await response.json();
        if (data.success) {
          setFeatures(data.features);
        }
      } catch (err) {
        console.error('Error fetching features:', err);
      }
    };
    fetchFeatures();
  }, []);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/drought/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      const data = await response.json();
      
      if (data.success) {
        setPrediction(data);
        setChatHistory([]);
        setChatMessage('');
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      setError('Error making prediction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatMessage.trim()) return;

    setChatLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/drought/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: 'default',
          message: chatMessage,
          info: inputs,
          prediction: prediction?.prediction || 0
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setChatHistory(prev => [
          ...prev,
          { type: 'user', text: chatMessage },
          { type: 'bot', text: data.response }
        ]);
        setChatMessage('');
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const resetForm = () => {
    setInputs(DEFAULT_VALUES);
    setPrediction(null);
    setChatHistory([]);
  };

  const featureGroups = {
    Temperature: ['T2M', 'T2MDEW', 'T2M_MAX', 'T2M_MIN', 'T2M_RANGE', 'TS'],
    Wind: ['WS10M', 'WS10M_RANGE', 'WS50M', 'WS50M_MAX', 'WS50M_RANGE'],
    Atmospheric: ['PS', 'QV2M'],
    Temporal: ['YEAR', 'DATE']
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          🌍 Drought Analysis & Prediction
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Advanced AI-powered drought prediction using environmental parameters
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={prediction ? 6 : 12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Environmental Parameters</Typography>
              <Button
                startIcon={<InfoIcon />}
                size="small"
                onClick={() => setShowFeatureInfo(true)}
                variant="outlined"
              >
                Help
              </Button>
            </Box>

            {/* Temperature Parameters */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TemperatureIcon fontSize="small" /> Temperature Parameters
              </Typography>
              <Grid container spacing={2}>
                {featureGroups.Temperature.map(field => (
                  <Grid item xs={12} sm={6} key={field}>
                    <TextField
                      fullWidth
                      label={features[field]?.label || field}
                      type="number"
                      value={inputs[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      inputProps={{
                        step: 0.1,
                        min: features[field]?.min,
                        max: features[field]?.max
                      }}
                      size="small"
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Wind Parameters */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WindIcon fontSize="small" /> Wind Parameters
              </Typography>
              <Grid container spacing={2}>
                {featureGroups.Wind.map(field => (
                  <Grid item xs={12} sm={6} key={field}>
                    <TextField
                      fullWidth
                      label={features[field]?.label || field}
                      type="number"
                      value={inputs[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      inputProps={{
                        step: 0.1,
                        min: features[field]?.min,
                        max: features[field]?.max
                      }}
                      size="small"
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Atmospheric & Temporal */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                {featureGroups.Atmospheric.map(field => (
                  <Grid item xs={12} sm={6} key={field}>
                    <TextField
                      fullWidth
                      label={features[field]?.label || field}
                      type="number"
                      value={inputs[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      inputProps={{
                        step: 0.1,
                        min: features[field]?.min,
                        max: features[field]?.max
                      }}
                      size="small"
                    />
                  </Grid>
                ))}
                {featureGroups.Temporal.map(field => (
                  <Grid item xs={12} sm={6} key={field}>
                    <TextField
                      fullWidth
                      label={features[field]?.label || field}
                      type="number"
                      value={inputs[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      inputProps={{
                        step: field === 'DATE' ? 1 : 1,
                        min: features[field]?.min,
                        max: features[field]?.max
                      }}
                      size="small"
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handlePredict}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              >
                {loading ? 'Predicting...' : 'Predict Drought'}
              </Button>
              <Button
                variant="outlined"
                onClick={resetForm}
                disabled={loading}
              >
                Reset
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Prediction Result */}
        {prediction && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Prediction Result</Typography>
              
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: DROUGHT_CATEGORIES[prediction.prediction].color,
                  textAlign: 'center',
                  mb: 2,
                  border: '2px solid #333'
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {DROUGHT_CATEGORIES[prediction.prediction].name}
                </Typography>
                <Chip
                  label={`Severity: ${DROUGHT_CATEGORIES[prediction.prediction].severity}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Key Parameters:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><TemperatureIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Temperature"
                    secondary={`${inputs.T2M}°C (min: ${inputs.T2M_MIN}°C, max: ${inputs.T2M_MAX}°C)`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><HumidityIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Humidity"
                    secondary={`${inputs.QV2M} g/kg`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><WindIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Wind Speed"
                    secondary={`${inputs.WS10M} m/s @ 10M, ${inputs.WS50M} m/s @ 50M`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CloudIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Pressure"
                    secondary={`${inputs.PS} hPa`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Chatbot Section */}
      {prediction && (
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>💬 Agricultural Advisor Chatbot</Typography>
            
            {/* Chat History */}
            <Box sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              p: 2,
              maxHeight: '400px',
              overflowY: 'auto',
              mb: 2,
              minHeight: '200px'
            }}>
              {chatHistory.length === 0 ? (
                <Typography color="textSecondary" align="center">
                  Ask the chatbot for drought mitigation strategies and agricultural advice...
                </Typography>
              ) : (
                chatHistory.map((msg, idx) => (
                  <Box key={idx} sx={{ mb: 1.5, display: 'flex', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
                    <Paper sx={{
                      p: 1.5,
                      backgroundColor: msg.type === 'user' ? '#1976d2' : '#e0e0e0',
                      color: msg.type === 'user' ? 'white' : 'black',
                      maxWidth: '70%',
                      borderRadius: 2
                    }}>
                      <Typography variant="body2">{msg.text}</Typography>
                    </Paper>
                  </Box>
                ))
              )}
            </Box>

            {/* Chat Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask about drought strategies, crop-specific advice, or mitigation..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !chatLoading && handleChatSend()}
                disabled={chatLoading}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleChatSend}
                disabled={chatLoading || !chatMessage.trim()}
                endIcon={<SendIcon />}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Feature Info Dialog */}
      <Dialog open={showFeatureInfo} onClose={() => setShowFeatureInfo(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Environmental Parameters Guide</DialogTitle>
        <DialogContent dividers>
          {Object.entries(featureGroups).map(([group, fields]) => (
            <Box key={group} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>{group}</Typography>
              {fields.map(field => (
                <Typography key={field} variant="caption" display="block" sx={{ mb: 0.5 }}>
                  <strong>{field}:</strong> {features[field]?.label || 'N/A'}
                </Typography>
              ))}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeatureInfo(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
