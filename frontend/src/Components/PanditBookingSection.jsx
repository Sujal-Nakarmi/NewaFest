import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactStars from "react-rating-stars-component";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/PanditBooking.css";
import AuthModal from "./LoginRequiredMessage";

const PanditBooking = () => {
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");
  const [authModalRedirectPath, setAuthModalRedirectPath] = useState("/login/user");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
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

  const viewReviews = (panditId) => {
    navigate(`/pandit-reviews/${panditId}`);
  };

  const handleAuthRequiredAction = (action, message, path = "/login/user") => {
    if (isAuthenticated) {
      if (action === "viewBookings") {
        navigate("/my-bookings");
      } else if (action === "viewReviews") {
        navigate("/my-reviews");
      }
    } else {
      localStorage.setItem("intendedAction", action);
      localStorage.setItem("returnUrl", window.location.pathname);
      setAuthModalMessage(message);
      setAuthModalRedirectPath(path);
      setAuthModalOpen(true);
    }
  };

  const getProfileImage = (pandit) => {
    if (pandit.user.profile_picture) {
      return `http://localhost:8000${pandit.user.profile_picture}`;
    }
    return "/assets/default-profile.png";
  };

  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading pandits...</span>
      </div>
      <p className="mt-2">Loading pandits...</p>
    </div>
  );
  
  if (error) return (
    <div className="container mt-5 alert alert-danger">
      <i className="fas fa-exclamation-circle me-2"></i>
      {error}
    </div>
  );

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pandit Booking</h2>
        <div>
          <button 
            className="btn history-booking me-2"
            onClick={() => handleAuthRequiredAction(
              "viewBookings", 
              "Please log in to view and manage your bookings."
            )}
          >
            <i className="fas fa-history me-1"></i> View My Bookings
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => handleAuthRequiredAction(
              "viewReviews", 
              "Please log in to view your reviews."
            )}
          >
            <i className="fas fa-comment me-1"></i> My Reviews
          </button>
        </div>
      </div>

      <div className="row">
        {pandits.map((pandit) => (
          <div className="col-md-6 col-lg-4 mb-4" key={pandit.pandit_id}>
            <div className="card h-100 shadow-sm">
              <div className="text-center pt-3">
                <div className="profile-image-container">
                  <img 
                    src={getProfileImage(pandit)} 
                    alt={`${pandit.user.full_name}`} 
                    className="profile-image rounded-circle"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/default-profile.png";
                    }}
                  />
                </div>
              </div>
              <div className="card-body">
                <h5 className="card-title text-center mb-3">{pandit.user.full_name}</h5>
                <div className="pandit-details">
                  <p className="card-text">
                    <i className="fas fa-briefcase me-2 text-primary"></i>
                    <strong>Experience:</strong> {pandit.experience_years} years
                  </p>
                  <p className="card-text">
                    <i className="fas fa-scroll me-2 text-primary"></i>
                    {pandit.experience_description}
                  </p>
                  <p className="card-text">
                    <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                    <strong>Location:</strong> {pandit.user.address}, {pandit.user.country}
                  </p>
                  <p className="card-text">
                    <i className="fas fa-phone me-2 text-primary"></i>
                    <strong>Contact:</strong> {pandit.user.phone_number}
                  </p>
                </div>
                <div className="rating-section mt-3 p-2 rounded" onClick={() => viewReviews(pandit.pandit_id)}>
                  <div className="d-flex align-items-center">
                    <div className="me-2 Rating">Rating:</div>
                    {pandit.average_rating ? (
                      <>
                        <div className="rating-value me-2">
                          {pandit.average_rating.toFixed(1)}
                        </div>
                        <ReactStars
                          count={5}
                          value={pandit.average_rating}
                          size={20}
                          edit={false}
                          isHalf={true}
                          emptyIcon={<i className="far fa-star"></i>}
                          halfIcon={<i className="fa fa-star-half-alt"></i>}
                          fullIcon={<i className="fa fa-star"></i>}
                          activeColor="#ffd700"
                        />
                      </>
                    ) : (
                      <span className="fst-italic text-muted">No ratings yet</span>
                    )}
                  </div>
                  <div className="review-count mt-1">
                    ({pandit.total_reviews} {pandit.total_reviews === 1 ? 'review' : 'reviews'})
                  </div>
                </div>
              </div>
              <div className="card-footer bg-white border-0 text-center pb-3">
                <button
                  className="btn btn-primary px-4 py-2 booking-btn"
                  onClick={() => handleBooking(pandit)}
                >
                  <i className="fas fa-calendar-check me-2"></i>
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pandits.length === 0 && !loading && (
        <div className="alert alert-info text-center">
          <i className="fas fa-info-circle me-2"></i>
          No pandits are currently available. Please check back later.
        </div>
      )}

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