import React from 'react';
import './Projects.css';
import project1 from '../assets/images/damaged_leaves_1920x870.jpg';

import project3 from '../assets/images/Plant-nutrients.jpg';
import project4 from '../assets/images/weed.jpg';
import project5 from '../assets/images/pigsCount.jpg';
import project6 from '../assets/images/soilAnalysis.jpg';
import project7 from '../assets/images/irrigation.jpg';
import project8 from '../assets/images/aquaculture.jpg';

const Projects = () => {
    return (
        <div className="projects-container">
            <div className="projects-grid">
                <div className="project-item">
                    <a href="http://13.60.217.200/" target="_blank" rel="noopener noreferrer">
                        <img src={project1} alt="Plant Disease Detection" />
                    </a>
                    <h2>Plant Disease Detection</h2>
                </div>
                <div className="project-item">
                    <a href="http://51.20.55.66/" target="_blank" rel="noopener noreferrer">
                        <img src={project6} alt="Soil Analysis" />
                    </a>
                    <h2>Soil Analysis</h2>
                </div>                
                <div className="project-item">
                    <a href="http://13.60.83.241/" target="_blank" rel="noopener noreferrer">
                        <img src={project3} alt="Plant Nutrient Deficiency" />
                    </a>
                    <h2>Plant Nutrient Deficiency</h2>
                </div>
                <div className="project-item">
                    <a href="http://16.170.245.176/" target="_blank" rel="noopener noreferrer">
                        <img src={project4} alt="Weeds Detection" />
                    </a>
                    <h2>Weeds Detection</h2>
                </div>
            </div>
            <div className="projects-grid">
                <div className="project-item">
                    <a href="http://13.51.172.144/" target="_blank" rel="noopener noreferrer">
                        <img src={project5} alt="Animal Count" />
                    </a>
                    <h2>Animal Count</h2>
                </div>
                <div className="project-item">
                    <a href="http://fish-farming-chatbot.onrender.com/" target="_blank" rel="noopener noreferrer">
                        <img src={project8} alt="Aquaculture" />
                    </a>
                    <h2>Aquaculture</h2>
                </div>
                <div className="project-item">
                    <a href="http://13.60.23.40/" target="_blank" rel="noopener noreferrer">
                        <img src={project7} alt="Irrigation Analysis" />
                    </a>
                    <h2>Irrigation Analysis</h2>
                </div>
                    
            </div>
        </div>
    );
};

export default Projects;
