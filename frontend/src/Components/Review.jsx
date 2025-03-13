import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const CreateReview = () => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token"); // Assuming you store auth token
      await axios.post(
        "http://localhost:8000/pandit_booking/booking/reviews/create/",
        {
          booking_id: bookingId,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(true);
      setTimeout(() => {
        navigate("/my-bookings"); // Redirect to bookings page
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Rate & Review Your Experience</h3>
            </div>
            <div className="card-body">
              {success ? (
                <div className="alert alert-success">
                  Your review has been submitted successfully! Redirecting...
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && <div className="alert alert-danger">{error}</div>}
                  
                  <div className="mb-3">
                    <label htmlFor="rating" className="form-label">
                      Rating
                    </label>
                    <div className="rating-input">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div className="form-check form-check-inline" key={star}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="rating"
                            id={`star${star}`}
                            value={star}
                            checked={rating === star}
                            onChange={() => setRating(star)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`star${star}`}
                          >
                            {star} {star === 1 ? "Star" : "Stars"}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="comment" className="form-label">
                      Your Review
                    </label>
                    <textarea
                      className="form-control"
                      id="comment"
                      rows="4"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReview;