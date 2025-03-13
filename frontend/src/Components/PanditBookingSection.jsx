import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/PanditBooking.css";

const PanditBooking = () => {
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    navigate(`/book-pandit/${pandit.pandit_id}`, { state: { pandit } });
  };

  // Added function to view pandit reviews
  const viewReviews = (panditId) => {
    navigate(`/pandit-reviews/${panditId}`);
  };

  if (loading) return <div className="container mt-5">Loading pandits...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pandit Booking</h2>
        <div>
          <Link to="/my-bookings" className="btn btn-outline-primary me-2">
            View My Bookings
          </Link>
          <Link to="/my-reviews" className="btn btn-outline-secondary">
            My Reviews
          </Link>
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
    </div>
  );
};

export default PanditBooking;