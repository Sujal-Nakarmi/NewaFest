import { Modal, Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/BhintunaRegistrationModal.css";
import IhiHead from "../Assests/IhiHead.png";

function IhiRegistrationModal({ show, handleClose, eventDetailId }) {
  const [formData, setFormData] = useState({
    seats: 1,
    location: "",
    phone: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Location options state
  const [locationOptions, setLocationOptions] = useState([]);

  // Load event options when component mounts
  useEffect(() => {
    // Reset form when modal opens
    if (show) {
      resetForm();
      fetchLocationOptions();
    }
  }, [show, eventDetailId]);
  
  // Reset the form to initial state
  const resetForm = () => {
    setFormData({
      seats: 1,
      location: "",
      phone: "",
      description: "",
    });
  };

  // Fetch location options for the event
  const fetchLocationOptions = async () => {
    try {
      // Using the API endpoint from your code
      const response = await axios.get(
        `http://localhost:8000/adminwork/api/ihi-locations/?event_detail_id=${eventDetailId}`
      );
      
      setLocationOptions(response.data.locations || []);
    } catch (error) {
      console.error("Error fetching location options:", error);
      toast.error("Failed to load location options. Please try again.");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 1 : value
    }));
  };

  // Submit form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("You must be logged in to register!");
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Using the API endpoint from your code
      const response = await axios.post(
        "http://localhost:8000/adminwork/events/register-ihi/",
        {
          event_detail: parseInt(eventDetailId),
          seats_requested: formData.seats,
          location: formData.location,
          phone: formData.phone,
          description: formData.description
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        }
      );
      
      toast.success(`Successfully registered for Ihi!`);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data
        ? (typeof error.response.data === 'object'
            ? JSON.stringify(error.response.data)
            : error.response.data)
        : "There was an error registering for the event.";
      
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Validate form
  const validateForm = () => {
    if (formData.seats < 1 || formData.seats > 3) {
      toast.error("Number of slots must be between 1 and 3");
      return false;
    }
    
    if (!formData.location) {
      toast.error("Please select a location");
      return false;
    }
    
    if (!formData.phone) {
      toast.error("Please enter phone number");
      return false;
    }
    
    return true;
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={5000} />
      
      <Modal show={show} onHide={handleClose} centered className="registration-modal" size="lg">
        <div
          className="modal-header-custom"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${IhiHead})`,
          }}
        >
          <h2 className="modal-title-custom">Ihi Registration</h2>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={handleClose} 
            aria-label="Close"
          ></button>
        </div>
        
        <Modal.Body className="custom-modal-body">
          <Form onSubmit={handleSubmit}>
            {/* Slots input */}
            <Form.Group className="mb-3">
              <Form.Label>Number of Slots</Form.Label><br/>
              <Form.Text className="text-muted">
                Maximum 3 slots allowed for Ihi ceremony
              </Form.Text>
              <Form.Control
                type="number"
                className="form-input"
                name="seats"
                min="1"
                max="3"
                value={formData.seats || 1}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            {/* Location selection */}
            <Form.Group className="mb-3">
              <Form.Label>Ihi Location</Form.Label>
              <Form.Select
                className="form-input"
                name="location"
                value={formData.location || ""}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a location</option>
                {locationOptions.map((location) => (
                  <option 
                    key={location.id} 
                    value={location.id}
                    disabled={location.available_seats < formData.seats}
                  >
                    {location.name} - {location.address} (Available: {location.available_seats})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                className="form-input"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                placeholder="Enter your contact number"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Additional Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                className="form-input"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="Any additional details (optional)"
              />
            </Form.Group>
            
            {/* Buttons */}
            <div className="button-container">
              <Button
                className="register-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
              <Button 
                className="cancel-button" 
                onClick={handleClose} 
                disabled={isSubmitting}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default IhiRegistrationModal;