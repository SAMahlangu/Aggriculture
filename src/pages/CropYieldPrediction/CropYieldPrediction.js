import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GOOGLE_MAPS_API_KEY = 'AIzaSyBTBOU0Bz2y3sVX9UUGMrVprkpIQxrbWlc';

const CropYieldPrediction = () => {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [locationSelected, setLocationSelected] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const chatHistoryRef = useRef(null);
  const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    loadGoogleMaps();
    fetchCrops();
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstance) {
      initializeMap();
    }
  }, [mapLoaded, mapInstance]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const loadGoogleMaps = () => {
    if (window.google) {
      setMapLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    const defaultCenter = { lat: 40.7128, lng: -74.006 };
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 4,
      center: defaultCenter,
      mapTypeControl: false,
      fullscreenControl: true,
    });
    map.addListener('click', (e) => handleMapClick(e, map));
    setMapInstance(map);
  };

  const handleMapClick = (event, map) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setLatitude(lat.toFixed(4));
    setLongitude(lng.toFixed(4));
    setLocationSelected(true);

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
    markerRef.current = marker;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setSelectedLocationName(results[0].formatted_address);
      }
    });
  };

  const fetchCrops = async () => {
    try {
      const response = await fetch(`${backendURL}/api/crop_yield_prediction/crops`);
      const data = await response.json();
      if (data.crops) setCrops(data.crops);
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  const handlePredictClick = async () => {
    if (!selectedCrop || !latitude || !longitude) {
      alert('Please select a crop and click on the map');
      return;
    }

    setLoading(true);
    try {
      const predictResponse = await fetch(`${backendURL}/api/crop_yield_prediction/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
          crop: selectedCrop,
        }),
      });

      if (!predictResponse.ok) throw new Error('Prediction failed');
      const predictData = await predictResponse.json();

      const chartData = {
        labels: predictData.labels.map((year) => year.toString()),
        datasets: [
          {
            label: 'Yield (lbs/acre)',
            data: predictData.data,
            borderColor: '#2d6a4f',
            backgroundColor: 'rgba(45, 106, 79, 0.1)',
            pointBackgroundColor: predictData.data.map((_, idx, arr) =>
              idx === arr.length - 1 ? '#ffc107' : '#2d6a4f'
            ),
            pointBorderColor: '#fff',
            pointRadius: 5,
            pointBorderWidth: 2,
            tension: 0.4,
            fill: true,
          },
        ],
      };

      setGraphData(chartData);
      setPrediction(predictData);

      const analysisResponse = await fetch(`${backendURL}/api/crop_yield_prediction/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
          crop: selectedCrop,
        }),
      });

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData.analysis);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory([...chatHistory, { type: 'user', text: userMsg }]);

    try {
      const response = await fetch(`${backendURL}/api/crop_yield_prediction/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await response.json();
      setChatHistory((prev) => [...prev, { type: 'bot', text: data.response }]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="crop-yield-container">
      <div className="yield-header">
        <h1>🌾 Crop Yield Prediction</h1>
        <p>AI-Powered Agricultural Analytics</p>
      </div>

      <div className="yield-layout">
        {/* Map Section */}
        <div className="yield-card map-section">
          <div className="yield-card-title">📍 Select Location</div>
          {!mapLoaded ? (
            <div className="loading-spinner">Loading map...</div>
          ) : (
            <>
              <div className="map-container" ref={mapRef}></div>
              {locationSelected && (
                <div style={{ marginTop: '1rem' }}>
                  <div className="location-badge">
                    ✓ {latitude}, {longitude}
                  </div>
                  {selectedLocationName && (
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                      {selectedLocationName}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls Section */}
        <div className="yield-card controls-section">
          <div className="yield-card-title">⚙️ Configuration</div>

          {!locationSelected ? (
            <div className="alert alert-info">
              👆 Click on the map to select a location
            </div>
          ) : (
            <>
              <div className="alert alert-success">✓ Location selected</div>

              <div className="control-group">
                <label>Crop Type</label>
                <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)}>
                  <option value="">-- Select a crop --</option>
                  {crops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="control-group">
                  <label>Latitude</label>
                  <input type="text" value={latitude} disabled />
                </div>
                <div className="control-group">
                  <label>Longitude</label>
                  <input type="text" value={longitude} disabled />
                </div>
              </div>

              <button
                className="predict-button"
                onClick={handlePredictClick}
                disabled={loading || !selectedCrop}
              >
                {loading ? '⏳ Analyzing...' : '🔍 Get Analysis'}
              </button>
            </>
          )}
        </div>

        {/* Chart Section */}
        {graphData && (
          <div className="yield-card">
            <div className="yield-card-title">📊 Yield Forecast</div>
            <div className="chart-wrapper">
              <Line
                data={graphData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true, position: 'bottom' },
                  },
                }}
              />
            </div>

            {prediction && prediction.data && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Predicted Yield</div>
                  <div className="stat-value">
                    {prediction.data[prediction.data.length - 1]?.toFixed(0)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>lbs/acre</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">5-Yr Average</div>
                  <div className="stat-value">
                    {(prediction.data.slice(-5).reduce((a, b) => a + b, 0) / 5).toFixed(0)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>lbs/acre</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analysis Section */}
        {analysis && (
          <div className="yield-card">
            <div className="yield-card-title">🤖 AI Analysis</div>
            <div className="analysis-box">{analysis}</div>
          </div>
        )}

        {/* Chat Section */}
        <div className="yield-card" style={{ gridColumn: '1 / -1' }}>
          <div className="yield-card-title">💬 Ask an Expert</div>
          <div className="chat-container">
            <div className="chat-history" ref={chatHistoryRef}>
              {chatHistory.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center' }}>
                  Ask me anything about your crop yield...
                </p>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.type}`}>
                    {msg.text}
                  </div>
                ))
              )}
            </div>
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask a question..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendChat();
                }}
              />
              <button className="send-button" onClick={handleSendChat}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropYieldPrediction;
