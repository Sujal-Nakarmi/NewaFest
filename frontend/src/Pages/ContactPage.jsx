"use client"
import { Container, Row, Col, Form, Button } from "react-bootstrap"
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from "react-icons/fa"
import "../CSS/ContactPage.css"
import NavBar from '../Components/NavBar'
import ContactUs from "../Assests/ContactUs.png";

const ContactPage = () => {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Add your form submission logic here
    console.log("Form submitted")
  }

  return (
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

      <Row className="mt-4">
        <Col xs={12} lg={6}>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col xs={12} md={6} className="mb-3">
                <Form.Control type="text" placeholder="Name" className="contact-input" />
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Control type="email" placeholder="Email" className="contact-input" />
              </Col>
            </Row>

            <Row>
              <Col xs={12} md={6} className="mb-3">
                <Form.Control type="tel" placeholder="Phone Number" className="contact-input" />
              </Col>
              <Col xs={12} md={6} className="mb-3">
                <Form.Control type="text" placeholder="Subject" className="contact-input" />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Control as="textarea" rows={5} placeholder="Message" className="contact-input" />
              </Col>
            </Row>

            <Button type="submit" className="send-message-btn w-100">
              SEND MESSAGE
            </Button>
          </Form>
        </Col>

        <Col xs={12} lg={6} className="mt-4 mt-lg-0">
          <div className="contact-image-container">
            <img src= {ContactUs} style={{ width: "500px", height: "350px" }} />
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
              <Button className="register-btn">Register</Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default ContactPage

