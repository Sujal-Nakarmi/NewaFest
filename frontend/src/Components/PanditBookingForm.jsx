import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios"; // Import axios
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/PanditBookingForm.css";
import NavBar from '../Components/NavBar';

const PanditBookingForm = () => {
  const { panditId } = useParams(); // Get Pandit ID from URL
  const location = useLocation();
  const pandit = location.state?.pandit || {}; // Get Pandit details from state

  const [bookingDate, setBookingDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const bookingData = {
        pandit: parseInt(panditId),  // Change to match backend expectations
        booking_date: bookingDate,   // Change field name to match API
        description: description,
      };
      

    try {
      const response = await axios.post(
        "http://localhost:8000/pandit_booking/bookings/create/",
        bookingData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, // If auth is required
          },
        }
      );

      if (response.status === 201) {
        alert("Booking successful!");
        setBookingDate("");
        setDescription("");
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error booking pandit:", error);
      alert(error.response?.data?.message || "Error booking pandit. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setBookingDate("");
    setDescription("");
  };

  return (
    <div className="container booking-form-container">
        <NavBar/><br/><br/>
      <form onSubmit={handleSubmit}>
        <div className="row mb-4">
          <div className="col-md-8">
            {/* Step 1 */}
            <div className="d-flex align-items-center mb-3">
              <div className="step-circle">1.</div>
              <h2 className="step-heading ms-3">Select Date and Time</h2>
            </div>

            <div className="mb-4">
              <label htmlFor="dateTime" className="form-label fw-bold">Select Date and Time</label>
              <input 
                type="datetime-local" 
                className="form-control" 
                id="dateTime" 
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="col-md-4 text-center">
            <div className="pandit-profile">
              <div className="pandit-avatar mx-auto"></div>
              <p className="pandit-name mt-2 mb-0">{pandit.user?.full_name || "Pandit Name"}</p>
              <p className="pandit-address">{pandit.user?.address || "Pandit Address"}</p>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Step 2 */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <div className="step-circle">2.</div>
            <h2 className="step-heading ms-3">Description</h2>
          </div>

          <textarea 
            className="form-control description-textarea" 
            rows="6" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe your requirements..."
            required
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="text-center mt-5">
          <button type="submit" className="btn submit-btn me-3" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button type="button" className="btn cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PanditBookingForm;
