import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Projects from './pages/Projects';
import SoilQuality from './pages/SoilQuality/SoilQuality';
import PlantNutrientDeficiency from './pages/PlantNutrientDeficiency/PlantNutrientDeficiency';
import CropDisease from './pages/CropDisease/CropDisease';
import WeedsDetection from './pages/WeedsDetection/WeedsDetection';
import CropYieldPrediction from './pages/CropYieldPrediction/CropYieldPrediction';
import AnimalCount from './pages/AnimalCount/AnimalCount';
import DroughtAnalysis from './pages/Drought/DroughtAnalysis';
import PlantIdentification from './pages/PlantIdentification/PlantIdentification';
import WaterQuality from './pages/WaterQuality/WaterQuality';
import IrrigationPrediction from './pages/Irrigation/IrrigationPrediction';
import ChickenDisease from './pages/ChickenDisease/ChickenDisease';
import SoilClassification from './pages/SoilClassification/SoilClassification';
import './pages/Agriculture.css';  // Import agriculture theme
import './styles.css';  // Import global styles

function App() {
    return (
        <Router>
            <div>
                <header className="app-header">
                    <div className="header-container">
                        <div className="header-left">
                            <img src="/logo.png" alt="AI Agriculture Logo" className="header-logo" />
                            <h1 className="header-title">AI in AGRICULTURE</h1>
                        </div>
                        <nav className="header-nav">
                            <Link to="/" className="nav-link">Home</Link>
                            <Link to="/projects" className="nav-link">Projects</Link>
                        </nav>
                    </div>
                </header>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/soil-analysis" element={<SoilQuality />} />
                    <Route path="/plant-nutrient-deficiency" element={<PlantNutrientDeficiency />} />
                    <Route path="/crop-disease" element={<CropDisease />} />
                    <Route path="/weeds-detection" element={<WeedsDetection />} />
                    <Route path="/crop-yield-prediction" element={<CropYieldPrediction />} />
                    <Route path="/animal-count" element={<AnimalCount />} />
                    <Route path="/drought-analysis" element={<DroughtAnalysis />} />
                    <Route path="/plant-identification" element={<PlantIdentification />} />
                    <Route path="/water-quality" element={<WaterQuality />} />
                    <Route path="/irrigation-prediction" element={<IrrigationPrediction />} />
                    <Route path="/chicken-disease" element={<ChickenDisease />} />
                    <Route path="/soil-classification" element={<SoilClassification />} />
                </Routes>
                
            </div>
        </Router>
    );
}

export default App;
