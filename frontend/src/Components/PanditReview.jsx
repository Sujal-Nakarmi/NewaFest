import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const PanditReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { panditId } = useParams();

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
          <h2>Pandit Reviews</h2>
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