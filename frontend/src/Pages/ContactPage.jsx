"use client"
import { useState } from "react"
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap"
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from "react-icons/fa"
import "../CSS/ContactPage.css"
import NavBar from '../Components/NavBar'
import ContactUs from "../Assests/ContactUs.png";
import axios from "axios";
import Footer from "../Components/Footer"
import { Link } from 'react-router-dom';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    subject: "",
    message: ""
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('http://localhost:8000/registerlogin/api/inquiry/submit/', formData);
      
      setFormStatus({
        submitted: true,
        success: true,
        message: "Thank you! Your message has been sent successfully."
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone_number: "",
        subject: "",
        message: ""
      });
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Something went wrong. Please try again.";
      
      setFormStatus({
        submitted: true,
        success: false,
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
      
      // Hide status message after 5 seconds
      setTimeout(() => {
        setFormStatus({
          submitted: false,
          success: false,
          message: ""
        });
      }, 5000);
    }
  }

  return (
    <div>
      <Container className="contact-container">
        <NavBar /><br/><br/><br/>
        <Row className="text-center mb-5">
          <Col>
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-subtitle">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
          </Col>
        </Row>

        <Row className="contact-info-row text-center">
          <Col xs={12} sm={6} md={3} className="contact-info-col mb-4">
            <div className="contact-icon-wrapper">
              <FaEnvelope className="contact-icon" />
            </div>
            <h5 className="mt-3">Email Address</h5>
          </Col>

          <Col xs={12} sm={6} md={3} className="contact-info-col mb-4">
            <div className="contact-icon-wrapper">
              <FaPhone className="contact-icon" />
            </div>
            <h5 className="mt-3">Phone Number</h5>
          </Col>

          <Col xs={12} sm={6} md={3} className="contact-info-col mb-4">
            <div className="contact-icon-wrapper">
              <FaMapMarkerAlt className="contact-icon" />
            </div>
            <h5 className="mt-3">Location</h5>
          </Col>

          <Col xs={12} sm={6} md={3} className="contact-info-col mb-4">
            <div className="contact-icon-wrapper">
              <FaClock className="contact-icon" />
            </div>
            <h5 className="mt-3">Time</h5>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col xs={12}>
            <h6 className="contact-label">CONTACT</h6>
            <h2 className="get-in-touch">Get In Touch With Us</h2>
            <p className="contact-description">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
            </p>
          </Col>
        </Row>

        {formStatus.submitted && (
          <Row className="mt-3">
            <Col>
              <Alert variant={formStatus.success ? "success" : "danger"}>
                {formStatus.message}
              </Alert>
            </Col>
          </Row>
        )}

        <Row className="mt-4">
          <Col xs={12} lg={6}>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col xs={12} md={6} className="mb-3">
                  <Form.Control 
                    type="text" 
                    name="name"
                    placeholder="Name" 
                    className="contact-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col xs={12} md={6} className="mb-3">
                  <Form.Control 
                    type="email" 
                    name="email"
                    placeholder="Email" 
                    className="contact-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Row>

              <Row>
                <Col xs={12} md={6} className="mb-3">
                  <Form.Control 
                    type="tel" 
                    name="phone_number"
                    placeholder="Phone Number" 
                    className="contact-input"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={12} md={6} className="mb-3">
                  <Form.Control 
                    type="text" 
                    name="subject"
                    placeholder="Subject" 
                    className="contact-input"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Control 
                    as="textarea" 
                    name="message"
                    rows={5} 
                    placeholder="Message" 
                    className="contact-input"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Row>

              <Button 
                type="submit" 
                className="send-message-btn w-100" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
              </Button>
            </Form>
          </Col>

          <Col xs={12} lg={6} className="mt-4 mt-lg-0">
            <div className="contact-image-container">
              <img src={ContactUs} style={{ width: "500px", height: "350px" }} alt="Contact Us" />
            </div>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col xs={12}>
            <div className="register-events-section">
              <h2 className="text-center">Register for Events Now</h2>
              <p className="text-center mx-auto register-description">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              </p>
              <div className="text-center">
                
<Link to="/register-event">
  <Button className="register-btn">Register</Button>
</Link>
              </div>
            </div>
          </Col>
        </Row>
        
      </Container><br/>
      <Footer />
    </div>
  )
}

export default ContactPage