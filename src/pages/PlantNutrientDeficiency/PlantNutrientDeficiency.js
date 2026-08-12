import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PlantNutrientDeficiency() {
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
      detectDeficiency(file);
    }
  };

  const detectDeficiency = (file) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    fetch(`${API_BASE_URL}/api/plant_nutrient_deficiency/detect`, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        setDetectionResult(data);
        setMessages([{sender: 'bot', text: `Detected: ${data.deficiency} (Confidence: ${(data.confidence * 100).toFixed(2)}%)`}]);
      }
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error detecting deficiency:', error);
      setIsLoading(false);
    });
  };

  const handleSendMessage = () => {
    if (!detectionResult || !userInput.trim()) return;

    setIsChatLoading(true);
    const newMessage = { sender: 'user', text: userInput };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    const history = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');

    fetch(`${API_BASE_URL}/api/plant_nutrient_deficiency/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deficiency: detectionResult.deficiency,
        question: userInput,
        history: history
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isChatLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className="plant-nutrient-wrapper">
      <div className="container-fluid h-100">
        <h1 className="text-center">Plant Nutrient Deficiency Detection</h1>

        <div className='row h-100'>
          {/* Chat and Results Section */}
          <div className='col-md-6 p-4 d-flex flex-column justify-content-between'>
            <div>
              <h2 className='text-center'>Chat Bot</h2>
              <div className="chatbox border rounded bg-white">
                {messages.map((message, index) => (
                  <div key={index} className={`mb-3 ${message.sender === 'user' ? 'text-end' : ''}`}>
                    <div className={`p-2 rounded ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}>
                      {typeof message.text === 'string' ? (
                        message.text
                      ) : Array.isArray(message.text) ? (
                        message.text.join(', ')
                      ) : (
                        JSON.stringify(message.text)
                      )}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className='d-flex justify-content-center'>
                    <div className='spinner-border' role='status'>
                      <span className='sr-only'></span>
                    </div>
                    Processing your message
                  </div>
                )}
              </div>
            </div>

            {detectionResult && (
              <div className='mt-3 d-flex'>
                <input 
                  type='text' 
                  className='form-control' 
                  placeholder='Ask about this deficiency...' 
                  value={userInput} 
                  onChange={(event) => setUserInput(event.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isChatLoading} 
                />
                <button 
                  className='btn btn-primary' 
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !userInput.trim()}
                >
                  Send
                </button>
              </div>
            )}
          </div>

          {/* Image Upload and Detection Results Section */}
          <div className='col-md-6 p-4'>
            <h2 className='text-center'>Image Detection</h2>
            
            <div className='upload-section border rounded p-3 mb-4'>
              <div className='upload-box text-center p-4 border-2 border-dashed'>
                <input 
                  type='file' 
                  id='imageInput' 
                  accept='image/*' 
                  onChange={handleImageUpload}
                  disabled={isLoading}
                  style={{ display: 'none' }}
                />
                <label htmlFor='imageInput' style={{ cursor: 'pointer', display: 'block' }}>
                  <div>
                    <p>📸 Click or drag image here</p>
                    <small>Supports JPG, PNG, BMP formats</small>
                  </div>
                </label>
              </div>

              {isLoading && (
                <div className='d-flex justify-content-center mt-3'>
                  <div className='spinner-border' role='status'>
                    <span className='sr-only'></span>
                  </div>
                  Analyzing Image...
                </div>
              )}

              {selectedImage && (
                <div className='mt-3'>
                  <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt='Selected' 
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '5px' }}
                  />
                </div>
              )}
            </div>

            {detectionResult && (
              <div className='detection-results border rounded p-3 bg-light'>
                <h4>Detection Results</h4>
                <div className='result-item mb-2'>
                  <strong>Deficiency Detected:</strong> {detectionResult.deficiency}
                </div>
                <div className='result-item mb-2'>
                  <strong>Confidence:</strong> {(detectionResult.confidence * 100).toFixed(2)}%
                </div>
                {detectionResult.analysis && (
                  <div className='result-item'>
                    <strong>AI Analysis:</strong>
                    <p className='mt-2'>{detectionResult.analysis}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlantNutrientDeficiency;
