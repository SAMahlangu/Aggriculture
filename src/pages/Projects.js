import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Projects.css';
import project1 from '../assets/images/damaged_leaves_1920x870.jpg';
import project3 from '../assets/images/Plant-nutrients.jpg';
import project4 from '../assets/images/weed.jpg';
import project5 from '../assets/images/pigsCount.jpg';
import project6 from '../assets/images/soilAnalysis.jpg';
import project7 from '../assets/images/irrigation.jpg';
import project8 from '../assets/images/Plant-nutrients.jpg';
import project9 from '../assets/images/drought.jpg';
import project10 from '../assets/images/soilAnalysis.jpg';

const Projects = () => {
    const [selectedProject, setSelectedProject] = useState(0);

    const projectsList = [
        {
            id: 0,
            name: 'Crop Disease Detection',
            image: project1,
            description: 'Detect and identify crop diseases using advanced AI and image recognition technology. Our system analyzes plant leaves to identify potential diseases early.',
            link: '/crop-disease',
            features: ['Real-time detection', 'High accuracy', 'Disease classification', 'Treatment recommendations']
        },
        {
            id: 1,
            name: 'Soil Analysis',
            image: project6,
            description: 'Comprehensive soil quality analysis to optimize agricultural productivity. Analyze soil composition, nutrients, and pH levels.',
            link: '/soil-analysis',
            features: ['Nutrient analysis', 'pH testing', 'Soil composition', 'Recommendations']
        },
        {
            id: 2,
            name: 'Plant Nutrient Deficiency',
            image: project3,
            description: 'Identify and address nutrient deficiencies in plants. Get personalized recommendations for nutrient supplementation.',
            link: '/plant-nutrient-deficiency',
            features: ['Visual analysis', 'Deficiency detection', 'Treatment plans', 'Growth optimization']
        },
        {
            id: 3,
            name: 'Weeds Detection',
            image: project4,
            description: 'Identify and classify weeds in your crops. Automated detection system helps farmers manage weed growth effectively.',
            link: '/weeds-detection',
            features: ['Weed identification', 'Real-time detection', 'Treatment options', 'Prevention tips']
        },
        {
            id: 4,
            name: 'Drought Analysis',
            image: project9,
            description: 'Monitor and analyze drought conditions affecting your fields. Predict water needs and optimize irrigation strategies.',
            link: '/drought-analysis',
            features: ['Water stress detection', 'Prediction models', 'Irrigation planning', 'Risk assessment']
        },
        {
            id: 5,
            name: 'Crop Yield Prediction',
            image: project6,
            description: 'Predict crop yields based on various environmental and agricultural factors. Plan harvests more effectively.',
            link: '/crop-yield-prediction',
            features: ['Yield forecasting', 'Factor analysis', 'Historical data', 'Market insights']
        },
        {
            id: 6,
            name: 'Animal Count',
            image: project5,
            description: 'Count and monitor livestock using computer vision technology. Track animal populations and health indicators.',
            link: '/animal-count',
            features: ['Real-time counting', 'Population tracking', 'Health monitoring', 'Data logging']
        },
        {
            id: 7,
            name: 'Plant Identification',
            image: project8,
            description: 'Identify plant species and varieties using AI-powered image recognition. Learn about different plant characteristics.',
            link: '/plant-identification',
            features: ['Species identification', 'Variety classification', 'Plant info', 'Growing guides']
        },
        {
            id: 8,
            name: 'Water Quality Analysis',
            image: project6,
            description: 'Analyze water quality parameters to assess suitability for irrigation. Get AI-powered recommendations for water treatment and crop compatibility.',
            link: '/water-quality',
            features: ['Water potability assessment', 'Parameter analysis', 'Treatment recommendations', 'Expert consultation']
        },
        {
            id: 9,
            name: 'Irrigation Prediction',
            image: project7,
            description: 'Smart irrigation prediction system using AI to determine optimal irrigation levels based on soil, weather, and crop data. Reduce water waste and maximize crop yield.',
            link: '/irrigation-prediction',
            features: ['XGBoost prediction', 'Real-time analysis', 'AI recommendations', 'Water optimization']
        },
        {
            id: 10,
            name: 'Chicken Disease Detection',
            image: project5,
            description: 'AI-powered system to detect chicken diseases (Favus, Fowl Pox, Coryza, CRD) and get veterinary advice. Monitor flock health with precision.',
            link: '/chicken-disease',
            features: ['Disease detection', 'Health tracking', 'AI vet advice', 'Flock monitoring']
        },
        {
            id: 11,
            name: 'Soil Classification',
            image: project10,
            description: 'Classify soil type from an uploaded image and get crop, watering, fertilizer, and soil improvement advice.',
            link: '/soil-classification',
            features: ['Image classification', 'Soil type confidence', 'Crop guidance', 'AI farming advice']
        }
    ];

    const current = projectsList[selectedProject];

    return (
        <div className="projects-layout">
            {/* Sidebar */}
            <div className="projects-sidebar">
                <h2>Projects</h2>
                <div className="sidebar-list">
                    {projectsList.map((project, index) => (
                        <div
                            key={index}
                            className={`sidebar-item ${selectedProject === index ? 'active' : ''}`}
                            onClick={() => setSelectedProject(index)}
                        >
                            <h3>{project.name}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="projects-main">
                {current.external ? (
                    <a href={current.url} target="_blank" rel="noopener noreferrer" className="project-link">
                        <div className="project-detail">
                            <img src={current.image} alt={current.name} className="project-detail-image" />
                            <h1>{current.name}</h1>
                            <p>{current.description}</p>
                            <div className="features-list">
                                <h3>Features:</h3>
                                <ul>
                                    {current.features.map((feature, idx) => (
                                        <li key={idx}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                            <button className="view-project-btn">Open Project</button>
                        </div>
                    </a>
                ) : (
                    <Link to={current.link} className="project-link">
                        <div className="project-detail">
                            <img src={current.image} alt={current.name} className="project-detail-image" />
                            <h1>{current.name}</h1>
                            <p>{current.description}</p>
                            <div className="features-list">
                                <h3>Features:</h3>
                                <ul>
                                    {current.features.map((feature, idx) => (
                                        <li key={idx}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                            <button className="view-project-btn">View Project</button>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Projects;
