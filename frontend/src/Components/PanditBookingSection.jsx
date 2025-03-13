import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/PanditBooking.css";
import AuthModal from "./LoginRequiredMessage"; // Import the AuthModal component

const PanditBooking = () => {
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Add state for the auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");
  const [authModalRedirectPath, setAuthModalRedirectPath] = useState("/login/user");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);

    const fetchPandits = async () => {
      try {
        const response = await axios.get("http://localhost:8000/pandit_booking/pandits/");
        setPandits(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch pandits");
        setLoading(false);
      }
    };

    fetchPandits();
  }, []);

  const handleBooking = (pandit) => {
    if (isAuthenticated) {
      navigate(`/book-pandit/${pandit.pandit_id}`, { state: { pandit } });
    } else {
      setAuthModalMessage("Please log in to book a pandit.");
      setAuthModalRedirectPath("/login/user");
      setAuthModalOpen(true);
    }
  };

  // Added function to view pandit reviews
  const viewReviews = (panditId) => {
    navigate(`/pandit-reviews/${panditId}`);
  };

  // Function to handle navigation that requires authentication
  const handleAuthRequiredAction = (action, message, path = "/login/user") => {
    if (isAuthenticated) {
      // User is authenticated, proceed with navigation
      if (action === "viewBookings") {
        navigate("/my-bookings");
      } else if (action === "viewReviews") {
        navigate("/my-reviews");
      }
    } else {
      // Store the intended action in local storage
      localStorage.setItem("intendedAction", action);
      // Store the current URL to return to after login
      localStorage.setItem("returnUrl", window.location.pathname);
      
      // User is not authenticated, show the modal
      setAuthModalMessage(message);
      setAuthModalRedirectPath(path);
      setAuthModalOpen(true);
    }
  };

  if (loading) return <div className="container mt-5">Loading pandits...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pandit Booking</h2>
        <div>
          {/* Replace Link components with buttons that check authentication */}
          <button 
            className="btn btn-outline-primary me-2"
            onClick={() => handleAuthRequiredAction(
              "viewBookings", 
              "Please log in to view and manage your bookings."
            )}
          >
            View My Bookings
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => handleAuthRequiredAction(
              "viewReviews", 
              "Please log in to view your reviews."
            )}
          >
            My Reviews
          </button>
        </div>
      </div>

      <div className="row">
        {pandits.map((pandit) => (
          <div className="col-md-6 col-lg-4 mb-4" key={pandit.pandit_id}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{pandit.user.full_name}</h5>
                <p className="card-text">
                  <strong>Experience:</strong> {pandit.experience_years} years
                </p>
                <p className="card-text">{pandit.experience_description}</p>
                <p className="card-text">
                  <strong>Location:</strong> {pandit.user.address}, {pandit.user.country}
                </p>
                <p className="card-text">
                  <strong>Contact:</strong> {pandit.user.phone_number}
                </p>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="rating-display" onClick={() => viewReviews(pandit.pandit_id)}>
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
                  <button
                    className="btn btn-primary"
                    onClick={() => handleBooking(pandit)}
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Include the AuthModal component */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        message={authModalMessage}
        redirectPath={authModalRedirectPath}
      />
    </div>
  );
};

export default PanditBooking;