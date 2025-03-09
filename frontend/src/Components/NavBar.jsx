import React, { useState, useRef } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import '../CSS/NavBar.css'
import logo from "../Assests/Logo.png";

function NavBar() {
  const [showPopover, setShowPopover] = useState(false);
  const target = useRef(null);

  const handlePopover = () => setShowPopover(!showPopover);

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
          <Button
  className="nav_sign-up-btn"
  variant="custom" // Use a custom variant instead of the default
  onClick={handlePopover}
>
  Sign Up
</Button>
          </div>
        </Container>
      </Navbar>

      {showPopover && (
        <div className="custom-popover">
          <table className="popover-table">
            <tbody>
              <tr>
                <td>
                  <Link to="/registration" className="popover-option">Register as User</Link>
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
    </>
  );
}

export default NavBar;
