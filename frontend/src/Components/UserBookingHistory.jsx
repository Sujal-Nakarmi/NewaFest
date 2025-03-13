import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/UserBooking.css";
import NavBar from "./NavBar";

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [reviewedBookings, setReviewedBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the token from local storage
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          navigate("/login");
          return;
        }

        console.log("Fetching bookings with token");

        // Fetch bookings
        const bookingsResponse = await axios.get("http://localhost:8000/pandit_booking/bookings/history/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("API Response:", bookingsResponse.data);

        // Extract the results array from the paginated response
        let bookingsData = [];
        if (bookingsResponse.data.results) {
          bookingsData = bookingsResponse.data.results;
        } else {
          // Handle non-paginated response
          bookingsData = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
        }
        
        // Fetch user reviews to check which bookings have been reviewed
        const reviewsResponse = await axios.get("http://localhost:8000/pandit_booking/booking/reviews/user/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Get booking IDs that have been reviewed
        const reviewedIds = reviewsResponse.data.results 
          ? reviewsResponse.data.results.map(review => review.booking.booking_id)
          : [];
          
        setReviewedBookings(reviewedIds);
        setBookings(bookingsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch your bookings: " + (err.response?.data?.detail || err.message));
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancelError(null);
      
      // Get the token from local storage
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(
        `http://localhost:8000/pandit_booking/bookings/cancellation/${bookingId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state to reflect the cancellation
      setBookings(
        bookings.map((booking) =>
          booking.booking_id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setCancelError(
        err.response?.data?.error || 
        "Failed to cancel booking. Please try again later."
      );
    }
  };

  // Check if a booking can be reviewed (completed and not already reviewed)
  const canReview = (booking) => {
    return booking.status === "accepted" && !reviewedBookings.includes(booking.booking_id);
  };

  const formatBookingDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning";
      case "accepted":
        return "bg-success";
      case "rejected":
        return "bg-danger";
      case "cancelled":
        return "bg-secondary";
      default:
        return "bg-info";
    }
  };

  // Helper to safely access nested properties
  const getPanditName = (booking) => {
    // Check if we have pandit_details in the API response
    if (booking.pandit_details && booking.pandit_details.user && booking.pandit_details.user.full_name) {
      return booking.pandit_details.user.full_name;
    }
    
    // Check the old path just in case
    if (booking.pandit && booking.pandit.user && booking.pandit.user.full_name) {
      return booking.pandit.user.full_name;
    }
    
    // This is showing user's own name, not the pandit's name
    if (booking.user_details && booking.user_details.full_name) {
      return "Unknown Pandit";  // Don't return user's name here
    }
    
    return "Unknown Pandit";
  };
  
  // Helper to get pandit ID
  const getPanditId = (booking) => {
    if (booking.pandit_details && booking.pandit_details.pandit_id) {
      return booking.pandit_details.pandit_id;
    }
    
    if (booking.pandit && booking.pandit.pandit_id) {
      return booking.pandit.pandit_id;
    }
    
    return null;
  };

  if (loading) return <div className="container mt-5 text-center"><p>Loading your bookings...</p></div>;
  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container user-bookings-container">
        <NavBar /><br/><br/><br/>
      <h1 className="bookings-heading mb-5">My Pandit Bookings</h1>
      
      {cancelError && (
        <div className="alert alert-danger" role="alert">
          {cancelError}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You don't have any bookings yet.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate("/pandit-booking")}
          >
            Book a Pandit
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Pandit Name</th>
                <th>Booking Date and Time</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>
                    {getPanditName(booking)}
                    {getPanditId(booking) && (
                      <div>
                        <small>
                          <a 
                            href={`/pandit-reviews/${getPanditId(booking)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/pandit-reviews/${getPanditId(booking)}`);
                            }}
                            className="text-decoration-none"
                          >
                            View Reviews
                          </a>
                        </small>
                      </div>
                    )}
                  </td>
                  <td>{formatBookingDate(booking.booking_date)}</td>
                  <td>{booking.description}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {(booking.status === "pending" || booking.status === "accepted") && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelBooking(booking.booking_id)}
                        disabled={
                          new Date(booking.booking_date) - new Date() < 24 * 60 * 60 * 1000
                        }
                      >
                        Cancel
                      </button>
                    )}
                    
                    {canReview(booking) && (
                      <button
                        className="btn btn-primary btn-sm ms-2"
                        onClick={() => navigate(`/create-review/${booking.booking_id}`)}
                      >
                        Review
                      </button>
                    )}
                    
                    {reviewedBookings.includes(booking.booking_id) && (
                      <span className="badge bg-info ms-2">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserBookings;