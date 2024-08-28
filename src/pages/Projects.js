import React from 'react';
import './Projects.css';
import project1 from '../assets/images/damaged_leaves_1920x870.jpg';
import project2 from '../assets/images/plants.jpg';
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
                    <a href="http://16.171.4.56/" target="_blank" rel="noopener noreferrer">
                        <img src={project1} alt="Project 1" />
                    </a>
                    <h2>Plant Disease Detection</h2>
                </div>
                <div className="project-item">
                    <a href="http://13.61.4.203/" target="_blank" rel="noopener noreferrer">
                        <img src={project2} alt="Project 2" />
                    </a>
                    <h2>Plant Species Detection</h2>
                </div>
                <div className="project-item">
                    <a href="http://16.171.193.38/" target="_blank" rel="noopener noreferrer">
                        <img src={project3} alt="Project 3" />
                    </a>
                    <h2>Plant Nutrient Difficiency</h2>
                </div>
                <div className="project-item">
                    <a href="http://16.171.36.0/" target="_blank" rel="noopener noreferrer">
                        <img src={project4} alt="Project 4" />
                    </a>
                    <h2>Weeds Detection</h2>
                </div>
            </div>
		<div className="projects-grid">
	                <div className="project-item">
	                    <a href="https://huggingface.co/spaces/mdalakeys/diabeticsRec" target="_blank" rel="noopener noreferrer">
                        	<img src={project5} alt="Project 5" />
                	    </a>
        	            <h2>Animal Count</h2>
	                </div>
			<div className="project-item">
	                    <a href="http://16.171.137.44/" target="_blank" rel="noopener noreferrer">
                        	<img src={project6} alt="Project 6" />
                	    </a>
        	            <h2>Soil Analysis</h2>
	                </div>
			<div className="project-item">
	                    <a href="https://huggingface.co/spaces/mdalakeys/diabeticsRec" target="_blank" rel="noopener noreferrer">
                        	<img src={project7} alt="Project 5" />
                	    </a>
        	            <h2>Irrigation Analysis</h2>
	                </div>
			<div className="project-item">
	                    <a href="http://fish-farming-chatbot.onrender.com/" target="_blank" rel="noopener noreferrer">
                        	<img src={project8} alt="Project 5" />
                	    </a>
        	            <h2>Aquaculture</h2>
	                </div>	
	        </div>
        </div>
    );
};

export default Projects;
