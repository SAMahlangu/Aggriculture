/* Updated CropDisease Component */
import React, { useState } from 'react';
import '../Agriculture.css';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function CropDisease() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [detectionResult, setDetectionResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      detectDisease(file);
    }
  };

  const detectDisease = (file) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    fetch(`${API_BASE_URL}/api/crop_disease_detection/upload`, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.error) {
          setMessages([{ sender: 'bot', text: `⚠️ Error: ${data.error}` }]);
        } else {
          setDetectionResult(data);
          const diseaseLabel = data.label || data.detected_diseases?.join(', ') || 'Disease detected';
          setMessages([{ sender: 'bot', text: `🔍 Detected: ${diseaseLabel}` }]);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error detecting disease:', error);
        setMessages([{ sender: 'bot', text: '❌ Error analyzing image. Please try again.' }]);
        setIsLoading(false);
      });
  };

  const handleSendMessage = () => {
    if (!detectionResult || !userInput.trim()) return;

    setIsChatLoading(true);
    const newMessage = { sender: 'user', text: userInput };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    const history = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');

    fetch(`${API_BASE_URL}/api/crop_disease_detection/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userInput,
        chatHistory: history
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        const botMessage = { sender: 'bot', text: data.response || 'No response' };
        setMessages(prevMessages => [...prevMessages, botMessage]);
        setUserInput('');
        setIsChatLoading(false);
      })
      .catch(error => {
        console.error('Chat error:', error);
        setIsChatLoading(false);
      });
  };

  return (
    <div className="project-container">
      <div className="project-header">
        <h1>🌿 Crop Disease Detection</h1>
        <p>AI-Powered Disease Identification & Treatment</p>
      </div>

      <div className="project-layout">
        {/* Upload Section */}
        <div className="project-card">
          <div className="project-card-title">📸 Upload Leaf Image</div>

          <div className="upload-area" onClick={() => document.getElementById('image-input').click()}>
            {selectedImage ? (
              <>
                <p style={{ fontSize: '2rem' }}>✅</p>
                <p><strong>{selectedImage.name}</strong></p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Click to change image</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '2rem' }}>📤</p>
                <p><strong>Click to upload</strong></p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>or drag and drop</p>
              </>
            )}
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isLoading}
            />
          </div>

          {isLoading && (
            <div className="loading-spinner">
              <div className="spinner"></div> Analyzing image...
            </div>
          )}

          {selectedImage && (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Selected"
              className="image-preview"
            />
          )}
        </div>

        {/* Results Section */}
        {detectionResult && (
          <div className="project-card">
            <div className="project-card-title">📊 Detection Results</div>

            <div className="results-box">
              <h3>🔍 Detected Disease</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2d6a4f', marginTop: '0.5rem' }}>
                {detectionResult.label || detectionResult.detected_diseases?.join(', ') || 'Unknown'}
              </p>

              {detectionResult.confidence && (
                <>
                  <h3>📈 Confidence</h3>
                  <div style={{
                    width: '100%',
                    height: '20px',
                    background: '#e0e0e0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{
                      width: `${detectionResult.confidence * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #2d6a4f, #40916c)',
                      transition: 'width 0.3s'
                    }}></div>
                  </div>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {(detectionResult.confidence * 100).toFixed(1)}%
                  </p>
                </>
              )}

              {detectionResult.description && (
                <>
                  <h3>📝 Description</h3>
                  <p>{detectionResult.description}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Chat Section */}
        <div className="project-card full-row">
          <div className="project-card-title">💬 Ask Expert Questions</div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              background: 'var(--light-bg)',
              borderRadius: '8px',
              padding: '1rem',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {messages.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center' }}>
                  Upload an image and ask questions about the disease...
                </p>
              ) : (
                messages.map((message, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: message.sender === 'user' ? '#40916c' : 'white',
                    color: message.sender === 'user' ? 'white' : '#1b3a1b',
                    border: message.sender === 'bot' ? '1px solid #ddd' : 'none',
                    alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    wordWrap: 'break-word'
                  }}>
                    {message.text}
                  </div>
                ))
              )}
            </div>

            {detectionResult && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Ask a question about the disease..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    transition: 'border-color 0.3s'
                  }}
                  disabled={isChatLoading}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !userInput.trim()}
                >
                  {isChatLoading ? '⏳' : '📤'} Send
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CropDisease;
