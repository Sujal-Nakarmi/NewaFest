import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
  FaGooglePlusG,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock
} from 'react-icons/fa';
import logo from "../Assests/Logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-light py-5">
      <Container>
        {/* Red line at the top */}
        <Row className="mb-4">
          <Col>
            <hr style={{ borderTop: '2px solid #8B0000', opacity: 1 }} />
          </Col>
        </Row>
        
        {/* Main footer content */}
        <Row className="mb-4 align-items-start">
          {/* Logo and About - Left aligned */}
          <Col md={4} className="mb-4 mb-md-0">
            <img
              src={logo}
              alt="NewaFest Logo"
              style={{ maxWidth: '150px', height: 'auto' }}
              className="img-fluid mb-3"
            />
            <p className="text-muted mb-3">
              Celebrating and preserving Newari culture through traditional festivals, 
              cuisine, and artistic performances.
            </p>
            <div className="d-flex gap-3 mb-4">
              <a href="#" className="text-decoration-none" style={{ color: '#8B0000' }}><FaFacebookF size={18} /></a>
              <a href="#" className="text-decoration-none" style={{ color: '#8B0000' }}><FaTwitter size={18} /></a>
              <a href="#" className="text-decoration-none" style={{ color: '#8B0000' }}><FaLinkedinIn size={18} /></a>
              <a href="#" className="text-decoration-none" style={{ color: '#8B0000' }}><FaYoutube size={18} /></a>
              <a href="#" className="text-decoration-none" style={{ color: '#8B0000' }}><FaInstagram size={18} /></a>
            </div>
          </Col>
          
          {/* Contact Info */}
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3 fw-bold">Contact Us</h5>
            <div className="d-flex align-items-center mb-2">
              <FaMapMarkerAlt className="me-2" style={{ color: '#8B0000' }} />
              <span>Kathmandu, Nepal</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <FaPhone className="me-2" style={{ color: '#8B0000' }} />
              <span>+977 1234567890</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <FaEnvelope className="me-2" style={{ color: '#8B0000' }} />
              <span>info@newafest.com</span>
            </div>
            <div className="d-flex align-items-center mb-3">
              <FaClock className="me-2" style={{ color: '#8B0000' }} />
              <span>Mon-Fri: 9AM-5PM, Sat: 10AM-2PM</span>
            </div>
          </Col>
          
          {/* Newsletter Signup */}
          <Col md={4}>
            <h5 className="mb-3 fw-bold">Inquiry</h5>
            <p className="text-muted mb-3">Contact us for any query.</p>
            <Form className="mb-3">
              
              <Button 
                type="submit" 
                style={{ backgroundColor: '#8B0000', borderColor: '#8B0000' }}
                className="w-100"
              >
                Contact Us
              </Button>
            </Form>
            <p className="small text-muted">
              
            </p>
          </Col>
        </Row>
        
        {/* Light divider */}
        <Row className="mb-3">
          <Col>
            <hr className="opacity-25" />
          </Col>
        </Row>
        
        {/* Bottom footer */}
        <Row className="align-items-center">
          {/* Footer links */}
          <Col md={7} className="d-flex flex-wrap gap-4 mb-3 mb-md-0">
            <a href="#" className="text-dark text-decoration-none">CONTACT US</a>
            <a href="#" className="text-dark text-decoration-none">REGISTRATION</a>
            <a href="#" className="text-dark text-decoration-none">RENTING</a>
            <a href="#" className="text-dark text-decoration-none">BOOKING</a>
            <a href="#" className="text-dark text-decoration-none">PRIVACY POLICY</a>
          </Col>
          
          {/* Copyright */}
          <Col md={5} className="text-md-end text-secondary">
            Copyright © {currentYear} • NewaFest. All rights reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;