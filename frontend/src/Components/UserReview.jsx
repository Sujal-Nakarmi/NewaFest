import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from 'react-bootstrap'; // Ensure this is imported
import { FaArrowLeft } from 'react-icons/fa'; // Ensure this is imported
import { useNavigate } from 'react-router-dom'; 
import NavBar from "./NavBar";

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          "http://localhost:8000/pandit_booking/booking/reviews/user/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // Check if data has results property or is an array directly
        const reviewData = response.data.results || response.data;
        setReviews(reviewData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to fetch your reviews");
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading your reviews...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
       <NavBar /><br/><br/><br/>
      <h2 className="mb-4">Your Reviews</h2>
      <Button 
              variant="outline-secondary" 
              onClick={() => navigate("/Ihi")}
              className="d-flex align-items-center"
            >
              <FaArrowLeft className="me-2" />
              Back to Bookings
            </Button><br/>
      {reviews.length === 0 ? (
        <div className="alert alert-info">You haven't written any reviews yet.</div>
      ) : (
        <div className="row">
          {reviews.map((review) => (
            <div key={review.review_id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <h5>{review.pandit?.user?.full_name || "Pandit"}</h5>
                  <span className="badge bg-primary">
                    {review.rating} {Array(review.rating).fill("★").join("")}
                  </span>
                </div>
                <div className="card-body">
                  <p>{review.comment}</p>
                </div>
                <div className="card-footer text-muted">
                  Reviewed on {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserReviews;