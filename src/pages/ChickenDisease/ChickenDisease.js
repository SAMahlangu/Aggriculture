import React, { useState, useRef } from "react";
import axios from "axios";
import "../Agriculture.css";

const ChickenDiseaseDetection = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [diseases, setDiseases] = useState([]);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run detection
  const handleDetect = async () => {
    if (!image) {
      alert("Please upload an image first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", image);

      const response = await axios.post(
        "http://localhost:5000/api/chicken_disease/detect",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResults(response.data.data);
    } catch (error) {
      console.error("Detection error:", error);
      alert("Error detecting diseases: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get veterinary advice
  const handleChat = async () => {
    if (!chatMessage || !results) {
      alert("Please ask a question after detection");
      return;
    }

    try {
      const detectionSummary = Object.entries(results.disease_counts)
        .map(([disease, count]) => `${disease}: ${count}`)
        .join("\n");

      const response = await axios.post(
        "http://localhost:5000/api/chicken_disease/chat",
        {
          detection_summary: detectionSummary,
          message: chatMessage,
        }
      );

      setChatResponse(response.data.response);
    } catch (error) {
      console.error("Chat error:", error);
      alert("Error getting advice: " + error.message);
    }
  };

  return (
    <div className="project-container">
      <h1>🐔 Chicken Disease Detection</h1>
      <p>AI-powered system to detect chicken diseases and get veterinary advice</p>

      <div className="project-content">
        {/* Upload Section */}
        <div className="detection-section">
          <h2>Step 1: Upload Image</h2>
          <div className="upload-area">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: "none" }}
            />
            <button
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              📷 Choose Image
            </button>
            {preview && (
              <div className="preview-container">
                <img src={preview} alt="Preview" className="preview-image" />
                <p>Image ready for detection</p>
              </div>
            )}
          </div>
        </div>

        {/* Detection Section */}
        <div className="detection-section">
          <h2>Step 2: Detect Diseases</h2>
          <button
            className="btn-primary"
            onClick={handleDetect}
            disabled={!image || loading}
          >
            {loading ? "🔍 Detecting..." : "🔍 Detect Diseases"}
          </button>

          {results && (
            <div className="results-container">
              <h3>Detection Results</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <h4>Total Chickens</h4>
                  <p className="stat-value">{results.total_chickens}</p>
                </div>

                {Object.entries(results.disease_counts).map(([disease, count]) => (
                  <div
                    key={disease}
                    className={`stat-box ${
                      disease === "Normal" ? "healthy" : "disease"
                    }`}
                  >
                    <h4>{disease}</h4>
                    <p className="stat-value">{count}</p>
                  </div>
                ))}
              </div>

              <div className="detected-chickens">
                <h4>Individual Chickens</h4>
                {results.chickens && results.chickens.length > 0 ? (
                  <div className="chicken-list">
                    {results.chickens.map((chicken) => (
                      <div key={chicken.id} className="chicken-card">
                        <span className="chicken-id">ID: {chicken.id}</span>
                        <span
                          className={`disease-badge ${
                            chicken.disease === "Normal" ? "normal" : "affected"
                          }`}
                        >
                          {chicken.disease}
                        </span>
                        <span className="confidence">
                          Confidence: {(chicken.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No chickens detected</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat Section */}
        {results && (
          <div className="detection-section">
            <h2>Step 3: Get Veterinary Advice</h2>
            <div className="chat-box">
              <textarea
                placeholder="Ask a question about your chickens (e.g., 'What treatment should I use?')"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="chat-input"
              />
              <button className="btn-primary" onClick={handleChat}>
                💬 Get Advice
              </button>

              {chatResponse && (
                <div className="chat-response">
                  <h4>AI Veterinary Advice</h4>
                  <div className="advice-text">{chatResponse}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px;
        }

        .preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .preview-image {
          max-width: 300px;
          max-height: 300px;
          border-radius: 8px;
          border: 2px solid #ddd;
        }

        .results-container {
          margin-top: 20px;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin: 15px 0;
        }

        .stat-box {
          background: white;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid #2196f3;
        }

        .stat-box.healthy {
          border-left-color: #4caf50;
        }

        .stat-box.disease {
          border-left-color: #f44336;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin: 5px 0;
        }

        .detected-chickens {
          margin-top: 15px;
        }

        .chicken-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .chicken-card {
          background: white;
          padding: 12px;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border: 1px solid #ddd;
        }

        .chicken-id {
          font-weight: bold;
          font-size: 14px;
        }

        .disease-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }

        .disease-badge.normal {
          background: #c8e6c9;
          color: #2e7d32;
        }

        .disease-badge.affected {
          background: #ffcdd2;
          color: #c62828;
        }

        .confidence {
          font-size: 12px;
          color: #666;
        }

        .chat-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 15px;
        }

        .chat-input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          min-height: 80px;
          resize: vertical;
          font-family: Arial, sans-serif;
        }

        .chat-response {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 6px;
          margin-top: 10px;
          border-left: 4px solid #2196f3;
        }

        .advice-text {
          color: #333;
          line-height: 1.6;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
};

export default ChickenDiseaseDetection;
