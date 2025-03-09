import React, { useState, useRef, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import '../CSS/NavBar.css';
import logo from "../Assests/Logo.png";
import axios from 'axios';

function NavBar() {
  const [showPopover, setShowPopover] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const target = useRef(null);
  const navigate = useNavigate();

  // Check if user is logged in when component mounts
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  const handlePopover = () => setShowPopover(!showPopover);

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear any authorization headers
    delete axios.defaults.headers.common["Authorization"];
    
    // Update state
    setIsLoggedIn(false);
    setShowPopover(false);
    
    // Redirect to login page
    navigate('/login/user');
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
          
          <div ref={target}>
            {isLoggedIn ? (
              <Button
                className="user-profile-btn"
                variant="custom"
                onClick={handlePopover}
              >
                <FaUser className="user-icon" />
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