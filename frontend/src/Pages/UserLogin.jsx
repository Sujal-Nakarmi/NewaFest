import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import "../CSS/UserLogin.css";
import Design1 from "../Assests/Design1.png";
import Design2 from "../Assests/Design2.png";
import logo from "../Assests/Logo.png";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Extract returnUrl from query parameters if present
  const queryParams = new URLSearchParams(window.location.search);
  const returnUrl = queryParams.get("returnUrl") || "/";

  // Check for Google auth success on component mount
  useEffect(() => {
    // Parse URL search params for auth data
    const params = new URLSearchParams(window.location.search);
    const authData = params.get("data");
    
    if (authData) {
      try {
        const parsedData = JSON.parse(authData);
        
        // Store tokens
        localStorage.setItem("access_token", parsedData.access);
        localStorage.setItem("refresh_token", parsedData.refresh);
        
        // Store user info
        localStorage.setItem("user_role", parsedData.user_role);
        localStorage.setItem("user_full_name", parsedData.full_name);
        localStorage.setItem("user_email", parsedData.email);
        
        // Set default authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${parsedData.access}`;
        
        // Navigate based on role
        navigateBasedOnRole(parsedData.user_role, returnUrl);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error("Error parsing auth data:", err);
      }
    }
  }, []);

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
      
      // Store user info
      localStorage.setItem("user_role", response.data.user_role);
      localStorage.setItem("user_full_name", response.data.full_name);
      localStorage.setItem("user_email", response.data.email);
      localStorage.setItem("user_phone_number", response.data.phone_number);
      localStorage.setItem("user_address", response.data.address);
      localStorage.setItem("user_country", response.data.country);
      
      // Set default authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
      
      // Check if there's an intended action in localStorage
      const intendedAction = localStorage.getItem("intendedAction");
      
      if (intendedAction) {
        // Clear the intended action from localStorage
        localStorage.removeItem("intendedAction");
        localStorage.removeItem("returnUrl");
        
        // Handle specific actions
        switch(intendedAction) {
          case "viewBookings":
            navigate("/my-bookings");
            break;
          case "viewReviews":
            navigate("/my-reviews");
            break;
          default:
            // If returnUrl exists, navigate to it, otherwise use role-based navigation
            navigateBasedOnRole(response.data.user_role, returnUrl);
        }
      } else {
        // No intended action, use returnUrl or role-based navigation
        navigateBasedOnRole(response.data.user_role, returnUrl);
      }
    } catch (err) {
      if (err.response) {
        // Server responded with an error
        if (err.response.status === 401) {
          setError("Invalid email or password");
        } else {
          setError(`Login failed: ${err.response.data.detail || "Please try again later"}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError("Server not responding. Please try again later.");
      } else {
        // Something happened in setting up the request
        setError("An error occurred. Please try again.");
      }
    }
  };
  
  // Helper function to navigate based on user role or returnUrl
  const navigateBasedOnRole = (role, returnUrl) => {
    // If returnUrl is the default "/" or a login/register page, use role-based navigation
    if (returnUrl === "/" || returnUrl.includes("/login") || returnUrl.includes("/register")) {
      switch(role) {
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
    } else {
      // Navigate to the return URL
      navigate(returnUrl);
    }
  };

  // Handle Google Sign In
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/accounts/google/login/";
  };
  
  return (
    <div className="user-login-container">
      <Container fluid>
        <Row className="h-100">
          <Col md={6} className="p-0">
            <div className="user-login-left-panel">
              <Link to="/"> 
                <img src={logo} className="user-login-logo" alt="Logo" />
              </Link>
              <h1>Log In Now</h1>
              <p>Stay connected with everything that matters to you.</p>
            </div>
          </Col>
          <Col md={6} className="user-login-right d-flex align-items-center">
            <img src={Design1} className="user-login-design1" alt="Design element 1" />
            <img src={Design2} className="user-login-design2" alt="Design element 2" />
            <div className="user-login-form-container">
              <h1 className="user-login-title">Log in to your Account</h1>
              <p className="user-login-subtitle">Welcome back! Select a method to log in</p>
              
              {/* Google Login Button */}
              <Button 
                className="user-login-google-btn mb-3" 
                onClick={handleGoogleLogin}
                style={{
                  backgroundColor: '#fff', 
                  color: '#757575', 
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '10px'
                }}
              >
                <FaGoogle style={{ marginRight: '10px', color: '#4285F4' }} />
                Sign in with Google
              </Button>
              
              <div className="user-login-divider mb-3">
                <span style={{ backgroundColor: '#fff', padding: '0 10px', color: '#757575' }}>OR</span>
              </div>
              
              {error && <p className="user-login-error-message">{error}</p>}
              
              <Form onSubmit={handleLogin}>
                <div className="user-login-form-group position-relative">
                  <div className="user-login-input-icon">
                    <FaEnvelope />
                  </div>
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    className="user-login-custom-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="user-login-form-group position-relative">
                  <div className="user-login-input-icon">
                    <FaLock />
                  </div>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="user-login-custom-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="user-login-password-toggle" 
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                <div className="text-end mb-3">
                  <a href="/forgot-password" className="user-login-forgot-password">
                    Forgot Password?
                  </a>
                </div>
                
                <Button className="user-login-btn" type="submit">
                  Log In
                </Button>
              </Form>
              
              <p className="user-login-bottom-link">
                Don't have an account?{" "}
                <Link to="/register/user" className="user-login-register-link">
                  Create One
                </Link>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;