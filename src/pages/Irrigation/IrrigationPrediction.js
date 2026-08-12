import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Message formatter for chatbot responses
const BotMessageFormatter = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Bold headers: **text**
    if (line.match(/^\*\*.*\*\*$/)) {
      const content = line.replace(/\*\*/g, '');
      elements.push(
        <div key={i} className="bot-response-header">
          {content}
        </div>
      );
    }
    // Bullet points: - text
    else if (line.startsWith('- ')) {
      const content = line.substring(2);
      elements.push(
        <div key={i} className="bot-response-bullet">
          • {content}
        </div>
      );
    }
    // Numbered lists: 1. text
    else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <div key={i} className="bot-response-number">
          {line}
        </div>
      );
    }
    // Empty line
    else if (!line) {
      elements.push(<div key={i} style={{ height: '10px' }} />);
    }
    // Regular text
    else if (line) {
      elements.push(
        <p key={i} className="bot-response-text">
          {line}
        </p>
      );
    }
  }

  return <div className="bot-response-container">{elements}</div>;
};

const IrrigationPrediction = () => {
  // Form state
  const [soilType, setSoilType] = useState('');
  const [soilPh, setSoilPh] = useState(7);
  const [soilMoisture, setSoilMoisture] = useState(50);
  const [organicCarbon, setOrganicCarbon] = useState(1);
  const [ec, setEc] = useState(1);
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(60);
  const [rainfall, setRainfall] = useState(100);
  const [sunlight, setSunlight] = useState(8);
  const [windSpeed, setWindSpeed] = useState(10);
  const [cropType, setCropType] = useState('');
  const [growthStage, setGrowthStage] = useState('');
  const [season, setSeason] = useState('');
  const [irrigationType, setIrrigationType] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [fieldArea, setFieldArea] = useState(1);
  const [mulching, setMulching] = useState('');
  const [previousIrrigation, setPreviousIrrigation] = useState(0);
  const [region, setRegion] = useState('');

  // Dropdown options
  const [options, setOptions] = useState({
    soil_types: [],
    crop_types: [],
    growth_stages: [],
    seasons: [],
    irrigation_types: [],
    water_sources: [],
    mulching_options: [],
    regions: []
  });

  // Prediction results
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState('');

  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load dropdown options on mount
  useEffect(() => {
    fetchOptions();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchOptions = async () => {
    try {
      const response = await fetch(`${API_URL}/irrigation/options`);
      const data = await response.json();
      if (data.success) {
        setOptions(data.data);
        // Set default values for dropdowns
        if (data.data.soil_types.length > 0) setSoilType(data.data.soil_types[0]);
        if (data.data.crop_types.length > 0) setCropType(data.data.crop_types[0]);
        if (data.data.growth_stages.length > 0) setGrowthStage(data.data.growth_stages[0]);
        if (data.data.seasons.length > 0) setSeason(data.data.seasons[0]);
        if (data.data.irrigation_types.length > 0) setIrrigationType(data.data.irrigation_types[0]);
        if (data.data.water_sources.length > 0) setWaterSource(data.data.water_sources[0]);
        if (data.data.mulching_options.length > 0) setMulching(data.data.mulching_options[0]);
        if (data.data.regions.length > 0) setRegion(data.data.regions[0]);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handlePredict = async () => {
    setPredictionLoading(true);
    setPredictionError('');
    try {
      const response = await fetch(`${API_URL}/irrigation/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soil_type: soilType,
          soil_ph: soilPh,
          soil_moisture: soilMoisture,
          organic_carbon: organicCarbon,
          electrical_conductivity: ec,
          temperature,
          humidity,
          rainfall,
          sunlight,
          wind_speed: windSpeed,
          crop_type: cropType,
          growth_stage: growthStage,
          season,
          irrigation_type: irrigationType,
          water_source: waterSource,
          field_area: fieldArea,
          mulching_used: mulching,
          previous_irrigation: previousIrrigation,
          region
        })
      });

      const data = await response.json();
      if (data.success) {
        setPrediction(data.data);
        setChatHistory([]);
      } else {
        setPredictionError(data.error || 'Prediction failed');
      }
    } catch (error) {
      setPredictionError(error.message);
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleRandomSample = async () => {
    try {
      const response = await fetch(`${API_URL}/irrigation/random-sample`);
      const data = await response.json();
      if (data.success) {
        const sample = data.data;
        setSoilType(sample.soil_type);
        setSoilPh(sample.soil_ph);
        setSoilMoisture(sample.soil_moisture);
        setOrganicCarbon(sample.organic_carbon);
        setEc(sample.electrical_conductivity);
        setTemperature(sample.temperature);
        setHumidity(sample.humidity);
        setRainfall(sample.rainfall);
        setSunlight(sample.sunlight);
        setWindSpeed(sample.wind_speed);
        setCropType(sample.crop_type);
        setGrowthStage(sample.growth_stage);
        setSeason(sample.season);
        setIrrigationType(sample.irrigation_type);
        setWaterSource(sample.water_source);
        setFieldArea(sample.field_area);
        setMulching(sample.mulching_used);
        setPreviousIrrigation(sample.previous_irrigation);
        setRegion(sample.region);
      }
    } catch (error) {
      console.error('Error loading random sample:', error);
    }
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim() || !prediction) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/irrigation/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prediction,
          history: chatHistory,
          message: userMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="irrigation-container">
      <div className="irrigation-header">
        <h1>🚿 Smart Irrigation Prediction</h1>
        <p>AI-powered irrigation management for optimal crop water requirements</p>
      </div>

      <div className="irrigation-content">
        {/* Left Panel - Form */}
        <div className="irrigation-form-section">
          <h2>Soil & Environmental Parameters</h2>
          
          <div className="form-grid">
            {/* Soil Type */}
            <div className="form-group">
              <label>Soil Type</label>
              <select value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                {options.soil_types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Soil pH */}
            <div className="form-group">
              <label>Soil pH: {soilPh.toFixed(1)}</label>
              <input type="range" min="4" max="9" step="0.1" value={soilPh} onChange={(e) => setSoilPh(parseFloat(e.target.value))} />
            </div>

            {/* Soil Moisture */}
            <div className="form-group">
              <label>Soil Moisture: {soilMoisture.toFixed(0)}%</label>
              <input type="range" min="0" max="100" value={soilMoisture} onChange={(e) => setSoilMoisture(parseFloat(e.target.value))} />
            </div>

            {/* Organic Carbon */}
            <div className="form-group">
              <label>Organic Carbon: {organicCarbon.toFixed(2)}</label>
              <input type="range" min="0" max="5" step="0.1" value={organicCarbon} onChange={(e) => setOrganicCarbon(parseFloat(e.target.value))} />
            </div>

            {/* EC */}
            <div className="form-group">
              <label>Electrical Conductivity: {ec.toFixed(2)}</label>
              <input type="range" min="0" max="4" step="0.1" value={ec} onChange={(e) => setEc(parseFloat(e.target.value))} />
            </div>

            {/* Temperature */}
            <div className="form-group">
              <label>Temperature: {temperature.toFixed(0)}°C</label>
              <input type="range" min="0" max="50" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} />
            </div>

            {/* Humidity */}
            <div className="form-group">
              <label>Humidity: {humidity.toFixed(0)}%</label>
              <input type="range" min="0" max="100" value={humidity} onChange={(e) => setHumidity(parseFloat(e.target.value))} />
            </div>

            {/* Rainfall */}
            <div className="form-group">
              <label>Rainfall: {rainfall.toFixed(0)} mm</label>
              <input type="range" min="0" max="500" value={rainfall} onChange={(e) => setRainfall(parseFloat(e.target.value))} />
            </div>

            {/* Sunlight */}
            <div className="form-group">
              <label>Sunlight: {sunlight.toFixed(0)} hrs</label>
              <input type="range" min="0" max="24" step="0.5" value={sunlight} onChange={(e) => setSunlight(parseFloat(e.target.value))} />
            </div>

            {/* Wind Speed */}
            <div className="form-group">
              <label>Wind Speed: {windSpeed.toFixed(0)} km/h</label>
              <input type="range" min="0" max="50" value={windSpeed} onChange={(e) => setWindSpeed(parseFloat(e.target.value))} />
            </div>
          </div>

          <h2>Crop & Management Parameters</h2>
          
          <div className="form-grid">
            {/* Crop Type */}
            <div className="form-group">
              <label>Crop Type</label>
              <select value={cropType} onChange={(e) => setCropType(e.target.value)}>
                {options.crop_types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Growth Stage */}
            <div className="form-group">
              <label>Growth Stage</label>
              <select value={growthStage} onChange={(e) => setGrowthStage(e.target.value)}>
                {options.growth_stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div className="form-group">
              <label>Season</label>
              <select value={season} onChange={(e) => setSeason(e.target.value)}>
                {options.seasons.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Irrigation Type */}
            <div className="form-group">
              <label>Irrigation Type</label>
              <select value={irrigationType} onChange={(e) => setIrrigationType(e.target.value)}>
                {options.irrigation_types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Water Source */}
            <div className="form-group">
              <label>Water Source</label>
              <select value={waterSource} onChange={(e) => setWaterSource(e.target.value)}>
                {options.water_sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {/* Field Area */}
            <div className="form-group">
              <label>Field Area: {fieldArea.toFixed(2)} hectares</label>
              <input type="range" min="0.1" max="100" step="0.1" value={fieldArea} onChange={(e) => setFieldArea(parseFloat(e.target.value))} />
            </div>

            {/* Mulching */}
            <div className="form-group">
              <label>Mulching Used</label>
              <select value={mulching} onChange={(e) => setMulching(e.target.value)}>
                {options.mulching_options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Previous Irrigation */}
            <div className="form-group">
              <label>Previous Irrigation: {previousIrrigation.toFixed(0)} mm</label>
              <input type="range" min="0" max="200" value={previousIrrigation} onChange={(e) => setPreviousIrrigation(parseFloat(e.target.value))} />
            </div>

            {/* Region */}
            <div className="form-group">
              <label>Region</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                {options.regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-buttons">
            <button className="btn-predict" onClick={handlePredict} disabled={predictionLoading}>
              {predictionLoading ? '🔄 Predicting...' : '📊 Predict Irrigation Need'}
            </button>
            <button className="btn-random" onClick={handleRandomSample}>
              🎲 Random Sample
            </button>
          </div>

          {predictionError && (
            <div className="error-message">{predictionError}</div>
          )}
        </div>

        {/* Right Panel - Results & Chat */}
        <div className="irrigation-results-section">
          {prediction ? (
            <>
              <div className="prediction-result">
                <h2>Prediction Result</h2>
                <div className="result-card">
                  <div className="result-level">
                    <span className="emoji">{prediction.advice.emoji}</span>
                    <div>
                      <h3>{prediction.advice.title}</h3>
                      <p className="confidence">Confidence: {prediction.confidence}%</p>
                    </div>
                  </div>

                  <div className="result-probabilities">
                    <h4>Probabilities:</h4>
                    {Object.entries(prediction.probabilities).map(([level, prob]) => (
                      <div key={level} className="probability-bar">
                        <span className="level-label">{level}</span>
                        <div className="bar">
                          <div className="fill" style={{ width: `${prob}%` }}>
                            {prob.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="result-advice">
                    <h4>Recommendations:</h4>
                    <ul>
                      {prediction.advice.advice.map((adv, idx) => (
                        <li key={idx}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="chatbot-section">
                <h2>💬 Ask AI Advisor</h2>
                <div className="chat-messages">
                  {chatHistory.length === 0 && (
                    <div className="chat-welcome">
                      <p>Ask me anything about irrigation, water management, or crop recommendations!</p>
                    </div>
                  )}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`chat-message chat-${msg.role}`}>
                      {msg.role === 'assistant' ? (
                        <BotMessageFormatter text={msg.content} />
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="chat-message chat-assistant">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    disabled={chatLoading}
                  />
                  <button onClick={handleSendChat} disabled={chatLoading || !chatMessage.trim()}>
                    {chatLoading ? '⏳' : '📤'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-prediction">
              <p>👈 Fill in the parameters and click "Predict Irrigation Need" to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IrrigationPrediction;
