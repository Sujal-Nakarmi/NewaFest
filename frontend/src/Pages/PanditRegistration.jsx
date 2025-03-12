import React, { useState } from "react";
import "../CSS/PanditRegistration.css";
import { Link } from "react-router-dom"
import Design1 from "../Assests/Design1.png";
import Design2 from "../Assests/Design2.png";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaFlag, FaBriefcase, FaFileAlt } from 'react-icons/fa';
import NavBar from "../Components/NavBar";
function RegistrationPandit() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
    country: "",
    experience_years: "",
    experience_description: "",
  });

  const [errorMessage, setErrorMessage] = useState(""); // For error handling
  const [successMessage, setSuccessMessage] = useState(""); // For success feedback

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear errors
    setSuccessMessage(""); // Clear success message

    // Wrap data inside the "user" key
    const requestData = {
      user: {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        address: formData.address,
        country: formData.country,
      },
      experience_years: parseInt(formData.experience_years, 10),
      experience_description: formData.experience_description,
    };

    try {
      const response = await fetch("http://localhost:8000/registerlogin/register_pandit/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Registration successful!");
        setFormData({
          full_name: "",
          email: "",
          password: "",
          phone_number: "",
          address: "",
          country: "",
          experience_years: "",
          experience_description: "",
        });
      } else {
        setErrorMessage(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please check your connection.");
    }
  };

  return (
    <div className="container-fluid registration-container">
      <div className="row">
        {/* Left Panel */}
        <div className="col-md-6 registration-p-left-panel">
          <Link to="/"><div className="Logo">Logo</div></Link>
          <h1>Create your account now</h1>
          <p></p>
        </div>

        {/* Right Panel */}
        <div className="col-md-6">
          <img src={Design1 || "/placeholder.svg"} alt="Design Element 1" className="design1" />
          <img src={Design2 || "/placeholder.svg"} alt="Design Element 2" className="design2" />
          <div className="pandit-right-panel">
            <h2>Pandit Registration Form</h2>
            <br />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            
            <form className="pandit-form" onSubmit={handleSubmit}>
              <div className="input-row">
                <div className="input-column">
                  <div className="input-group">
                    <span className="input-icon"><FaUser /></span>
                    <input type="text" className="form-control" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name" required />
                  </div>

                  <div className="input-group">
                    <span className="input-icon"><FaEnvelope /></span>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                  </div>

                  <div className="input-group">
                    <span className="input-icon"><FaLock /></span>
                    <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
                  </div>

                  <div className="input-group">
                    <span className="input-icon"><FaPhone /></span>
                    <input type="tel" className="form-control" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" required />
                  </div>
                </div>

                <div className="input-column">
                  <div className="input-group">
                    <span className="input-icon"><FaMapMarkerAlt /></span>
                    <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} placeholder="Address" required />
                  </div>

                  <div className="input-group">
                    <span className="input-icon"><FaFlag /></span>
                    <input type="text" className="form-control" name="country" value={formData.country} onChange={handleChange} placeholder="Country" required />
                  </div>

                  <div className="input-group">
                    <span className="input-icon"><FaBriefcase /></span>
                    <input type="number" className="form-control" name="experience_years" value={formData.experience_years} onChange={handleChange} placeholder="Experience Year" required />
                  </div>

                  <div className="input-group">
                    <span className="input-icon"><FaFileAlt /></span>
                    <input type="text" className="form-control" name="experience_description" value={formData.experience_description} onChange={handleChange} placeholder="Experience Description" required />
                  </div>
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-register">Register</button>
                <button type="button" className="btn btn-cancel">Cancel</button>
              </div>

              <div className="bottom-link">
                <p>Already have an account? <Link to="/login/pandit" className="login-link">Login</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPandit;
