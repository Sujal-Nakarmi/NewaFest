import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import "../CSS/UserLogin.css";
import Design1 from "../Assests/Design1.png";
import Design2 from "../Assests/Design2.png";
import logo from "../Assests/Logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post("http://localhost:8000/registerlogin/api/token/", {
        email,
        password,
      });
      
      // Store tokens
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      
      // Store user role and any other relevant user info
      localStorage.setItem("user_role", response.data.user_role);
      
      // Set default authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
      
      // Redirect based on user role
      switch(response.data.user_role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "pandit":
          navigate("/pandit/dashboard");
          break;
        case "vendor":
          navigate("/vendor/dashboard");
          break;
        default:
          navigate("/"); // Regular user home page
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };
  
  return (
    <div className="login-container">
      <Container fluid>
        <Row className="h-100">
          <Col md={6} className="p-0">
            <div className="login-left-panel">
              <img src={logo} className="login-logo" alt="Logo" />
              <h1>Log In Now</h1>
              <p>Stay connected with everything that matters to you.</p>
            </div>
          </Col>
          <Col md={6} className="login-right d-flex align-items-center">
            <img src={Design1} className="design1" />
            <img src={Design2} className="design2" />
            <div className="login-form-container">
              <h1 className="login-title">Log in to your Account</h1>
              <p className="login-subtitle">Welcome back! Select a method to log in</p>
              {error && <p className="error-message">{error}</p>}
              <Form onSubmit={handleLogin}>
                <div className="form-group position-relative">
                  <div className="input-icon">
                    <FaEnvelope />
                  </div>
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    className="custom-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group position-relative">
                  <div className="input-icon">
                    <FaLock />
                  </div>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="custom-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
              <p className="Bottom-Link-Login">
                Don't have an account?
                <a href="/register/user" className="register-link">
                  Create One
                </a>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
