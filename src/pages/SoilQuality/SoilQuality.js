import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function SoilQuality() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [sensorData, setSensorData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    const intervalID = setInterval(() => {
      setIsLoading(true);
      fetch(`${API_BASE_URL}/api/soil_quality_analysis/get_sensor_data`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setSensorData(prevData => [...prevData, data]);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching sensor data:', error);
        setIsLoading(false);
      });
  }, 10000);

  return () => clearInterval(intervalID);
  }, []);

  const handleSendMessage = (customPayload) => {
    setIsChatLoading(true);

    const payload = customPayload || {
      message: userInput,
      history: messages,
      first_message: false
    };
    if (!customPayload) {
      setMessages(prevMessages => [...prevMessages, {sender: 'user', text: userInput}]);
    }

    fetch(`${API_BASE_URL}/api/soil_quality_analysis/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // Extract the response text from the data object
      const responseText = typeof data === 'string' ? data : (data.response || JSON.stringify(data));
      setMessages(prevMessages => [...prevMessages, {sender: 'bot', text: responseText}]);
      setUserInput('');
      setIsChatLoading(false);
    })
    .catch(error => {
      console.log(error);
      setIsChatLoading(false);
      console.log(payload);
    });

  }

  const handleInfoClick = (data) => {
    const message = data;
    let jsonString = JSON.stringify(data);

    const newMessages = [{sender: 'user', text: message}];

    setMessages(newMessages);
    setUserInput(jsonString);
    handleSendMessage({
      message: jsonString,
      history: newMessages,
      first_message: true
    });
  };


  return (
    <div className="soil-quality-wrapper">
      <div className="container-fluid h-100">
        
        <h1 className="text-center">Soil Quality Analysis</h1>

        
        <div className='row h-100'>

          <div className='col-md-6 p-4 d-flex flex-column justify-content-between'>
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
            <div className='mt-3 d-flex'>
              <input type='text' className='form-control' placeholder='Type a message...' value={userInput} onChange={(event) => setUserInput(event.target.value)} disabled={isChatLoading} />
              <button className='btn btn-primary' onClick={() => handleSendMessage() } disabled={isChatLoading}>Send</button>
            </div>
          </div>

          <div className='col-md-6 p-4'>
            <h2 className='text-center'>Sensor Data</h2>
            <ul className='sensor-data-list'>
              {isLoading && (
                <div className='d-flex justify-content-center'>
                  <div className='spinner-border' role='status'>
                    <span className='sr-only'></span>
                  </div>
                  Fetching Sensor Data
                </div>
              )}
              {sensorData.map((data, index) => (
                <li key={index} className='sensor-data-list-item'>
                  <div className='sensor-data-details'>
                    {Object.entries(data).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {value}
                      </div>
                    
                    ))}
                  </div>
                  <button className='btn btn-secondary btn-sm' onClick={()=>handleInfoClick(data)}> Analyze </button>
                  </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SoilQuality;