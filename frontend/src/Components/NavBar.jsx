import React, { useState, useRef, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaUserCog, FaShoppingCart } from 'react-icons/fa';
import '../CSS/NavBar.css';
import logo from "../Assests/Logo.png";
import axios from 'axios';

function NavBar() {
  const [showPopover, setShowPopover] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userFullName, setUserFullName] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const target = useRef(null);
  const navigate = useNavigate();

  // Check if user is logged in and retrieve user details
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const fullName = localStorage.getItem("user_full_name");
    setUserFullName(fullName);
    setIsLoggedIn(!!token);
    
    // Set up axios default headers if user is logged in
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Fetch cart data
      fetchCartData();
    }
  
    // Listen for cart updates from other components
    const handleCartUpdate = (event) => {
      if (event.detail && event.detail.items) {
        setCartItems(event.detail.items);
        setCartItemCount(event.detail.items.length);
      } else {
        // If no details, just refresh the cart
        fetchCartData();
      }
    };
  
    window.addEventListener('cartUpdated', handleCartUpdate);
  
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);
  
  // Function to fetch cart data
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
    // Clear tokens and user details from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_full_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_phone_number");
    localStorage.removeItem("user_address");
    localStorage.removeItem("user_country");

    // Clear any authorization headers
    delete axios.defaults.headers.common["Authorization"];

    // Update state
    setIsLoggedIn(false);
    setShowPopover(false);
    setCartItems([]);
    setCartItemCount(0);

    // Redirect to login page
    navigate("/login/user");
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="fixed-top custom-navbar">
        <Container fluid className="justify-content-between">
          <Navbar.Brand>
            <NavLink to="/" className="nav-link">
              <img
                src={logo}
                height="32"
                className="nav_logo"
                alt="Logo"
              />
            </NavLink>
          </Navbar.Brand>

          <Nav className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}
            >
              Home
            </NavLink>
            <NavLink
              to="/renting"
              className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}
            >
              Renting
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => isActive ? 'nav-link active-link' : 'nav-link'}
            >
              Contact Us
            </NavLink>
          </Nav>

          <div className="d-flex align-items-center">
            {isLoggedIn && (
              <div className="me-3 position-relative">
                <Button
                  variant="link"
                  className="cart-button p-0"
                  onClick={handleCartClick}
                >
                  <FaShoppingCart size={24} className="cart-icon" />
                  {cartItemCount > 0 && (
                    <Badge 
                      pill 
                      bg="danger" 
                      className="cart-badge position-absolute"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </div>
            )}

            <div ref={target}>
              {isLoggedIn ? (
                <Button
                  className="user-profile-btn"
                  variant="custom"
                  onClick={handlePopover}
                >
                  <FaUser className="user-icon" />
                  <span className="user-name">{userFullName}</span>
                </Button>
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
          </div>
        </Container>
      </Navbar>

      {showPopover && !isLoggedIn && (
        <div className="custom-popover">
          <table className="popover-table">
            <tbody>
              <tr>
                <td>
                  <Link to="/register/user" className="popover-option">Register as User</Link>
                </td>
              </tr>
              <tr>
                <td>
                  <Link to="/register/pandit" className="popover-option">Register as Pandit</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {showPopover && isLoggedIn && (
        <div className="custom-popover user-popover">
          <table className="popover-table">
            <tbody>
              <tr>
                <td>
                  <Link to="/profile" className="popover-option">
                    <FaUserCog className="option-icon" /> Profile
                  </Link>
                </td>
              </tr>
              <tr>
                <td>
                  <button onClick={handleLogout} className="popover-option logout-option">
                    <FaSignOutAlt className="option-icon" /> Logout
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default NavBar;