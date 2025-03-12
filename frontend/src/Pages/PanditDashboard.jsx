import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../CSS/PanditDashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from '../Components/NavBar';
const API_URL = 'http://localhost:8000/pandit_booking/bookings/';

const BookingCard = ({ booking, updateBookingStatus }) => {
  const handleStatusChange = (status) => {
    updateBookingStatus(booking.booking_id, status);
  };

  return (

   
    <div className="booking-card">
      <div className="booking-header">
        <div className="user-info">
          <div className="user-avatar"></div>
          <div className="user-details">
            <h3 className="user-name">{booking.user_details.full_name}</h3>
            <div className="user-meta">
              <span className="user-email">{booking.user_details.email}</span>
              <span className="booking-date">{new Date(booking.booking_date).toLocaleString()}</span>
            </div>
            <div className="user-phone">{booking.user_details.phone_number}</div>
          </div>
        </div>
      </div>
      <div className="booking-description">
        <p>{booking.description}</p>
      </div>
      <div className="booking-actions">
        <button className="btn btn-accept" onClick={() => handleStatusChange('accepted')}>
          Accept
        </button>
        <button className="btn btn-reject" onClick={() => handleStatusChange('rejected')}>
          Reject
        </button>
      </div>
      <p className="status-text">Status: {booking.status}</p>
    </div>
  );
};

const PanditDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('access_token');

        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setBookings(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await axios.put(
        `${API_URL}${bookingId}/status/`, // Dynamic booking ID
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update the booking status in the UI
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.booking_id === bookingId ? { ...booking, status } : booking
        )
      );

      console.log('Booking status updated:', response.data);
    } catch (error) {
      console.error('Error updating booking status:', error.response?.data || error.message);
    }
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>Error: {error}</p>;

  return (

    <div className="manage-bookings-container">
      <NavBar/><br/><br/><br/>
      <h1 className="page-title">Manage Bookings</h1>
      <div className="bookings-grid">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <BookingCard key={booking.booking_id} booking={booking} updateBookingStatus={updateBookingStatus} />
          ))
        ) : (
          <p>No bookings found.</p>
        )}
      </div>
    </div>
   

  );
};

export default PanditDashboard;
