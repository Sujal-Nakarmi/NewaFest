import React from 'react'
import '../CSS/HeroSection.css'
import Picture3 from "../Assests/Picture3.png";

function HeroSection() {
  return (
    <main className="hero-section flex-grow-1 d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="card shadow-lg mt-5">
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-6 text-center mb-4 mb-md-0">
             
                <img
                  src={Picture3}
                  alt="Traditional greeting"
                  className="img-fluid greeting-image"
                />
                <h2 className="mt-3 greeting-text">स्वागत</h2>
              </div>
              <div className="col-md-6">
                <h1 className="mb-4 hero_section_heading">Events</h1>
                <p className="text-muted">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                  enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                  ut aliquip
                </p>
                <button className="btn btn-danger btn-lg mt-3 register-btn">
                  Register Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default HeroSection
