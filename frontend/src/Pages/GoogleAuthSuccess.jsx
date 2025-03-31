import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();

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
        const role = parsedData.user_role;
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
      } catch (err) {
        console.error("Error parsing auth data:", err);
        navigate("/login?error=authentication_failed");
      }
    } else {
      // No auth data, redirect to login
      navigate("/login?error=no_auth_data");
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        <h2>Completing sign in...</h2>
        <p>Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;