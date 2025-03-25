import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./NavBar";
import { Button } from 'react-bootstrap'; // Ensure this is imported
import { FaArrowLeft } from 'react-icons/fa'; // Ensure this is imported

const PanditReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { panditId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/pandit_booking/booking/reviews/pandit/${panditId}/`);
        setReviews(response.data.results); // Access paginated results
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch reviews");
        setLoading(false);
      }
    };

    fetchReviews();
  }, [panditId]);

  if (loading) return <div className="container mt-5">Loading reviews...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
        <NavBar /><br/><br/><br/>
          <h2>Pandit Reviews</h2>
          <Button 
              variant="outline-secondary" 
              onClick={() => navigate("/Ihi")}
              className="d-flex align-items-center"
            >
              <FaArrowLeft className="me-2" />
              Back to Bookings
            </Button><br/>
          {reviews.length === 0 ? (
            <p>No reviews yet for this pandit.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.review_id} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title">{review.user.full_name}</h5>
                    <div className="badge bg-primary">
                      {review.rating} {Array(review.rating).fill("★").join("")}
                    </div>
                  </div>
                  <p className="card-text">{review.comment}</p>
                  <small className="text-muted">
                    {new Date(review.created_at).toLocaleDateString()}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PanditReviews;