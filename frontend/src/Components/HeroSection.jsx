import React from 'react';
import '../CSS/HeroSection.css';
import VStall from '../Assests/VStall.png';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="container">
        {/* Top Banner */}
        <div className="banner">
          <span className="home-badge">स्वागत</span>
          <span className="banner-text">Join the Celebration Today</span>
        </div>
        
        <div className="row align-items-center">
          {/* Left Content */}
          <div className="col-lg-6 content-left">
            <h1 className="hero-title">NewaFest</h1>
            <p className="hero-subtitle">
            Your one-stop platform for Newari festival event registrations, traditional clothing rentals, and pandit booking services.
            </p>
            <button className="get-started-btn">
            Explore Now
            </button>
            <p className="footnote">* Experience the rich heritage and cultural essence of Newari traditions.</p>
          </div>
          
          {/* Right Illustration */}
          <div className="col-lg-6">
            <div className="illustration-container">
              <div className="mandala-frame">
                <img
                  src={VStall}
                  alt="Festival food stall with traditional Newari cuisine"
                  className="hero-illustration"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;