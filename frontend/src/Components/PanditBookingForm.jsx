import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from '../Components/NavBar';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Clock, Calendar, FileText, Check } from "lucide-react";
import "../CSS/PanditBookingForm.css"

const PanditBookingForm = () => {
  const { panditId } = useParams();
  const location = useLocation();
  const pandit = location.state?.pandit || {};
  const navigate = useNavigate(); // Initialize navigate


  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Predefined time slots
  const timeSlots = [
    "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM"
  ];

  // Function to combine date and time into ISO format
  const combineDateTime = () => {
    if (!selectedDate || !selectedTime) return "";
    
    const [hourStr, minuteStr, period] = selectedTime.match(/(\d+):(\d+) ([AP]M)/).slice(1);
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    // Convert to 24-hour format
    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    
    const dateObj = new Date(selectedDate);
    dateObj.setHours(hour, minute, 0);
    return dateObj.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const bookingDateTime = combineDateTime();

    const bookingData = {
      pandit: parseInt(panditId),
      booking_date: bookingDateTime,
      description: description,
    };

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
      } else {
        showErrorMessage("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error booking pandit:", error);
      showErrorMessage(error.response?.data?.message || "Error booking pandit. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message) => {
    const successAlert = document.createElement("div");
    successAlert.className = "alert alert-success booking-alert";
    successAlert.innerHTML = `<div class="d-flex align-items-center"><span class="alert-icon success me-2"><Check size={18} /></span>${message}</div>`;
    document.querySelector(".booking-form-container").prepend(successAlert);
    setTimeout(() => successAlert.remove(), 5000);
  };

  const showErrorMessage = (message) => {
    const errorAlert = document.createElement("div");
    errorAlert.className = "alert alert-danger booking-alert";
    errorAlert.innerHTML = `<div class="d-flex align-items-center"><span class="alert-icon error me-2">❌</span>${message}</div>`;
    document.querySelector(".booking-form-container").prepend(errorAlert);
    setTimeout(() => errorAlert.remove(), 5000);
  };

  const handleCancel = () => {
    setSelectedDate(null);
    setSelectedTime("");
    setDescription("");
    navigate("/Ihi");
  };

  // Filter out past dates for date picker
  const filterPastDates = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  return (
    <div className="booking-page-wrapper">
      <NavBar /><br/><br/><br/>
      <div className="container booking-form-container">
        <div className="card shadow">
          <div className="card-body p-4 p-md-5">
            <h1 className="card-title text-center mb-4">Book a Pandit</h1>
            
            <form onSubmit={handleSubmit}>
              <div className="row mb-5">
                <div className="col-lg-8">
                  {/* Step 1 */}
                  <div className="d-flex align-items-center mb-4">
                    <div className="step-circle">1</div>
                    <h2 className="step-heading ms-3">Select Date and Time</h2>
                  </div>

                  <div className="ps-5">
                    {/* Date Selection */}
                    <div className="form-group mb-4">
                      <label htmlFor="bookingDate" className="form-label d-flex align-items-center">
                        <Calendar size={18} className="me-2" /> Select Date
                      </label>
                      <div className="date-picker-container">
                        <DatePicker
                          selected={selectedDate}
                          onChange={date => setSelectedDate(date)}
                          filterDate={filterPastDates}
                          dateFormat="MMMM d, yyyy"
                          minDate={new Date()}
                          placeholderText="Select a date"
                          className="form-control form-control-lg"
                          id="bookingDate"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Time Selection */}
                    <div className="form-group mb-4">
                      <label htmlFor="bookingTime" className="form-label d-flex align-items-center">
                        <Clock size={18} className="me-2" /> Select Time
                      </label>
                      <div className="time-slot-container">
                        {timeSlots.map((time, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`time-slot-btn ${selectedTime === time ? 'active' : ''}`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="pandit-profile-card text-center">
                    <div className="pandit-avatar mx-auto mb-3">
                      <img 
                        src="/api/placeholder/120/120" 
                        alt="Pandit" 
                        className="rounded-circle img-fluid"
                      />
                    </div>
                    <h3 className="pandit-name mb-2">{pandit.user?.full_name || "Pandit Baje Nepal"}</h3>
                    <p className="pandit-address mb-3">{pandit.user?.address || "Patan, Nepal"}</p>
                    <p>
  <strong>Experience Years:</strong> <span className="pandit-address">{pandit.experience_years || "Patan, Nepal"}</span>
</p>

                    
                    <div className="pandit-rating mb-2">
                    <span>Rating: </span>
                    <span className="rating-value">
                      {pandit.average_rating ? pandit.average_rating.toFixed(1) : "No ratings"}
                    </span>
                    {pandit.average_rating ? (
                      <span className="rating-stars text-warning">★</span>
                    ) : null}
                    <span className="review-count">
                      ({pandit.total_reviews} reviews)
                    </span>
                    </div>
                    
                    
                  </div>
                </div>
              </div>

              <hr className="divider" />

              {/* Step 2 */}
              <div className="mb-5">
                <div className="d-flex align-items-center mb-4">
                  <div className="step-circle">2</div>
                  <h2 className="step-heading ms-3">Description</h2>
                </div>

                <div className="form-group ps-5">
                  <label htmlFor="description" className="form-label d-flex align-items-center">
                    <FileText size={18} className="me-2" /> Please describe your requirements
                  </label>
                  <textarea 
                    id="description"
                    className="form-control description-textarea" 
                    rows="6" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the type of ceremony, number of guests, any special requirements..."
                    required
                  ></textarea>
                </div>
              </div>

              {/* Summary Section */}
              {(selectedDate || selectedTime || description) && (
                <div className="booking-summary mb-5">
                  <h3 className="summary-title">Booking Summary</h3>
                  <div className="summary-details">
                    {selectedDate && (
                      <div className="summary-item">
                        <span className="summary-label">Date:</span>
                        <span className="summary-value">{selectedDate.toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="summary-item">
                        <span className="summary-label">Time:</span>
                        <span className="summary-value">{selectedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="text-center mt-5">
                <button type="submit" className="btn submit-btn me-3" disabled={loading || !selectedDate || !selectedTime}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : "Confirm Booking"}
                </button>
                <button type="button" className="btn cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanditBookingForm;