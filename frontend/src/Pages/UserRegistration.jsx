import "../CSS/UserRegistration.css"
import Design1 from "../Assests/Design1.png"
import Design2 from "../Assests/Design2.png"
import { Link } from "react-router-dom"
import logo from "../Assests/Logo.png"
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaFlag } from "react-icons/fa"
import { useState } from "react";
import axios from "axios";

function Registration() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
    country: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/registerlogin/register/", formData, {
        headers: { "Content-Type": "application/json" },
      });
      setMessage("Registration successful!");
      console.log(response.data);
    } catch (error) {
      setMessage("Registration failed. Please try again.");
      console.error(error.response?.data);
    }
  };

  return (
    <div>
      <div className="container-fluid">
        <div className="row w-100">
          <div className="col-md-6 registration-left-panel">
            <img src={logo || "/placeholder.svg"} className="register-logo" alt="Logo" />
            <h1>Create your account now</h1>
            <p>Lorem Ipsum.</p>
          </div>

          <div className="col-md-6 right-panel">
            <img src={Design1 || "/placeholder.svg"} className="design1" alt="design1" />
            <img src={Design2 || "/placeholder.svg"} className="design2" alt="design2" />
            <h2>Registration Form</h2>
            <p>Stay connected with everything that matters to you.</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <span className="input-icon"><FaUser /></span>
                <input type="text" name="full_name" className="form-control" placeholder="Full Name" onChange={handleChange} required />
              </div>

              <div className="input-group">
                <span className="input-icon"><FaEnvelope /></span>
                <input type="email" name="email" className="form-control" placeholder="Email" onChange={handleChange} required />
              </div>

              <div className="input-group">
                <span className="input-icon"><FaLock /></span>
                <input type="password" name="password" className="form-control" placeholder="Password" onChange={handleChange} required />
              </div>

              <div className="input-group">
                <span className="input-icon"><FaPhone /></span>
                <input type="text" name="phone_number" className="form-control" placeholder="Phone Number" onChange={handleChange} required />
              </div>

              <div className="input-group">
                <span className="input-icon"><FaMapMarkerAlt /></span>
                <input type="text" name="address" className="form-control" placeholder="Address" onChange={handleChange} required />
              </div>

              <div className="input-group">
                <span className="input-icon"><FaFlag /></span>
                <input type="text" name="country" className="form-control" placeholder="Country" onChange={handleChange} required />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <button type="submit" className="btn btn-register w-100">Register</button>
                </div>
                <div className="col-md-6">
                  <button type="button" className="btn btn-outline btn-cancel w-100">Cancel</button>
                </div>
              </div>
            </form>
            <p className="Bottom-Link-Register">
              Already have an account?
              <Link to="/login/user" className="login-link">Login</Link>
            </p>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;
