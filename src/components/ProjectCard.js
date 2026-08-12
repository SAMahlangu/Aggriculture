import React from 'react';

function ProjectCard({ title, description, image, badge, buttonText, onButtonClick }) {
  return (
    <div className="project-card">
      <div className="card-image-container">
        <img src={image} alt={title} />
      </div>
      {badge && <span className="project-badge">{badge}</span>}
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="project-button" onClick={onButtonClick}>
        {buttonText} →
      </button>
    </div>
  );
}

export default ProjectCard;
