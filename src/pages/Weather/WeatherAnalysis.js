import React, { useState, useEffect } from 'react';
import './App.css';

const WeatherAnalysis = () => {
  const [location, setLocation] = useState('Portharcourt, Nigeria');
  const [selectedDay, setSelectedDay] = useState('Today');
  const [weatherData, setWeatherData] = useState(null);
  const [scheduledActivities, setScheduledActivities] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          file.name.endsWith('.docx')) {
        setUploadedFile(file);
        setError('');
      } else {
        setError('Please upload a .docx file');
        setUploadedFile(null);
      }
    }
  };

  // Fetch weather data
  const fetchWeather = async () => {
    if (!selectedDay) {
      setError('Please select a day');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/weather_analysis/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: 'Portharcourt',
          country: 'Nigeria',
          days: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch weather: ${response.statusText}`);
      }

      const data = await response.json();
      setWeatherData(data);
      setLocation(`${data.location.city}, ${data.location.country}`);
      
      // Generate scheduled activities after fetching weather
      if (uploadedFile) {
        generateSchedule(data);
      }
    } catch (err) {
      setError(`Error fetching weather: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate activity schedule
  const generateSchedule = async (weatherData) => {
    if (!uploadedFile) {
      setError('Please upload an activity plan first');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        
        // Create FormData for binary file
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('weather_data', JSON.stringify(weatherData));
        formData.append('day', selectedDay);

        // For now, just send a text-based request with the file content
        const fileContent = await uploadedFile.text();
        
        const response = await fetch('http://localhost:5000/api/weather_analysis/schedule-activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: location,
            activities: fileContent.split('\n').filter(line => line.trim()),
            weather_data: weatherData.location ? {
              location: weatherData.location,
              forecasts: weatherData.daily_summaries ? weatherData.daily_summaries[0].hourly_forecasts || [] : []
            } : weatherData,
            farming_recommendations: weatherData.farming_recommendations || []
          })
        });

        if (response.ok) {
          const data = await response.json();
          setScheduledActivities(data.scheduling_advice || fileContent);
        }
      };
      reader.readAsText(uploadedFile);
    } catch (err) {
      setError(`Error generating schedule: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle chat
  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !scheduledActivities) {
      setError('Please generate a schedule first');
      return;
    }

    const userMsg = { sender: 'user', text: chatInput };
    setChatHistory([...chatHistory, userMsg]);
    setChatInput('');
    setLoading(true);

    try {
      const historyText = chatHistory.map(msg => `${msg.sender === 'user' ? 'User' : 'Expert'}: ${msg.text}`).join('\n');
      
      const response = await fetch('http://localhost:5000/api/weather_analysis/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location,
          message: chatInput,
          history: historyText,
          weather_data: weatherData || {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { sender: 'assistant', text: data.response }]);
      }
    } catch (err) {
      setError(`Chat error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-main-container">
      {/* SIDEBAR */}
      <aside className="weather-sidebar">
        <div className="sidebar-image">
          <img src="https://via.placeholder.com/300x200?text=Weather+Image" alt="weather" />
        </div>

        <div className="sidebar-divider"></div>

        {/* File Upload */}
        <div className="sidebar-section">
          <label>📁 Upload your activity plan</label>
          <div className="file-upload">
            <input
              type="file"
              accept=".docx"
              onChange={handleFileUpload}
              id="file-input"
              style={{ display: 'none' }}
            />
            <button 
              className="browse-btn"
              onClick={() => document.getElementById('file-input').click()}
            >
              Browse files
            </button>
            {uploadedFile && (
              <p className="file-name">✓ {uploadedFile.name}</p>
            )}
          </div>
        </div>

        <div className="sidebar-divider"></div>

        {/* Date Selector */}
        <div className="sidebar-section">
          <label>📅 When would you like to schedule for?</label>
          <select 
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="date-select"
          >
            <option value="Today">Today</option>
            <option value="Tommorrow">Tomorrow</option>
            <option value="2 days">2 days</option>
            <option value="3 days">3 days</option>
            <option value="4 days">4 days</option>
          </select>
          <button 
            className="fetch-btn"
            onClick={fetchWeather}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Weather & Schedule'}
          </button>
        </div>

        <div className="sidebar-divider"></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="weather-main-content">
        <div className="weather-header">
          <h1>🌤️ Weather Prediction Model</h1>
          <p className="weather-subtitle">Your activity schedule assistant</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Weather Metrics */}
        {weatherData && (
          <div className="weather-metrics">
            <div className="metric-card">
              <div className="metric-value">
                {weatherData.daily_summaries?.[0]?.temp_avg?.toFixed(1) || '--'} °C
              </div>
              <div className="metric-label">Temperature</div>
              <div className="metric-desc">
                {weatherData.daily_summaries?.[0]?.conditions?.join(', ') || 'N/A'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {weatherData.daily_summaries?.[0]?.humidity_avg?.toFixed(0) || '--'} %
              </div>
              <div className="metric-label">Humidity</div>
              <div className="metric-desc">4%</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {weatherData.daily_summaries?.[0]?.wind_speed_avg?.toFixed(2) || '--'} mph
              </div>
              <div className="metric-label">Windspeed</div>
              <div className="metric-desc">-8%</div>
            </div>

            <div className="metric-card">
              <div className="metric-value">
                {weatherData.daily_summaries?.[0]?.temp_max?.toFixed(0) || '--'}
              </div>
              <div className="metric-label">Pressure</div>
            </div>
          </div>
        )}

        {/* Activity Board */}
        <div className="activity-board">
          <h2>📋 Scheduled Activity Board</h2>

          {scheduledActivities && (
            <>
              <textarea
                className="activity-textarea"
                value={scheduledActivities}
                readOnly
                placeholder="Schedule will appear here..."
              />

              {/* Chat Section */}
              <div className="chat-section">
                <div className="chat-messages">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble ${msg.sender}`}>
                      <strong>{msg.sender === 'user' ? 'You' : 'Schedule Assistant'}:</strong>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleChat} className="chat-form">
                  <input
                    type="text"
                    placeholder="Ask me a question. e.g what activity is scheduled for 2pm"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={loading || !scheduledActivities}
                  />
                  <button type="submit" disabled={loading || !chatInput.trim()}>
                    Send
                  </button>
                </form>
              </div>
            </>
          )}

          {!scheduledActivities && !error && (
            <div className="placeholder">
              <p>📁 Upload an activity plan and select a date to get started</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WeatherAnalysis;

