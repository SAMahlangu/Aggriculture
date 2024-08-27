import React from 'react';
import './Home.css';
import aiImage from '../assets/images/homePicture.jpg'; // Replace with your AI image

const Home = () => {
    return (
        <div className="home-container">
            <div className="image-container">
                <img src={aiImage} alt="AI" />
            </div>
            <div className="text-container">
                <h1>Welcome to Our Health Projects</h1>
                <p>
                    Explore our cutting-edge health projects powered by Artificial Intelligence. From disease detection to health monitoring, our projects aim to improve healthcare outcomes using advanced AI and machine learning techniques.
                </p>
            </div>
        </div>
    );
};

export default Home;
