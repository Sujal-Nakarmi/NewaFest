import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/PanditBooking.css";

const PanditBooking = () => {
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

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

  if (loading) return <p>Loading pandits...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container pandit-booking-container">   
      <h1 className="pandit-heading mb-5">Pandit Booking</h1>
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {pandits.map((pandit) => (
          <div key={pandit.pandit_id} className="col">
            <div className="card pandit-card">
              <div className="card-body d-flex">
                <div className="pandit-avatar-container me-4">
                  <div className="pandit-avatar"></div>
                </div>
                <div className="pandit-info">
                  <h2 className="pandit-name">{pandit.user.full_name}</h2>
                  <p className="pandit-experience">Experience: {pandit.experience_years} years</p>
                  <p className="pandit-description">{pandit.experience_description}</p>
                  <p className="pandit-location">Location: {pandit.user.address}, {pandit.user.country}</p>
                  <p className="pandit-contact">Contact: {pandit.user.phone_number}</p>
                  <button className="book-btn" onClick={() => handleBooking(pandit)}>
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
