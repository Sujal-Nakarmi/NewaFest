"use client"

import { useState } from "react"
import { Container, Row, Col, Form, Button } from "react-bootstrap"
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa"
import "../CSS/Login.css"
import Design1 from "../Assests/Design1.png";
import Design2 from "../Assests/Design2.png";
import { Link } from 'react-router-dom';
import logo from "../Assests/Logo.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="login-container">
      <Container fluid>
        <Row className="h-100">
          {/* Left Section */}
          <Col md={6} className="p-0">
            <div className="login-left-panel">
             <img src={logo} className="login-logo" alt="Logo" />
              <h1>Log In Now</h1>
              <p>
                Stay connected with everything that matters to you.
              </p>
            </div>
          </Col>

          {/* Right Section - Keeping exactly as is */}
          <Col md={6} className="login-right d-flex align-items-center">
          <img src={Design1} className="design1" />
        <img src={Design2} className="design2" />
            <div className="login-form-container">
              <h1 className="login-title">Log in to your Account</h1>
              <p className="login-subtitle">Welcome back! Select method to log in</p>


              
              <Form>
                <div className="form-group position-relative">
                  <div className="input-icon">
                    <FaEnvelope />
                  </div>
                  <Form.Control type="email" placeholder="Email" className="custom-input" />
                </div>

                <div className="form-group position-relative">
                  <div className="input-icon">
                    <FaLock />
                  </div>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="custom-input"
                  />
                  <button type="button" className="password-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className="text-end mb-3">
                  <a href="#" className="forgot-password">
                    Forgot Password?
                  </a>
                </div>

                <Button className="login-btn w-100" type="submit">
                  Log In
                </Button>
              </Form>
              <p class="Bottom-Link-Login">Don't have an account?    
                   
                    <Link to="/registration" className="register-link">
                      Create One
                    </Link>
                  </p>
            </div>
          </Col>
        </Row>
      </Container>
      
    </div>
    
  )
}

export default LoginPage

