import React, { useRef, useState } from 'react';
import '../Agriculture.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function SoilClassification() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImage(file);
    setResult(null);
    setChatResponse('');
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleClassify = async () => {
    if (!image) {
      setError('Please choose a soil image first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch(`${API_BASE_URL}/api/soil_classification/classify`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Classification failed');
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!result || !message.trim()) return;

    setChatLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/soil_classification/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soil_type: result.soil_type,
          message
        })
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Could not get advice');
      }

      setChatResponse(data.response);
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="project-container">
      <div className="project-header">
        <h1>Soil Classification</h1>
        <p>Upload a soil image to identify the soil type and get farming guidance.</p>
      </div>

      <div className="project-layout">
        <div className="project-card">
          <h2 className="project-card-title">Upload Soil Image</h2>

          <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImageChange}
            />
            <p>{image ? image.name : 'Choose a JPG or PNG soil image'}</p>
          </div>

          {preview && (
            <img src={preview} alt="Selected soil" className="image-preview" />
          )}

          <button className="btn btn-primary" onClick={handleClassify} disabled={loading}>
            {loading ? 'Classifying...' : 'Classify Soil'}
          </button>

          {error && <div className="alert alert-error">{error}</div>}
        </div>

        <div className="project-card">
          <h2 className="project-card-title">Result & Advice</h2>

          {!result && (
            <div className="alert alert-info">
              Classification results will appear here after you upload an image.
            </div>
          )}

          {result && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Soil Type</div>
                  <div className="stat-value">{result.soil_type}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Confidence</div>
                  <div className="stat-value">{result.confidence}%</div>
                </div>
              </div>

              <div className="results-box">
                <h3>Soil Information</h3>
                <p>{result.info.description}</p>

                <h3>Good Crops</h3>
                <p>{result.info.good_crops.length ? result.info.good_crops.join(', ') : 'No crop list available.'}</p>

                <h3>Avoid</h3>
                <p>{result.info.avoid.length ? result.info.avoid.join(', ') : 'No specific avoid list available.'}</p>

                <h3>Improvement</h3>
                <p>{result.info.improvement}</p>
              </div>

              <div className="form-group">
                <label>Ask the farming assistant</label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="For example: What should I plant in this soil?"
                />
              </div>

              <button
                className="btn btn-secondary"
                onClick={handleAsk}
                disabled={chatLoading || !message.trim()}
              >
                {chatLoading ? 'Thinking...' : 'Get Farming Advice'}
              </button>

              {chatResponse && (
                <div className="results-box">
                  <h3>Farming Advice</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{chatResponse}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SoilClassification;
