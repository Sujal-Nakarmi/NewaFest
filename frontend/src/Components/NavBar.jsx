import React, { useState, useRef, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaUserCog, FaShoppingCart, FaChevronDown } from 'react-icons/fa';
import '../CSS/NavBar.css';
import logo from "../Assests/Logo.png";
import axios from 'axios';

function NavBar() {
  const [showPopover, setShowPopover] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userFullName, setUserFullName] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const target = useRef(null);
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  // Function to get user profile data including profile picture
  const getUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      
      const response = await axios.get("http://localhost:8000/registerlogin/profile/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // If profile picture URL exists in response, update it in localStorage and state
      if (response.data && response.data.profile_picture_url) {
        localStorage.setItem("user_profile_image", response.data.profile_picture_url);
        setUserImage(response.data.profile_picture_url);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Check if user is logged in and retrieve user details
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const fullName = localStorage.getItem("user_full_name");
    const profileImage = localStorage.getItem("user_profile_image");
    
    setUserFullName(fullName);
    setIsLoggedIn(!!token);
    
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Set profile image from localStorage if it exists
      if (profileImage) {
        setUserImage(profileImage);
      } else {
        // If no profile image in localStorage, try to fetch it
        getUserProfile();
      }
      
      fetchCartData();
    }
  
    const handleCartUpdate = (event) => {
      if (event.detail && event.detail.items) {
        setCartItems(event.detail.items);
        setCartItemCount(event.detail.items.length);
      } else {
        fetchCartData();
      }
    };
    
    // Listen for profile updates from other components
    const handleProfileUpdate = (event) => {
      if (event.detail && event.detail.profilePicture) {
        setUserImage(event.detail.profilePicture);
      } else {
        getUserProfile();
      }
    };
  
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('profileUpdated', handleProfileUpdate);
  
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) && 
          target.current && !target.current.contains(event.target)) {
        setShowPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const fetchCartData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/renting/cart/");
      setCartItems(response.data.items || []);
      setCartItemCount(response.data.items ? response.data.items.length : 0);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  const handlePopover = () => setShowPopover(!showPopover);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_full_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_phone_number");
    localStorage.removeItem("user_address");
    localStorage.removeItem("user_country");
    localStorage.removeItem("user_profile_image");

    delete axios.defaults.headers.common["Authorization"];

    setIsLoggedIn(false);
    setShowPopover(false);
    setCartItems([]);
    setCartItemCount(0);
    setUserImage(null);

    navigate("/login/user");
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="fixed-top main-navbar custom-navbar">
        <Container fluid className="justify-content-between align-items-center h-100">
          <div className="navbar-brand-container">
            <Navbar.Brand>
              <NavLink to="/" className="navbar-nav-link">
                <img src={logo} className="nav_logo" alt="Logo" />
              </NavLink>
            </Navbar.Brand>
          </div>

          <div className="nav-links-container">
            <Nav className="navbar-nav-links">
              <NavLink
                to="/"
                className={({ isActive }) => isActive ? 'navbar-nav-link navbar-active-link' : 'navbar-nav-link'}
              >
                Home
              </NavLink>
              <NavLink
                to="/rent-traditionals"
                className={({ isActive }) => isActive ? 'navbar-nav-link navbar-active-link' : 'navbar-nav-link'}
              >
                Renting
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) => isActive ? 'navbar-nav-link navbar-active-link' : 'navbar-nav-link'}
              >
                Contact Us
              </NavLink>
            </Nav>
          </div>
          
          <div className="user-actions-container">
            <div ref={target}>
              {isLoggedIn ? (
                <div
                  className="user-profile-section"
                  onClick={handlePopover}
                >
                  <div className="user-avatar-container">
                    {userImage ? (
                      <img 
                        src={userImage} 
                        alt={userFullName || "User"} 
                        className="user-avatar" 
                        onError={(e) => {
                          // If image fails to load, fallback to initials
                          e.target.style.display = 'none';
                          e.target.parentNode.classList.add('initials-avatar');
                          e.target.parentNode.innerText = getInitials(userFullName);
                        }}
                      />
                    ) : (
                      <div className="initials-avatar">
                        {getInitials(userFullName)}
                      </div>
                    )}
                  </div>
                  <span className="my-user-name">{userFullName}</span>
                  <FaChevronDown size={12} className="dropdown-chevron" />
                </div>
              ) : (
                <Button
                  className="nav_sign-up-btn"
                  variant="custom"
                  onClick={handlePopover}
                >
                  Sign Up
                </Button>
              )}
            </div>
            {isLoggedIn && (
              <Button 
                variant="link" 
                className="navbar-cart-button" 
                onClick={handleCartClick}
                aria-label="Shopping cart"
              >
                <FaShoppingCart size={22} className="navbar-cart-icon" />
                {cartItemCount > 0 && (
                  <Badge pill bg="danger" className="navbar-cart-badge">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </Container>
      </Navbar>

      {showPopover && !isLoggedIn && (
        <div className="navbar-custom-popover" ref={popoverRef}>
          <div className="navbar-popover-header">Register Account</div>
          <div className="navbar-popover-body">
            <Link to="/register/user" className="navbar-popover-option">Register as User</Link>
            <Link to="/register/pandit" className="navbar-popover-option">Register as Pandit</Link>
            <Link to="/login/user" className="navbar-popover-option">Already have an account? Login</Link>
          </div>
        </div>
      )}

      {showPopover && isLoggedIn && (
        <div className="navbar-custom-popover" ref={popoverRef}>
          <div className="navbar-popover-header">
            <div className="popover-user-info">
              <div className="popover-avatar">
                {userImage ? (
                  <img 
                    src={userImage} 
                    alt={userFullName || "User"}
                    className="popover-user-img"
                    onError={(e) => {
                      // If image fails to load, fallback to initials
                      e.target.style.display = 'none';
                      e.target.parentNode.classList.add('popover-initials');
                      e.target.parentNode.innerText = getInitials(userFullName);
                    }}
                  />
                ) : (
                  <div className="popover-initials">{getInitials(userFullName)}</div>
                )}
              </div>
              <div className="popover-user-details">
                <div className="popover-user-name">{userFullName}</div>
                <div className="popover-user-status">Logged In</div>
              </div>
            </div>
          </div>
          <div className="navbar-popover-body">
            <Link to="/profile" className="navbar-popover-option">
              <FaUserCog className="navbar-option-icon" /> 
              <span>Profile Settings</span>
            </Link>
        
            <button onClick={handleLogout} className="navbar-popover-option navbar-logout-option">
              <FaSignOutAlt className="navbar-option-icon" /> 
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default NavBar;