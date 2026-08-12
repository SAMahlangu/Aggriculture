import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const WaterQuality = () => {
    const [formData, setFormData] = useState({
        ph: '',
        Hardness: '',
        Solids: '',
        Chloramines: '',
        Sulfate: '',
        Conductivity: '',
        Organic_carbon: '',
        Trihalomethanes: '',
        Turbidity: ''
    });

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [chatMessage, setChatMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatContainerRef = useRef(null);
    const [recommendations, setRecommendations] = useState(null);
    const [apiStatus, setApiStatus] = useState('checking');

    // Try both localhost and 127.0.0.1
    const API_BASES = [
        'http://localhost:5000/api/water_quality_analysis',
        'http://127.0.0.1:5000/api/water_quality_analysis'
    ];

    // Check API status on component mount
    useEffect(() => {
        checkApiStatus();
    }, []);

    const checkApiStatus = async () => {
        for (const baseUrl of API_BASES) {
            try {
                const response = await fetch(`${baseUrl}/health`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    setApiStatus(`connected to ${baseUrl}`);
                    console.log('✓ Connected to API:', baseUrl);
                    return;
                }
            } catch (err) {
                console.log(`✗ Could not connect to ${baseUrl}:`, err.message);
            }
        }
        
        setApiStatus('disconnected');
        setError('⚠️ Backend API is not running. Please start the Flask server on port 5000.');
    };

    // Scroll to bottom of chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPrediction(null);
        setRecommendations(null);

        // Try each API base URL
        for (const API_BASE of API_BASES) {
            try {
                const response = await fetch(`${API_BASE}/predict`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData),
                    mode: 'cors'
                });

                if (!response.ok) {
                    console.error(`API returned ${response.status}:`, response.statusText);
                    continue;
                }

                const data = await response.json();

                if (data.success) {
                    setPrediction({
                        result: data.potable ? 'Good for Irrigation' : 'Not Suitable for Irrigation',
                        potable: data.potable,
                        confidence: (data.confidence * 100).toFixed(2)
                    });
                    setRecommendations(data.recommendations);
                    setApiStatus(`connected to ${API_BASE}`);
                    setLoading(false);
                    return;
                } else {
                    setError(data.error || 'Prediction failed');
                }
            } catch (err) {
                console.error(`Error connecting to ${API_BASE}:`, err.message);
                continue;
            }
        }

        setError('⚠️ Failed to connect to backend. Make sure the Flask server is running on port 5000.');
        setLoading(false);
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        // Add user message to chat history
        const userMessage = { role: 'user', text: chatMessage };
        setChatHistory(prev => [...prev, userMessage]);
        const currentMessage = chatMessage;
        setChatMessage('');
        setChatLoading(true);

        // Try each API base URL
        for (const API_BASE of API_BASES) {
            try {
                const response = await fetch(`${API_BASE}/chatbot`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        info: formData,
                        history: chatHistory.map(msg => `${msg.role}: ${msg.text}`).join('\n'),
                        message: currentMessage
                    }),
                    mode: 'cors'
                });

                if (!response.ok) {
                    console.error(`Chatbot API returned ${response.status}`);
                    continue;
                }

                const data = await response.json();

                if (data.success) {
                    const botMessage = { role: 'assistant', text: data.response };
                    setChatHistory(prev => [...prev, botMessage]);
                    setApiStatus(`connected to ${API_BASE}`);
                    setChatLoading(false);
                    return;
                } else {
                    const errorMessage = { role: 'assistant', text: 'Error: ' + (data.error || 'Failed to get response') };
                    setChatHistory(prev => [...prev, errorMessage]);
                }
            } catch (err) {
                console.error(`Chatbot error with ${API_BASE}:`, err.message);
                continue;
            }
        }

        const errorMessage = { role: 'assistant', text: '⚠️ Connection error. Please make sure the backend is running.' };
        setChatHistory(prev => [...prev, errorMessage]);
        setChatLoading(false);
    };

    const parameters = [
        { name: 'ph', label: 'pH', placeholder: 'Enter pH level (0-14)' },
        { name: 'Hardness', label: 'Hardness', placeholder: 'Enter hardness value' },
        { name: 'Solids', label: 'Total Dissolved Solids', placeholder: 'Enter solids value' },
        { name: 'Chloramines', label: 'Chloramines', placeholder: 'Enter chloramines level' },
        { name: 'Sulfate', label: 'Sulfate', placeholder: 'Enter sulfate level' },
        { name: 'Conductivity', label: 'Conductivity', placeholder: 'Enter conductivity' },
        { name: 'Organic_carbon', label: 'Organic Carbon', placeholder: 'Enter organic carbon' },
        { name: 'Trihalomethanes', label: 'Trihalomethanes', placeholder: 'Enter trihalomethanes' },
        { name: 'Turbidity', label: 'Turbidity', placeholder: 'Enter turbidity level' }
    ];

    return (
        <div className="water-quality-container">
            <div className="water-quality-left">
                <form onSubmit={handlePredict} className="water-quality-form">
                    <h2>Water Quality Parameters</h2>
                    
                    <div className="form-grid">
                        {parameters.map(param => (
                            <div key={param.name} className="form-group">
                                <label htmlFor={param.name}>{param.label}</label>
                                <input
                                    type="number"
                                    id={param.name}
                                    name={param.name}
                                    placeholder={param.placeholder}
                                    value={formData[param.name]}
                                    onChange={handleInputChange}
                                    step="0.00001"
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <button type="submit" disabled={loading || apiStatus === 'checking'} className="btn-predict">
                        {loading ? 'Analyzing...' : 'Predict Water Quality'}
                    </button>

                    {error && <div className="error-message">{error}</div>}

                    {prediction && (
                        <div className={`prediction-result ${prediction.potable ? 'potable' : 'not-potable'}`}>
                            <h3>Prediction Result</h3>
                            <p className="result-text">{prediction.result}</p>
                            <p className="confidence">Confidence: {prediction.confidence}%</p>
                            
                            {recommendations && (
                                <div className="recommendations">
                                    <h4>Status: {recommendations.status}</h4>
                                    <ul>
                                        {recommendations.suggestions.map((suggestion, idx) => (
                                            <li key={idx}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </div>

            <div className="water-quality-right">
                <div className="chat-section">
                    <h2>Water Quality Expert</h2>
                    <div className="chat-container" ref={chatContainerRef}>
                        {chatHistory.length === 0 ? (
                            <div className="empty-chat">
                                <p>Ask the water quality expert any questions about your irrigation water.</p>
                            </div>
                        ) : (
                            chatHistory.map((msg, idx) => (
                                <div key={idx} className={`chat-message ${msg.role}`}>
                                    <div className="message-content">{msg.text}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleChatSubmit} className="chat-input-form">
                        <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Ask about water quality..."
                            disabled={chatLoading || apiStatus === 'checking'}
                        />
                        <button type="submit" disabled={chatLoading || !chatMessage.trim() || apiStatus === 'checking'}>
                            {chatLoading ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WaterQuality;
