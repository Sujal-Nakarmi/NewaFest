import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../CSS/BhintunaRegistrationModal.css";

function RegistrationModal({ show, handleClose, eventType, categoryId }) {
  const { eventDetailId } = useParams();
  const [formData, setFormData] = useState({});
  const [rallyOptions, setRallyOptions] = useState([]);
  const [laps, setLaps] = useState([]);
  const [selectedLaps, setSelectedLaps] = useState([]);
  const [selectedRallyOption, setSelectedRallyOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seatsRequested, setSeatsRequested] = useState(1);
  
  // Volunteer-specific state
  const [volunteerTypes, setVolunteerTypes] = useState([]);
  const [volunteerLaps, setVolunteerLaps] = useState([]);
  const [selectedVolunteerLaps, setSelectedVolunteerLaps] = useState([]);
  const [selectedVolunteerType, setSelectedVolunteerType] = useState(null);
  const [newariInstruments, setNewariInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [showInstrumentSelect, setShowInstrumentSelect] = useState(false);

  // Stall-specific state
  const [stallTypes, setStallTypes] = useState([]);
  const [selectedStallType, setSelectedStallType] = useState(null);
  const [showFoodInput, setShowFoodInput] = useState(false);
  const [showDrinksInput, setShowDrinksInput] = useState(false);
  const [stallLocations, setStallLocations] = useState([]);
  const [selectedStallLocation, setSelectedStallLocation] = useState(null);

  useEffect(() => {
    if (eventType === "rally") {
      fetchRallyOptions();
      fetchLaps();
    } else if (eventType === "volunteer") {
      fetchVolunteerTypes();
      fetchVolunteerLaps();
      fetchNewariInstruments();
    } else if (eventType === "stall") {
      fetchStallTypes();
      fetchStallLocations();
    }
  }, [eventType]);

  const fetchStallTypes = async () => {
    try {
      const response = await axios.get("http://localhost:8000/adminwork/events/stalltypes/");
      setStallTypes(response.data);
    } catch (error) {
      console.error("Error fetching stall types:", error);
    }
  };

  const fetchStallLocations = async () => {
    try {
      const response = await axios.get("http://localhost:8000/adminwork/events/stalllocations/");
      setStallLocations(response.data);
    } catch (error) {
      console.error("Error fetching stall locations:", error);
    }
  };

  const fetchRallyOptions = async () => {
    try {
      const response = await axios.get("http://localhost:8000/adminwork/events/rallyoptions/");
      setRallyOptions(response.data);
    } catch (error) {
      console.error("Error fetching rally options:", error);
    }
  };

  const fetchLaps = async () => {
    try {
      const response = await axios.get("http://localhost:8000/adminwork/events/rallylaps/");
      setLaps(response.data);
    } catch (error) {
      console.error("Error fetching laps:", error);
    }
  };

  const fetchVolunteerTypes = async () => {
    try {
      const response = await axios.get("http://localhost:8000/adminwork/events/volunteertypes/");
      setVolunteerTypes(response.data);
    } catch (error) {
      console.error("Error fetching volunteer types:", error);
    }
  };

  const fetchVolunteerLaps = async () => {
    try {
      const response = await axios.get("http://localhost:8000/adminwork/events/volunteerlaps/");
      setVolunteerLaps(response.data);
    } catch (error) {
      console.error("Error fetching volunteer laps:", error);
    }
  };

  const fetchNewariInstruments = async () => {
    try {
      const response = await axios.get("http://localhost:8000/adminwork/events/newariinstruments/");
      setNewariInstruments(response.data);
    } catch (error) {
      console.error("Error fetching Newari instruments:", error);
    }
  };

  const handleRallyOptionChange = (e) => {
    const optionId = parseInt(e.target.value);
    setSelectedRallyOption(optionId);
    setFormData({ ...formData, rally_option: optionId });
    // Clear previously selected laps when changing rally option
    setSelectedLaps([]);
  };

  const handleVolunteerTypeChange = (e) => {
    const typeId = parseInt(e.target.value);
    setSelectedVolunteerType(typeId);
    setFormData({ ...formData, volunteer_type: typeId });
    
    // Clear previously selected laps when changing volunteer type
    setSelectedVolunteerLaps([]);
    
    // Find the volunteer type to check if it's music
    const volunteerType = volunteerTypes.find(type => type.type_id === typeId);
    
    if (volunteerType && volunteerType.code === 'Music') {
      setShowInstrumentSelect(true);
    } else {
      setShowInstrumentSelect(false);
      setSelectedInstrument(null);
      // Remove newari_instrument from formData if it exists
      const updatedFormData = { ...formData, volunteer_type: typeId };
      delete updatedFormData.newari_instrument;
      setFormData(updatedFormData);
    }
  };

  const handleStallTypeChange = (e) => {
    const typeId = parseInt(e.target.value);
    setSelectedStallType(typeId);
    setFormData({ ...formData, stall_type: typeId });
    
    // Find the stall type to check what it is
    const stallType = stallTypes.find(type => type.type_id === typeId);
    
    // Show/hide inputs based on stall type
    if (stallType) {
      setShowFoodInput(stallType.code === 'FOOD');
      setShowDrinksInput(stallType.code === 'DRINKS');
      
      // Reset form values if changing stall type
      const updatedFormData = { ...formData, stall_type: typeId };
      if (stallType.code !== 'FOOD') {
        delete updatedFormData.food_items;
      }
      if (stallType.code !== 'DRINKS') {
        delete updatedFormData.drinks;
      }
      setFormData(updatedFormData);
    }
  };

  const handleStallLocationChange = (e) => {
    const locationId = parseInt(e.target.value);
    setSelectedStallLocation(locationId);
    setFormData({ ...formData, stall_location: locationId });
  };

  const handleInstrumentChange = (e) => {
    const instrumentId = parseInt(e.target.value);
    setSelectedInstrument(instrumentId);
    setFormData({ ...formData, newari_instrument: instrumentId });
  };

  const handleSeatsChange = (e) => {
    const seats = parseInt(e.target.value);
    setSeatsRequested(seats);
  };

  const getHeaderImage = (type) => {
    switch (type) {
      case "rally":
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-07%20at%2012.02.35%E2%80%AFAM-uloRB0rddzPTOOHBTfwdV47XBpDee5.png";
      case "music":
        return "music-background.jpg";
      case "stall":
        return "stalls-background.jpg";
      case "volunteer":
        return "volunteer-background.jpg";
      default:
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-07%20at%2012.02.35%E2%80%AFAM-uloRB0rddzPTOOHBTfwdV47XBpDee5.png";
    }
  };

  const getTitle = (type) => {
    switch (type) {
      case "rally":
        return "Rally Participation";
      case "stall":
        return "Stalls Registration";
      case "volunteer":
        return "Volunteer Registration";
      default:
        return "Registration";
    }
  };

  // Filter laps based on the selected rally option
  const filteredLaps = laps.filter(lap => lap.rally_option === selectedRallyOption);

  const getSeatsInput = () => (
    <Form.Group className="mb-3">
      <Form.Label>Number of Seats</Form.Label><br/>
      <Form.Text className="text-muted">
        How many seats do you want to register? (Maximum allowed 5 seats)
      </Form.Text>
      <Form.Control
        type="number"
        className="form-input"
        min="1"
        max="10"
        value={seatsRequested}
        onChange={handleSeatsChange}
      />
     
    </Form.Group>
  );

  const getSpecialField = (type) => {
    switch (type) {
      case "rally":
        return (
          <>
            {getSeatsInput()}
            <Form.Group className="mb-3">
              <Form.Label>Rally Option</Form.Label>
              <Form.Select
                className="form-input"
                onChange={handleRallyOptionChange}
              >
                <option value="">Select an option</option>
                {rallyOptions.map((option) => (
                  <option 
                    key={option.option_id} 
                    value={option.option_id}
                    disabled={option.available_seats < seatsRequested}
                  >
                    {option.name} (Available Seats: {option.available_seats})
                  </option>
                ))}
              </Form.Select>
              
              {selectedRallyOption && (
                <>
                  <Form.Label className="mt-3">Select Laps</Form.Label>
                  {filteredLaps.length > 0 ? (
                    filteredLaps.map((lap) => (
                      <Form.Check
                        key={lap.lap_id}
                        type="checkbox"
                        label={`Lap ${lap.lap_number} - ${lap.route_description}`}
                        value={lap.lap_id}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setSelectedLaps(prev =>
                            e.target.checked ? [...prev, value] : prev.filter(id => id !== value)
                          );
                        }}
                      />
                    ))
                  ) : (
                    <p>No laps available for this option</p>
                  )}
                </>
              )}
            </Form.Group>
          </>
        );

      case "stall":
        return (
          <>
            {getSeatsInput()}
            <Form.Group className="mb-3">
              <Form.Label>Stall Type</Form.Label>
              <Form.Select
                className="form-input"
                onChange={handleStallTypeChange}
              >
                <option value="">Select a stall type</option>
                {stallTypes.map((type) => (
                  <option 
                    key={type.type_id} 
                    value={type.type_id}
                    disabled={type.available_seats < seatsRequested}
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
                onChange={handleStallLocationChange}
              >
                <option value="">Select a location</option>
                {stallLocations.map((location) => (
                  <option 
                    key={location.location_id} 
                    value={location.location_id}
                    disabled={location.available_seats < seatsRequested}
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
                  onChange={(e) => setFormData({ ...formData, food_items: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, drinks: e.target.value })}
                />
                <Form.Text className="text-muted">
                  Please list the drinks you'll be offering at your stall
                </Form.Text>
              </Form.Group>
            )}
          </>
        );

      case "volunteer":
        return (
          <>
            {getSeatsInput()}
            <Form.Group className="mb-3">
              <Form.Label>Volunteer Type</Form.Label>
              <Form.Select
                className="form-input"
                onChange={handleVolunteerTypeChange}
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
                  onChange={handleInstrumentChange}
                >
                  <option value="">Select an instrument</option>
                  {newariInstruments.map((instrument) => (
                    <option 
                      key={instrument.instrument_id} 
                      value={instrument.instrument_id}
                      disabled={instrument.available_seats < seatsRequested}
                    >
                      {instrument.name} (Available: {instrument.available_seats})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            {selectedVolunteerType && (
              <>
                <Form.Label className="mt-3">Select Volunteer Laps</Form.Label>
                {volunteerLaps.length > 0 ? (
                  volunteerLaps.map((lap) => (
                    <Form.Check
                      key={lap.lap_id}
                      type="checkbox"
                      label={`Lap ${lap.lap_number} - ${lap.route_description} ${lap.time ? `- Time: ${new Date(lap.time).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}` : ''}`}
                      value={lap.lap_id}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setSelectedVolunteerLaps(prev =>
                          e.target.checked ? [...prev, value] : prev.filter(id => id !== value)
                        );
                      }}
                    />
                  ))
                ) : (
                  <p>No volunteer laps available</p>
                )}
              </>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      toast.error("You must be logged in to register!");
      return;
    }
    
    // Prepare the data based on form type
    const registrationData = {
      event_detail: parseInt(eventDetailId),
      category: categoryId,
      seats_requested: seatsRequested
    };
    
    // Add rally-specific data if applicable
    if (eventType === "rally") {
      if (!formData.rally_option) {
        toast.error("Please select a rally option");
        return;
      }
      if (selectedLaps.length === 0) {
        toast.error("Please select at least one lap");
        return;
      }
      registrationData.rally_option = formData.rally_option;
      registrationData.rally_laps = selectedLaps;
    }
    
    // Add volunteer-specific data if applicable
    if (eventType === "volunteer") {
      if (!formData.volunteer_type) {
        toast.error("Please select a volunteer type");
        return;
      }
      if (selectedVolunteerLaps.length === 0) {
        toast.error("Please select at least one volunteer lap");
        return;
      }
      registrationData.volunteer_type = formData.volunteer_type;
      registrationData.volunteer_laps = selectedVolunteerLaps;
      
      // Add instrument data if applicable
      if (showInstrumentSelect) {
        if (!formData.newari_instrument) {
          toast.error("Please select a musical instrument");
          return;
        }
        registrationData.newari_instrument = formData.newari_instrument;
      }
    }
    
    // Add stall-specific data if applicable
    if (eventType === "stall") {
      if (!formData.stall_type) {
        toast.error("Please select a stall type");
        return;
      }
      if (!formData.stall_location) {
        toast.error("Please select a stall location");
        return;
      }
      registrationData.stall_type = formData.stall_type;
      registrationData.stall_location = formData.stall_location;
      
      // Add food items if applicable
      if (showFoodInput && !formData.food_items) {
        toast.error("Please enter food items information");
        return;
      }
      
      // Add drinks if applicable
      if (showDrinksInput && !formData.drinks) {
        toast.error("Please enter drinks information");
        return;
      }
      
      if (formData.food_items) {
        registrationData.food_items = formData.food_items;
      }
      
      if (formData.drinks) {
        registrationData.drinks = formData.drinks;
      }
    }
    
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
      
      console.log("Registration success:", response.data);
      toast.success(`Successfully registered ${seatsRequested} seat(s)!`);
      setTimeout(() => {
        handleClose();
        window.location.reload(); // Refresh the page after successful registration
      }, 2000); // Give time for toast to show before refresh
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.data) {
        // Show specific error message from the backend
        const errorMsg = typeof error.response.data === 'object' ? 
          JSON.stringify(error.response.data) : 
          error.response.data;
        toast.error(`Error: ${errorMsg}`);
      
      } else {
        toast.error("There was an error registering for the event.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Toast container */}
      <ToastContainer />
      
      <Modal show={show} onHide={handleClose} centered className="registration-modal" size="lg">
        <div
          className="modal-header-custom"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getHeaderImage(eventType)})`,
          }}
        >
          <h2 className="modal-title-custom">{getTitle(eventType)}</h2>
          <button type="button" className="btn-close btn-close-white" onClick={handleClose} aria-label="Close"></button>
        </div>
        
        <Modal.Body className="custom-modal-body">
          <Form onSubmit={handleSubmit}>
            {getSpecialField(eventType)}
            
            <div className="button-container">
              <Button
                className="register-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
              <Button className="cancel-button" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default RegistrationModal;