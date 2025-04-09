import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from '../Components/NavBar';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Clock, Calendar, FileText, Check, MapPin, Edit } from "lucide-react";
import "../CSS/PanditBookingForm.css";
import { Form, Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click handler component
const LocationMarker = ({ setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const PanditBookingForm = () => {
  const { panditId } = useParams();
  const location = useLocation();
  const pandit = location.state?.pandit || {};
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Location selection state
  const [position, setPosition] = useState([27.7172, 85.3240]); // Default to Kathmandu
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [showLandmarkInput, setShowLandmarkInput] = useState(false);
  
  // Fetch pandit availability data
  useEffect(() => {
    const fetchAvailability = async () => {
      setAvailabilityLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8000/pandit_booking/pandits/${panditId}/availability/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        console.log("Availability data:", response.data);
        setAvailabilityData(response.data);
      } catch (error) {
        console.error("Error fetching pandit availability:", error);
        showErrorMessage("Unable to fetch pandit's availability schedule.");
      } finally {
        setAvailabilityLoading(false);
      }
    };

    if (panditId) {
      fetchAvailability();
    }
  }, [panditId]);

  // Reverse geocode to get address from coordinates
  useEffect(() => {
    const getAddressFromCoordinates = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        if (data && data.display_name) {
          setAddress(data.display_name);
        }
      } catch (error) {
        console.error("Error getting address:", error);
      }
    };

    if (position) {
      getAddressFromCoordinates();
    }
  }, [position]);

  // Check if a date is available based on availability data
  const isDateAvailable = (date) => {
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay(); 
    
    // Convert to API's format (0 = Monday, 6 = Sunday)
    const apiDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    console.log("Checking availability for:", {
      date: date.toDateString(),
      jsDay: dayOfWeek,
      apiDay: apiDayOfWeek
    });
    
    return availabilityData.some(slot => 
      slot.day_of_week === apiDayOfWeek && 
      slot.is_available
    );
  };

  // Update available time slots when date changes
  useEffect(() => {
    if (selectedDate && availabilityData.length > 0) {
      const dayOfWeek = selectedDate.getDay();
      // Convert to API's format (0 = Monday, 6 = Sunday)
      const apiDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      console.log("Selected date:", {
        date: selectedDate.toDateString(),
        jsDay: dayOfWeek,
        apiDay: apiDayOfWeek
      });
      
      const availableSlots = availabilityData
        .filter(slot => slot.day_of_week === apiDayOfWeek && slot.is_available)
        .map(slot => {
          // Convert API time format (HH:MM:SS) to AM/PM format for the UI
          const startParts = slot.start_time.split(':').map(Number);
          const endParts = slot.end_time.split(':').map(Number);
          
          const times = [];
          // Generate hourly slots within the available time range
          for (let hour = startParts[0]; hour < endParts[0]; hour++) {
            const hourFor12 = hour % 12 || 12;
            const period = hour < 12 ? 'AM' : 'PM';
            const formattedTime = `${hourFor12.toString().padStart(2, '0')}:00 ${period}`;
            times.push(formattedTime);
          }
          
          return times;
        })
        .flat();
      
      // Remove duplicates
      const uniqueSlots = [...new Set(availableSlots)];
      console.log("Available time slots:", uniqueSlots);
      setAvailableTimeSlots(uniqueSlots);
      
      // Clear selected time if it's not in the available slots
      if (selectedTime && !uniqueSlots.includes(selectedTime)) {
        setSelectedTime("");
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, availabilityData, selectedTime]);

  const getProfileImage = (pandit) => {
    if (pandit.user && pandit.user.profile_picture) {
      return `http://localhost:8000${pandit.user.profile_picture}`;
    }
    return "/assets/default-profile.png";
  };

  // Filter dates for date picker: only allow future dates and available days
  const filterAvailableDates = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && isDateAvailable(date);
  };

  // Function to combine date and time into a format that preserves timezone
  const combineDateTime = () => {
    if (!selectedDate || !selectedTime) return "";
    
    // Parse the time string more reliably
    const timeMatch = selectedTime.match(/(\d+):(\d+)\s*([AP]M)/i);
    if (!timeMatch) return "";
    
    let [_, hourStr, minuteStr, period] = timeMatch;
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    // Convert to 24-hour format
    if (period.toUpperCase() === "PM" && hour < 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
    
    // Create a new date object and set the time
    const dateObj = new Date(selectedDate);
    dateObj.setHours(hour, minute, 0, 0);
    
    // Create a date string in YYYY-MM-DDThh:mm:ss format without converting to UTC
    // This preserves the local time zone
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(hour).padStart(2, '0');
    const mins = String(minute).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}T${hours}:${mins}:00`;
    console.log("Combined date time (local):", formattedDate);
    return formattedDate;
  };

  const updateLandmark = () => {
    console.log("Landmark updated:", landmark);
    setShowLandmarkInput(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const bookingDateTime = combineDateTime();

    // Create booking data object with location information
    const bookingData = {
      pandit: parseInt(panditId),
      booking_date: bookingDateTime,
      description: description,
      // Updated: Using the full address for full_location
      full_location: address,
      // Keep landmark separate
      landmark: landmark,
      // Still include latitude/longitude for map functionality
      location_latitude: position[0],
      location_longitude: position[1]
    };
    
    console.log("Submitting booking data:", bookingData);

    try {
      const response = await axios.post(
        "http://localhost:8000/pandit_booking/bookings/create/",
        bookingData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.status === 201) {
        showSuccessMessage("Booking successful!");
        setSelectedDate(null);
        setSelectedTime("");
        setDescription("");
        setAddress("");
        setLandmark("");
        setPosition([27.7172, 85.3240]); // Reset to default position
      } else {
        showErrorMessage("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error booking pandit:", error);
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.details || 
                      "Error booking pandit. Please try again later.";
      showErrorMessage(errorMsg);
      setErrorMessage(JSON.stringify(error.response?.data || {}));
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message) => {
    const successAlert = document.createElement("div");
    successAlert.className = "pandit-booking-alert pandit-booking-alert-success";
    successAlert.innerHTML = `<div class="pandit-booking-alert-content"><span class="pandit-booking-alert-icon success me-2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>${message}</div>`;
    document.querySelector(".pandit-booking-form-container").prepend(successAlert);
    setTimeout(() => successAlert.remove(), 5000);
  };

  const showErrorMessage = (message) => {
    const errorAlert = document.createElement("div");
    errorAlert.className = "pandit-booking-alert pandit-booking-alert-danger";
    errorAlert.innerHTML = `<div class="pandit-booking-alert-content"><span class="pandit-booking-alert-icon error me-2">❌</span>${message}</div>`;
    document.querySelector(".pandit-booking-form-container").prepend(errorAlert);
    setTimeout(() => errorAlert.remove(), 5000);
  };

  const handleCancel = () => {
    setSelectedDate(null);
    setSelectedTime("");
    setDescription("");
    setAddress("");
    setLandmark("");
    setPosition([27.7172, 85.3240]); // Reset to default position
    navigate("/Ihi");
  };

  return (
    <div className="pandit-booking-page-wrapper">
      <NavBar /><br/><br/><br/>
      <div className="container pandit-booking-form-container">
        <div className="card pandit-booking-card shadow">
          <div className="card-body p-4 p-md-5">
            <h1 className="pandit-booking-card-title text-center mb-4">Book a Pandit</h1>
            
            {availabilityLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading availability data...</span>
                </div>
                <p className="mt-3">Loading availability data...</p>
              </div>
            ) : availabilityData.length === 0 ? (
              <div className="alert alert-warning text-center">
                This pandit hasn't set their availability schedule yet. Please try again later.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row mb-5">
                  <div className="col-lg-8">
                    {/* Step 1 */}
                    <div className="d-flex align-items-center mb-4">
                      <div className="pandit-booking-step-circle">1.</div>
                      <h2 className="pandit-booking-step-heading ms-3">Select Date and Time</h2>
                    </div>

                    <div className="ps-5">
                      {/* Date Selection */}
                      <div className="form-group mb-4">
                        <label htmlFor="bookingDate" className="pandit-booking-form-label d-flex align-items-center">
                          <Calendar size={18} className="me-2" /> Select Date
                        </label>
                        <div className="pandit-booking-date-picker-container">
                          <DatePicker
                            selected={selectedDate}
                            onChange={date => setSelectedDate(date)}
                            filterDate={filterAvailableDates}
                            dateFormat="MMMM d, yyyy"
                            minDate={new Date()}
                            placeholderText="Select an available date"
                            className="form-control pandit-booking-form-control"
                            id="bookingDate"
                            required
                            highlightDates={[
                              {
                                selectable: true,
                                match: (date) => filterAvailableDates(date),
                                className: 'pandit-available-date'
                              }
                            ]}
                          />
                        </div>
                        <small className="text-muted">Only dates when the pandit is available are selectable.</small>
                      </div>
                      
                      {/* Time Selection */}
                      <div className="form-group mb-4">
                        <label htmlFor="bookingTime" className="pandit-booking-form-label d-flex align-items-center">
                          <Clock size={18} className="me-2" /> Select Time
                        </label>
                        <div className="pandit-booking-time-slot-container">
                          {selectedDate ? (
                            availableTimeSlots.length > 0 ? (
                              availableTimeSlots.map((time, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className={`pandit-booking-time-slot-btn ${selectedTime === time ? 'active' : ''}`}
                                  onClick={() => setSelectedTime(time)}
                                >
                                  {time}
                                </button>
                              ))
                            ) : (
                              <p className="text-muted">No available time slots for this date.</p>
                            )
                          ) : (
                            <p className="text-muted">Please select a date first to view available time slots.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pandit Profile Card */}
                  <div className="col-lg-4">
                    <div className="pandit-booking-profile-card text-center">
                      <div className="pandit-booking-avatar mx-auto mb-3">
                        <img 
                          src={getProfileImage(pandit)} 
                          alt={`${pandit.user?.full_name || "Pandit Profile"}`} 
                          className="profile-image rounded-circle"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/default-profile.png";
                          }}
                        />
                      </div>
                      <h3 className="pandit-booking-name mb-2">{pandit.user?.full_name || "Pandit Baje Nepal"}</h3>
                      <p className="pandit-booking-address mb-3">{pandit.user?.address || "Patan, Nepal"}</p>
                      <p>
                        <strong>Experience Years:</strong> <span className="pandit-booking-address">{pandit.experience_years || "N/A"}</span>
                      </p>
                      
                      <div className="pandit-booking-rating mb-2">
                        <span>Rating: </span>
                        <span className="pandit-booking-rating-value">
                          {pandit.average_rating ? pandit.average_rating.toFixed(1) : "No ratings"}
                        </span>
                        {pandit.average_rating ? (
                          <span className="pandit-booking-rating-stars text-warning">★</span>
                        ) : null}
                        <span className="pandit-booking-review-count">
                          ({pandit.total_reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="pandit-booking-divider" />

                {/* Step 2 */}
                <div className="mb-5">
                  <div className="d-flex align-items-center mb-4">
                    <div className="pandit-booking-step-circle">2.</div>
                    <h2 className="pandit-booking-step-heading ms-3">Description</h2>
                  </div>

                  <div className="form-group ps-5">
                    <label htmlFor="description" className="pandit-booking-form-label d-flex align-items-center">
                      <FileText size={18} className="me-2" /> Please describe your requirements
                    </label>
                    <textarea 
                      id="description"
                      className="form-control pandit-booking-description-textarea" 
                      rows="6" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please describe the type of ceremony, number of guests, any special requirements..."
                      required
                    ></textarea>
                  </div>
                </div>

                <hr className="pandit-booking-divider" />

                {/* Step 3: Location Selection with Map */}
                <div className="mb-5">
                  <div className="d-flex align-items-center mb-4">
                    <div className="pandit-booking-step-circle">3.</div>
                    <h2 className="pandit-booking-step-heading ms-3">Select Location</h2>
                  </div>

                  <div className="ps-5">
                    <div className="location-selection-container">
                      {/* Map Component */}
                      <div className="map-container mb-4" style={{ height: "400px", width: "100%" }}>
                        <MapContainer 
                          center={position} 
                          zoom={13} 
                          style={{ height: "100%", width: "100%" }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <LocationMarker setPosition={setPosition} />
                          {position && (
                            <Marker position={position}>
                              <Popup>
                                Selected Location<br />
                                {address || "Click to select this location"}
                              </Popup>
                            </Marker>
                          )}
                        </MapContainer>
                        <small className="text-muted mt-2 d-block">Click on the map to select your ceremony location.</small>
                      </div>

                      {/* Selected Location Display */}
                      {address && (
                        <div className="selected-location mt-3 mb-3">
                          <div className="d-flex align-items-start">
                            <MapPin size={18} className="mt-1 me-2" />
                            <div>
                              <h6 className="mb-1">Selected Location:</h6>
                              <div className="location-hierarchy">
                                <p className="mb-1">{address}</p>
                              </div>
                              
                              {showLandmarkInput ? (
                                <div className="landmark-section mt-2">
                                  <div className="landmark-input-container">
                                    <Form.Group>
                                      <Form.Label>Landmark / Detailed Address:</Form.Label>
                                      <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Enter nearby landmark or detailed address (e.g., Near City Hospital, Blue Building, etc.)"
                                        value={landmark}
                                        onChange={(e) => setLandmark(e.target.value)}
                                      />
                                      <div className="d-flex mt-2">
                                        <Button 
                                          size="sm" 
                                          onClick={updateLandmark}
                                          disabled={!landmark.trim()}
                                          className="me-2"
                                          style={{ backgroundColor: "#8B0000", color: "white", border: "none" }}
                                        >
                                          Save
                                        </Button>
                                        <Button 
                                          variant="outline-secondary" 
                                          size="sm"
                                          onClick={() => setShowLandmarkInput(false)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </Form.Group>
                                  </div>
                                </div>
                              ) : landmark ? (
                                <div className="landmark-section mt-2">
                                  <div className="d-flex align-items-center">
                                    <div className="landmark-display">
                                      <span className="text-muted">Landmark: </span>
                                      <span>{landmark}</span>
                                      <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="p-0 ms-2"
                                        onClick={() => setShowLandmarkInput(true)}
                                      >
                                        <Edit size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  className="w-100 mt-2"
                                  onClick={() => setShowLandmarkInput(true)}
                                >
                                  + Add Landmark
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                {(selectedDate || selectedTime || description || address) && (
                  <div className="pandit-booking-summary mb-5">
                    <h3 className="pandit-booking-summary-title">Booking Summary</h3>
                    <div className="pandit-booking-summary-details">
                      {selectedDate && (
                        <div className="pandit-booking-summary-item">
                          <span className="pandit-booking-summary-label">Date:</span>
                          <span className="pandit-booking-summary-value">{selectedDate.toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</span>
                        </div>
                      )}
                      {selectedTime && (
                        <div className="pandit-booking-summary-item">
                          <span className="pandit-booking-summary-label">Time:</span>
                          <span className="pandit-booking-summary-value">{selectedTime}</span>
                        </div>
                      )}
                      {address && (
                        <div className="pandit-booking-summary-item">
                          <span className="pandit-booking-summary-label">Location:</span>
                          <span className="pandit-booking-summary-value">
                            {address}
                            {landmark && <span> ({landmark})</span>}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="alert alert-danger">
                    <strong>Debug Info:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{errorMessage}</pre>
                  </div>
                )}

                {/* Buttons */}
                <div className="text-center mt-5">
                  <button 
                    type="submit" 
                    className="btn pandit-booking-submit-btn me-3" 
                    disabled={loading || !selectedDate || !selectedTime || !address}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : "Confirm Booking"}
                  </button>
                  <button type="button" className="btn pandit-booking-cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanditBookingForm;