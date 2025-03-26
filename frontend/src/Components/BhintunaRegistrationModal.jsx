import { Modal, Form, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/BhintunaRegistrationModal.css";
import Rally from "../Assests/ParticipationRally.png";
import Music from "../Assests/ParticipationMusic.png";
import Stall from "../Assests/ParticipationStall.png";
import BhintunaTicketPayment from "./BhintunaTicketPayment";

function RegistrationModal({ show, handleClose, eventType, categoryId }) {
  const { eventDetailId } = useParams();
  const [formData, setFormData] = useState({
    seats: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Event options state
  const [eventOptions, setEventOptions] = useState({
    rallyOptions: [],
    rallyLaps: [],
    stallTypes: [],
    stallLocations: [],
    volunteerTypes: [],
    volunteerLaps: [],
    instruments: []
  });
  
  // UI control state
  const [showFoodInput, setShowFoodInput] = useState(false);
  const [showDrinksInput, setShowDrinksInput] = useState(false);
  const [showInstrumentSelect, setShowInstrumentSelect] = useState(false);

  const [showTicketPaymentModal, setShowTicketPaymentModal] = useState(false);
  const [registeredEventRegistrationId, setRegisteredEventRegistrationId] = useState(null);

  // Load all event options when component mounts or event type changes
  useEffect(() => {
    // Reset form when event type changes
    resetForm();
    
    if (eventDetailId) {
      fetchEventOptions();
    }
  }, [eventType, eventDetailId]);
  
  // Reset the form to initial state
  const resetForm = () => {
    setFormData({ seats: 1 });
    setShowFoodInput(false);
    setShowDrinksInput(false);
    setShowInstrumentSelect(false);
  };

  // Fetch all options for the event
  const fetchEventOptions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/adminwork/api/event-options/?event_detail_id=${eventDetailId}`
      );
      
      setEventOptions({
        rallyOptions: response.data.rally_options || [],
        rallyLaps: response.data.rally_laps || [],
        stallTypes: response.data.stall_types || [],
        stallLocations: response.data.stall_locations || [],
        volunteerTypes: response.data.volunteer_types || [],
        volunteerLaps: response.data.volunteer_laps || [],
        instruments: response.data.instruments || []
      });
    } catch (error) {
      console.error("Error fetching event options:", error);
      toast.error("Failed to load event options. Please try again.");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      // Handle checkbox arrays (for laps)
      const valueInt = parseInt(value);
      const currentValues = formData[name] || [];
      
      setFormData({
        ...formData,
        [name]: checked 
          ? [...currentValues, valueInt] 
          : currentValues.filter(id => id !== valueInt)
      });
    } else if (name === "stallType") {
      // Special handling for stall type
      const typeId = parseInt(value);
      const selectedType = eventOptions.stallTypes.find(type => type.type_id === typeId);
      
      setShowFoodInput(selectedType?.code === 'FOOD');
      setShowDrinksInput(selectedType?.code === 'DRINKS');
      
      setFormData({
        ...formData,
        stallType: typeId
      });
    } else if (name === "volunteerType") {
      // Special handling for volunteer type
      const typeId = parseInt(value);
      const selectedType = eventOptions.volunteerTypes.find(type => type.type_id === typeId);
      
      setShowInstrumentSelect(selectedType?.code === 'Music');
      
      setFormData({
        ...formData,
        volunteerType: typeId
      });
    } else {
      // Handle all other inputs
      setFormData({
        ...formData,
        [name]: type === "number" ? parseInt(value) : value
      });
    }
  };

  // Get header image based on event type
  const getHeaderImage = () => {
    switch (eventType) {
      case "rally": return Rally;
      case "stall": return Stall;
      case "volunteer": return Music;
      default: return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-07%20at%2012.02.35%E2%80%AFAM-uloRB0rddzPTOOHBTfwdV47XBpDee5.png";
    }
  };

  // Get title based on event type
  const getTitle = () => {
    switch (eventType) {
      case "rally": return "Rally Participation";
      case "stall": return "Stalls Registration";
      case "volunteer": return "Volunteer Registration";
      default: return "Registration";
    }
  };

  // Submit form handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("You must be logged in to register!");
      return;
    }
    
    // Validate form based on event type
    if (!validateForm()) {
      return;
    }
    
    // Prepare registration data
    const registrationData = prepareRegistrationData();
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(
        "http://localhost:8000/adminwork/events/register/",
        registrationData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        }
      );
      
      // Store the event registration ID for ticket payment
      setRegisteredEventRegistrationId(response.data.registration_ids[0]);  // Take the first registration ID
      
      // Different behavior based on event type
      if (eventType === "rally") {
        // For rally, show the ticket payment modal
        setShowTicketPaymentModal(true);
      } else {
        // For volunteer and stall, just show success message
        toast.success(`Successfully registered ${formData.seats} seat(s)!`);
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
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

  // Close ticket payment modal
  const handleCloseTicketPayment = () => {
    setShowTicketPaymentModal(false);
    setRegisteredEventRegistrationId(null);
    handleClose(); // Close the registration modal as well
  };
  
  // Validate form based on event type
  const validateForm = () => {
    if (eventType === "rally") {
      if (formData.seats > 5) {
        toast.error("Maximum 5 slots allowed for Rally");
        return false;
      }
      if (!formData.rallyOption) {
        toast.error("Please select a rally option");
        return false;
      }
      if (!formData.rallyLaps || formData.rallyLaps.length === 0) {
        toast.error("Please select at least one lap");
        return false;
      }
    } else if (eventType === "volunteer") {
      if (formData.seats > 5) {
        toast.error("Maximum 5 slots allowed for Volunteer");
        return false;
      }
      if (!formData.volunteerType) {
        toast.error("Please select a volunteer type");
        return false;
      }
      if (!formData.volunteerLaps || formData.volunteerLaps.length === 0) {
        toast.error("Please select at least one volunteer lap");
        return false;
      }
      if (showInstrumentSelect && !formData.instrument) {
        toast.error("Please select a musical instrument");
        return false;
      }
    } else if (eventType === "stall") {
      if (formData.seats > 1) {
        toast.error("Only 1 slot allowed for Stall");
        return false;
      }
      if (!formData.stallType) {
        toast.error("Please select a stall type");
        return false;
      }
      if (!formData.stallLocation) {
        toast.error("Please select a stall location");
        return false;
      }
      if (showFoodInput && !formData.foodItems) {
        toast.error("Please enter food items information");
        return false;
      }
      if (showDrinksInput && !formData.drinks) {
        toast.error("Please enter drinks information");
        return false;
      }
    }
    
    return true;
  };
  
  // Prepare registration data based on event type
  const prepareRegistrationData = () => {
    const data = {
      event_detail: parseInt(eventDetailId),
      category: categoryId,
      seats_requested: formData.seats
    };
    
    if (eventType === "rally") {
      data.rally_option = formData.rallyOption;
      data.rally_laps = formData.rallyLaps;
    } else if (eventType === "volunteer") {
      data.volunteer_type = formData.volunteerType;
      data.volunteer_laps = formData.volunteerLaps;
      
      if (showInstrumentSelect) {
        data.newari_instrument = formData.instrument;
      }
    } else if (eventType === "stall") {
      data.stall_type = formData.stallType;
      data.stall_location = formData.stallLocation;
      
      if (formData.foodItems) {
        data.food_items = formData.foodItems;
      }
      
      if (formData.drinks) {
        data.drinks = formData.drinks;
      }
    }
    
    return data;
  };

  // Render form based on event type
  const renderForm = () => {
    return (
      <Form onSubmit={handleSubmit}>
        {/* Seats input with dynamic max value */}
        <Form.Group className="mb-3">
          <Form.Label>Number of Seats</Form.Label><br/>
          <Form.Text className="text-muted">
            {eventType === "stall" 
              ? "Only 1 seat allowed for Stall" 
              : "Maximum 5 seats allowed "}
          </Form.Text>
          <Form.Control
            type="number"
            className="form-input"
            name="seats"
            min="1"
            max={eventType === "stall" ? 1 : 5}
            value={formData.seats || 1}
            onChange={handleInputChange}
          />
        </Form.Group>
        
        {/* Event-specific inputs */}
        {eventType === "rally" && renderRallyForm()}
        {eventType === "volunteer" && renderVolunteerForm()}
        {eventType === "stall" && renderStallForm()}
        
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
          >
            Cancel
          </Button>
        </div>
      </Form>
    );
  };
  
  // Render rally-specific form with improved lap display
  const renderRallyForm = () => {
    const { rallyOptions, rallyLaps } = eventOptions;
    const filteredLaps = rallyLaps.filter(lap => lap.rally_option === parseInt(formData.rallyOption));
    
    return (
      <>
        <Form.Group className="mb-3">
          <Form.Label>Rally Option</Form.Label>
          <Form.Select
            className="form-input"
            name="rallyOption"
            value={formData.rallyOption || ""}
            onChange={handleInputChange}
          >
            <option value="">Select an option</option>
            {rallyOptions.map((option) => (
              <option 
                key={option.option_id} 
                value={option.option_id}
                disabled={option.available_seats < formData.seats}
              >
                {option.name} (Available Slots: {option.available_seats})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        {formData.rallyOption && (
          <Form.Group className="mb-3">
            <Form.Label>Select Laps</Form.Label>
            <div className="lap-selection-container">
              {filteredLaps.length > 0 ? (
                filteredLaps.map((lap) => (
                  <div 
                    key={lap.lap_id} 
                    className={`lap-card ${(formData.rallyLaps || []).includes(lap.lap_id) ? 'selected' : ''}`}
                    onClick={() => {
                      const currentLaps = formData.rallyLaps || [];
                      const newLaps = currentLaps.includes(lap.lap_id)
                        ? currentLaps.filter(id => id !== lap.lap_id)
                        : [...currentLaps, lap.lap_id];
                      setFormData({...formData, rallyLaps: newLaps});
                    }}
                  >
                    <div className="lap-header">
                      <span className="lap-number">Lap {lap.lap_number}</span>
                      <input 
                        type="checkbox" 
                        name="rallyLaps"
                        value={lap.lap_id}
                        checked={(formData.rallyLaps || []).includes(lap.lap_id)}
                        onChange={() => {}} // Prevent default checkbox behavior
                        className="lap-checkbox"
                      />
                    </div>
                    <div className="lap-description">
                      {lap.route_description}
                    </div>
                  </div>
                ))
              ) : (
                <p>No laps available for this option</p>
              )}
            </div>
          </Form.Group>
        )}
      </>
    );
  };
  
  // Render volunteer-specific form
  const renderVolunteerForm = () => {
    const { volunteerTypes, volunteerLaps, instruments } = eventOptions;
    
    return (
      <>
        <Form.Group className="mb-3">
          <Form.Label>Volunteer Type</Form.Label>
          <Form.Select
            className="form-input"
            name="volunteerType"
            value={formData.volunteerType || ""}
            onChange={handleInputChange}
          >
            <option value="">Select a volunteer type</option>
            {volunteerTypes.map((type) => (
              <option key={type.type_id} value={type.type_id}>
                {type.name} - {type.description}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        {showInstrumentSelect && (
          <Form.Group className="mb-3">
            <Form.Label>Musical Instrument</Form.Label>
            <Form.Select
              className="form-input"
              name="instrument"
              value={formData.instrument || ""}
              onChange={handleInputChange}
            >
              <option value="">Select an instrument</option>
              {instruments.map((instrument) => (
                <option 
                  key={instrument.instrument_id} 
                  value={instrument.instrument_id}
                  disabled={instrument.available_seats < formData.seats}
                >
                  {instrument.name} (Available: {instrument.available_seats})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}
        
        {formData.volunteerType && (
          <Form.Group className="mb-3">
            <Form.Label>Select Volunteer Laps</Form.Label>
            <div className="lap-selection-container">
              {volunteerLaps.length > 0 ? (
                volunteerLaps.map((lap) => (
                  <div 
                    key={lap.lap_id} 
                    className={`lap-card ${(formData.volunteerLaps || []).includes(lap.lap_id) ? 'selected' : ''}`}
                    onClick={() => {
                      const currentLaps = formData.volunteerLaps || [];
                      const newLaps = currentLaps.includes(lap.lap_id)
                        ? currentLaps.filter(id => id !== lap.lap_id)
                        : [...currentLaps, lap.lap_id];
                      setFormData({...formData, volunteerLaps: newLaps});
                    }}
                  >
                    <div className="lap-header">
                      <span className="lap-number">Lap {lap.lap_number}</span>
                      <input 
                        type="checkbox" 
                        name="volunteerLaps"
                        value={lap.lap_id}
                        checked={(formData.volunteerLaps || []).includes(lap.lap_id)}
                        onChange={() => {}} // Prevent default checkbox behavior
                        className="lap-checkbox"
                      />
                    </div>
                    <div className="lap-description">
                      {lap.route_description}
                      {lap.time && (
                        <div className="lap-time">
                          Time: {new Date(lap.time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No volunteer laps available</p>
              )}
            </div>
          </Form.Group>
        )}
      </>
    );
  };

  // Render stall-specific form
  const renderStallForm = () => {
    const { stallTypes, stallLocations } = eventOptions;
    
    return (
      <>
        <Form.Group className="mb-3">
          <Form.Label>Stall Type</Form.Label>
          <Form.Select
            className="form-input"
            name="stallType"
            value={formData.stallType || ""}
            onChange={handleInputChange}
          >
            <option value="">Select a stall type</option>
            {stallTypes.map((type) => (
              <option 
                key={type.type_id} 
                value={type.type_id}
                disabled={type.available_seats < formData.seats}
              >
                {type.name} (Available: {type.available_seats})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Stall Location</Form.Label>
          <Form.Select
            className="form-input"
            name="stallLocation"
            value={formData.stallLocation || ""}
            onChange={handleInputChange}
          >
            <option value="">Select a location</option>
            {stallLocations.map((location) => (
              <option 
                key={location.location_id} 
                value={location.location_id}
                disabled={location.available_seats < formData.seats}
              >
                {location.name} - {location.description} (Available: {location.available_seats})
              </option>
            ))}
          </Form.Select>
          <Form.Text className="text-muted">
            Choose the location where you want to set up your stall
          </Form.Text>
        </Form.Group>
        
        {showFoodInput && (
          <Form.Group className="mb-3">
            <Form.Label>Food Items</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter food items you'll be selling"
              className="form-input"
              name="foodItems"
              value={formData.foodItems || ""}
              onChange={handleInputChange}
            />
            <Form.Text className="text-muted">
              Please list the food items you'll be offering at your stall
            </Form.Text>
          </Form.Group>
        )}
        
        {showDrinksInput && (
          <Form.Group className="mb-3">
            <Form.Label>Drinks</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter drinks you'll be selling"
              className="form-input"
              name="drinks"
              value={formData.drinks || ""}
              onChange={handleInputChange}
            />
            <Form.Text className="text-muted">
              Please list the drinks you'll be offering at your stall
            </Form.Text>
          </Form.Group>
        )}
      </>
    );
  };

  return (
    <>
      <ToastContainer />
      
      <Modal show={show} onHide={handleClose} centered className="registration-modal" size="lg">
        <div
          className="modal-header-custom"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getHeaderImage()})`,
          }}
        >
          <h2 className="modal-title-custom">{getTitle()}</h2>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={handleClose} 
            aria-label="Close"
          ></button>
        </div>
        
        <Modal.Body className="custom-modal-body">
          {renderForm()}
        </Modal.Body>
      </Modal>
      
      {/* Ticket Payment Modal - Only shown for rally registration */}
      <BhintunaTicketPayment 
        show={showTicketPaymentModal}
        handleClose={handleCloseTicketPayment}
        eventRegistrationId={registeredEventRegistrationId}
      />
    </>
  );
}

export default RegistrationModal;