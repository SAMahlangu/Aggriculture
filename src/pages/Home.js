import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import aiImage from '../assets/images/soilAnalysis.jpg';

const Home = () => {
    const features = [
        {
            icon: '🌾',
            title: 'Smart Farming',
            description: 'Leverage AI and machine learning to make data-driven decisions for better crop management'
        },
        {
            icon: '🔬',
            title: 'Advanced Analytics',
            description: 'Real-time sensor data analysis and comprehensive environmental monitoring'
        },
        {
            icon: '🚀',
            title: 'Innovation',
            description: 'Cutting-edge technology solutions for modern agriculture challenges'
        },
        {
            icon: '📊',
            title: 'Data Insights',
            description: 'Predictive analytics for yield optimization and resource management'
        }
    ];

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Welcome to AI Agriculture</h1>
                    <p>Transforming Farming with Artificial Intelligence</p>
                    <p className="hero-description">Discover innovative AI-powered solutions designed to revolutionize agriculture. From soil analysis to disease detection, we're bringing the future of farming to today.</p>
                    <Link to="/projects" className="cta-button">Explore Our Projects</Link>
                </div>
                <div className="hero-image">
                    <img src={aiImage} alt="Agriculture AI" />
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2>Why Choose AI Agriculture?</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Projects Preview Section */}
            <section className="projects-preview-section">
                <div className="preview-content">
                    <h2>Our Agriculture Projects</h2>
                    <p>We've developed a comprehensive suite of AI-powered solutions to address modern agricultural challenges:</p>
                    <ul className="projects-list">
                        <li><strong>Soil Quality Analysis</strong> - AI-powered assessment with real-time sensor data</li>
                        <li><strong>Disease Detection</strong> - Early crop disease identification using computer vision</li>
                        <li><strong>Yield Prediction</strong> - Forecast crop yield based on environmental factors</li>
                        <li><strong>Nutrient Deficiency</strong> - Identify and manage plant nutrient issues</li>
                        <li><strong>Pest Management</strong> - Intelligent pest detection and recommendations</li>
                        <li><strong>Animal Counting</strong> - Automated livestock management</li>
                        <li><strong>And More...</strong> - Additional specialized solutions for agricultural needs</li>
                    </ul>
                    <Link to="/projects" className="cta-button secondary">View All Projects</Link>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section">
                <h2>Ready to Transform Your Farm?</h2>
                <p>Explore our projects and discover how AI can improve your agricultural operations</p>
                <Link to="/projects" className="cta-button primary">Get Started</Link>
            </section>
        </div>
    );
};

export default Home;
