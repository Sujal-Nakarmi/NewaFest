import React from "react";
import "../CSS/PanditRegistration.css";
import Design1 from "../Assests/Design1.png";
import Design2 from "../Assests/Design2.png";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaFlag, FaBriefcase, FaFileAlt } from 'react-icons/fa';

function RegistrationPandit() {
  return (
    <div className="container-fluid registration-container">
      <div className="row">
        {/* Left Panel */}
        <div className="col-md-6 registration-p-left-panel">
          <div className="Logo">Logo</div>
          <h1>Create your account to</h1>
          <p>Lorem Ispum.</p>
          
        </div>
        
        {/* Right Panel */}
        <div className="col-md-6">
        <img src={Design1 || "/placeholder.svg"} alt="Design Element 1" className="design1" />
        <img src={Design2 || "/placeholder.svg"} alt="Design Element 2" className="design2" />
          <div className="pandit-right-panel">
          
            <h2>Pandit Registration Form</h2><br/>
            <form className="pandit-form">
              <div className="input-row">
                <div className="input-column">
                  <div className="input-group">
                    <span className="input-icon"><FaUser /></span>
                    <input type="text" className="form-control" placeholder="Full Name" />
                  </div>
                  
                  <div className="input-group">
                    <span className="input-icon"><FaEnvelope /></span>
                    <input type="email" className="form-control" placeholder="Email" />
                  </div>
                  
                  <div className="input-group">
                    <span className="input-icon"><FaLock /></span>
                    <input type="password" className="form-control" placeholder="Password" />
                  </div>
                  
                  <div className="input-group">
                    <span className="input-icon"><FaPhone /></span>
                    <input type="tel" className="form-control" placeholder="Phone Number" />
                  </div>
                </div>
                <div className="input-column">
                  <div className="input-group">
                    <span className="input-icon"><FaMapMarkerAlt /></span>
                    <input type="text" className="form-control" placeholder="Address" />
                  </div>
                  
                  <div className="input-group">
                    <span className="input-icon"><FaFlag /></span>
                    <input type="text" className="form-control" placeholder="Nepal" />
                  </div>
                  
                  <div className="input-group">
                    <span className="input-icon"><FaBriefcase /></span>
                    <input type="text" className="form-control" placeholder="Experience Year" />
                  </div>
                  
                  <div className="input-group">
                    <span className="input-icon"><FaFileAlt /></span>
                    <input type="text" className="form-control" placeholder="Experience Description" />
                  </div>
                </div>
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn btn-register">Register</button>
                <button type="button" className="btn btn-cancel">Cancel</button>
              </div>
              
              <div className="bottom-link">
                <p>Don't have an account? <a href="#" className="login-link">Login</a></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPandit;
