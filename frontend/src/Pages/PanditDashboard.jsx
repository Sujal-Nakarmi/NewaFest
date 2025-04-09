import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tabs, Tab, Card, Button, Badge, Modal, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaUserClock, FaCheck, FaTimes, FaClock, FaTrash, FaEdit, FaPlus, FaMapMarkerAlt, FaExpand, FaPhone, FaEnvelope } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import NavBar from '../Components/NavBar';
import "../CSS/PanditDashboard.css";

const API_URL = 'http://localhost:8000/pandit_booking/';
const BOOKINGS_URL = `${API_URL}bookings/`;
const AVAILABILITY_URL = `${API_URL}pandits/availability/`;

// Fix for default marker icon in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PanditDashboard = () => {
  // State for bookings
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);
  
  // State for availability
  const [availabilities, setAvailabilities] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState(null);
  
  // State for availability modal
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  });
  
  // State for map modal
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedBookingLocation, setSelectedBookingLocation] = useState(null);
  
  // Success/error messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Days of week mapping
  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch availabilities
  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(BOOKINGS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setBookings(response.data);
      setBookingsError(null);
    } catch (err) {
      setBookingsError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchAvailabilities = async () => {
    setLoadingAvailability(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(AVAILABILITY_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setAvailabilities(response.data);
      setAvailabilityError(null);
    } catch (err) {
      setAvailabilityError(err.response?.data?.message || 'Failed to fetch availability slots');
    } finally {
      setLoadingAvailability(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.put(
        `${BOOKINGS_URL}${bookingId}/status/`,
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
      
      setSuccessMessage(`Booking ${status} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Error updating booking status');
      setTimeout(() => setErrorMessage(''), 3000);
      console.error('Error updating booking status:', error.response?.data || error.message);
    }
  };

  // Handle availability form changes
  const handleAvailabilityFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAvailabilityForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Create or Update availability
  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      if (editingAvailability) {
        // Update existing availability
        await axios.put(
          `${AVAILABILITY_URL}${editingAvailability.availability_id}/`,
          availabilityForm,
          { headers }
        );
      } else {
        // Create new availability
        await axios.post(
          `${AVAILABILITY_URL}create/`,
          availabilityForm,
          { headers }
        );
      }

      // Refresh availabilities
      fetchAvailabilities();
      setShowAvailabilityModal(false);
      setEditingAvailability(null);
      setAvailabilityForm({
        day_of_week: 0,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      });
      
      setSuccessMessage('Availability saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Error saving availability');
      setTimeout(() => setErrorMessage(''), 3000);
      console.error('Error:', error.response?.data || error.message);
    }
  };

  // Delete availability
  const handleDeleteAvailability = async (availabilityId) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${AVAILABILITY_URL}${availabilityId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Remove from local state
      setAvailabilities(prev => prev.filter(item => item.availability_id !== availabilityId));
      
      setSuccessMessage('Availability deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Error deleting availability');
      setTimeout(() => setErrorMessage(''), 3000);
      console.error('Error:', error.response?.data || error.message);
    }
  };

  // Edit availability - open modal with data
  const handleEditAvailability = (availability) => {
    setEditingAvailability(availability);
    setAvailabilityForm({
      day_of_week: availability.day_of_week,
      start_time: availability.start_time.slice(0, 5), // HH:MM format
      end_time: availability.end_time.slice(0, 5), // HH:MM format
      is_available: availability.is_available
    });
    setShowAvailabilityModal(true);
  };

  // Add new availability - open empty modal
  const handleAddAvailability = () => {
    setEditingAvailability(null);
    setAvailabilityForm({
      day_of_week: 0,
      start_time: '09:00',
      end_time: '17:00',
      is_available: true
    });
    setShowAvailabilityModal(true);
  };

  // Open map modal with booking location
  const openMapModal = (booking) => {
    if (booking.location_latitude && booking.location_longitude) {
      setSelectedBookingLocation({
        position: [booking.location_latitude, booking.location_longitude],
        details: {
          fullLocation: booking.full_location,
          landmark: booking.landmark
        },
        user: booking.user_details.full_name
      });
      setShowMapModal(true);
    } else {
      setErrorMessage('This booking does not have location information');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Group bookings by status
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const acceptedBookings = bookings.filter(booking => booking.status === 'accepted');
  const otherBookings = bookings.filter(booking => !['pending', 'accepted'].includes(booking.status));

  // Group availabilities by day
  const availabilitiesByDay = {};
  daysOfWeek.forEach(day => {
    availabilitiesByDay[day.value] = availabilities.filter(a => a.day_of_week === day.value);
  });

  return (
    <div className="pandit-dashboard">
      <NavBar /> <br/><br/>
      <div className="container mt-5 pt-3">
        {/* Alerts for success/error messages */}
        {successMessage && (
          <Alert variant="success" className="animate__animated animate__fadeIn">
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="danger" className="animate__animated animate__fadeIn">
            {errorMessage}
          </Alert>
        )}
        <br/>
        
        <h1 className="pandit-dashboard-heading">
          Welcome to Pandit Dashboard!
        </h1>
        
        <Tabs defaultActiveKey="pending" className="mb-4">
          <Tab eventKey="pending" title={
            <span><FaClock className="me-2" />Pending Bookings ({pendingBookings.length})</span>
          }>
            <div className="p-3">
              {loadingBookings ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading pending bookings...</p>
                </div>
              ) : pendingBookings.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                  {pendingBookings.map((booking) => (
                    <BookingCard 
                      key={booking.booking_id}
                      booking={booking}
                      updateBookingStatus={updateBookingStatus}
                      openMapModal={openMapModal}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p>No pending bookings found.</p>
                </div>
              )}
            </div>
          </Tab>
          
          <Tab eventKey="accepted" title={
            <span><FaCheck className="me-2" />Accepted Bookings ({acceptedBookings.length})</span>
          }>
            <div className="p-3">
              {loadingBookings ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading accepted bookings...</p>
                </div>
              ) : acceptedBookings.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                  {acceptedBookings.map((booking) => (
                    <BookingCard 
                      key={booking.booking_id}
                      booking={booking}
                      updateBookingStatus={updateBookingStatus}
                      showActions={false}
                      openMapModal={openMapModal}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p>No accepted bookings found.</p>
                </div>
              )}
            </div>
          </Tab>
          
          <Tab eventKey="other" title={
            <span><FaTimes className="me-2" />Other Bookings ({otherBookings.length})</span>
          }>
            <div className="p-3">
              {loadingBookings ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading other bookings...</p>
                </div>
              ) : otherBookings.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                  {otherBookings.map((booking) => (
                    <BookingCard 
                      key={booking.booking_id}
                      booking={booking}
                      updateBookingStatus={updateBookingStatus}
                      showActions={false}
                      openMapModal={openMapModal}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p>No rejected or cancelled bookings found.</p>
                </div>
              )}
            </div>
          </Tab>
          
          <Tab eventKey="availability" title={
            <span><FaCalendarAlt className="me-2" />Manage Availability</span>
          }>
            <div className="p-3">
              <div className="d-flex justify-content-between mb-4">
                <h3>Your Availability Schedule</h3>
                <Button 
                  variant="primary" 
                  onClick={handleAddAvailability}
                  className="d-flex align-items-center"
                >
                  <FaPlus className="me-2" /> Add New Time Slot
                </Button>
              </div>
              
              {loadingAvailability ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading availability slots...</p>
                </div>
              ) : availabilityError ? (
                <Alert variant="danger">{availabilityError}</Alert>
              ) : (
                <div className="availability-schedule">
                  {daysOfWeek.map(day => (
                    <Card key={day.value} className="mb-3">
                      <Card.Header className="bg-light">
                        <h5 className="mb-0">{day.label}</h5>
                      </Card.Header>
                      <Card.Body>
                        {availabilitiesByDay[day.value]?.length > 0 ? (
                          <div className="time-slots">
                            {availabilitiesByDay[day.value].map(slot => (
                              <div key={slot.availability_id} className="time-slot-item d-flex justify-content-between align-items-center mb-2 p-3 border rounded">
                                <div>
                                  <span className="time-range fw-bold">
                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                  </span>
                                  <Badge bg={slot.is_available ? "success" : "danger"} className="ms-2">
                                    {slot.is_available ? "Available" : "Unavailable"}
                                  </Badge>
                                </div>
                                <div>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="me-2"
                                    onClick={() => handleEditAvailability(slot)}
                                  >
                                    <FaEdit /> Edit
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleDeleteAvailability(slot.availability_id)}
                                  >
                                    <FaTrash /> Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted text-center py-3">No availability slots set for {day.label}</p>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Availability Modal */}
      <Modal 
        show={showAvailabilityModal} 
        onHide={() => setShowAvailabilityModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAvailability ? 'Edit Availability' : 'Add New Availability'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveAvailability}>
            <Form.Group className="mb-3">
              <Form.Label>Day of Week</Form.Label>
              <Form.Select 
                name="day_of_week"
                value={availabilityForm.day_of_week}
                onChange={handleAvailabilityFormChange}
                required
              >
                {daysOfWeek.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control 
                    type="time" 
                    name="start_time"
                    value={availabilityForm.start_time}
                    onChange={handleAvailabilityFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control 
                    type="time" 
                    name="end_time"
                    value={availabilityForm.end_time}
                    onChange={handleAvailabilityFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="is-available"
                label="Available for booking"
                name="is_available"
                checked={availabilityForm.is_available}
                onChange={handleAvailabilityFormChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAvailabilityModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveAvailability}>
            Save Availability
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Map Modal */}
      <Modal 
        show={showMapModal} 
        onHide={() => setShowMapModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Booking Location - {selectedBookingLocation?.user}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBookingLocation && (
            <>
              <div className="location-details mb-3">
                <h6>Location Details:</h6>
                {selectedBookingLocation.details.fullLocation && (
                  <div><strong>Full Address:</strong> {selectedBookingLocation.details.fullLocation}</div>
                )}
                {selectedBookingLocation.details.landmark && (
                  <div><strong>Landmark:</strong> {selectedBookingLocation.details.landmark}</div>
                )}
              </div>
              <div style={{ height: "400px", width: "100%" }}>
                <MapContainer 
                  center={selectedBookingLocation.position} 
                  zoom={15} 
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={selectedBookingLocation.position}>
                    <Popup>
                      {selectedBookingLocation.user}'s ceremony location
                      {selectedBookingLocation.details.landmark && (
                        <div><br/>Landmark: {selectedBookingLocation.details.landmark}</div>
                      )}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMapModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// BookingCard Component with Map Support
const BookingCard = ({ booking, updateBookingStatus, showActions = true, openMapModal }) => {
  const formattedDate = new Date(booking.booking_date).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let statusBadge;
  switch (booking.status) {
    case 'accepted':
      statusBadge = <Badge bg="success">Accepted</Badge>;
      break;
    case 'rejected':
      statusBadge = <Badge bg="danger">Rejected</Badge>;
      break;
    case 'cancelled':
      statusBadge = <Badge bg="secondary">Cancelled</Badge>;
      break;
    default:
      statusBadge = <Badge bg="warning" text="dark">Pending</Badge>;
  }

  // Check if location information exists
  const hasLocation = booking.location_latitude && booking.location_longitude;

  // Create small map preview if location exists
  const LocationPreview = () => {
    if (!hasLocation) return null;
    
    return (
      <div className="location-preview mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">
            <FaMapMarkerAlt className="me-2" />
            Location
          </h6>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={() => openMapModal(booking)}
            className="view-map-btn"
          >
            <FaExpand className="me-1" /> View Map
          </Button>
        </div>
        
        <div className="map-thumbnail" style={{ height: "120px", position: "relative", overflow: "hidden", borderRadius: "4px" }}>
          <MapContainer 
            center={[booking.location_latitude, booking.location_longitude]} 
            zoom={13} 
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[booking.location_latitude, booking.location_longitude]} />
          </MapContainer>
          
          {/* Overlay to prevent interaction with the preview map */}
          <div 
            style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              cursor: "pointer", 
              zIndex: 1000 
            }}
            onClick={() => openMapModal(booking)}
            className="map-overlay"
          />
        </div>
        
        {/* Location details summary */}
        <div className="location-info-summary mt-2 small">
          {booking.full_location && (
            <div className="text-truncate">
              {booking.full_location}
            </div>
          )}
          {booking.landmark && (
            <div className="text-truncate text-muted">
              Landmark: {booking.landmark}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="col">
      <Card className="h-100 booking-card shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="user-avatar me-2">
              <img 
                src={booking.user_details.profile_picture ? `http://localhost:8000${booking.user_details.profile_picture}` : '/assets/default-profile.png'} 
                alt={booking.user_details.full_name}
                className="rounded-circle"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/default-profile.png';
                }}
              />
            </div>
            <div>
              <h5 className="mb-0">{booking.user_details.full_name}</h5>
              <small className="text-muted">{booking.user_details.email}</small>
            </div>
          </div>
          {statusBadge}
        </Card.Header>
        
        <Card.Body>
          <div className="mb-3">
            <FaCalendarAlt className="me-2 booking-calendar" />
            <span className="booking-date">{formattedDate}</span>
          </div>
          
          <Card.Text>{booking.description}</Card.Text>
          
          {/* Location Map Preview */}
          <LocationPreview />
          
          {/* Contact Information */}
          <div className="user-contact mt-3">
            <div className="d-flex align-items-center mb-1">
              <FaPhone className="text-secondary me-2" size={14} />
              <span>{booking.user_details.phone_number || 'No phone provided'}</span>
            </div>
            <div className="d-flex align-items-center">
              <FaEnvelope className="text-secondary me-2" size={14} />
              <span>{booking.user_details.email}</span>
            </div>
          </div>
        </Card.Body>
        
        {showActions && booking.status === 'pending' && (
          <Card.Footer className="bg-white">
            <div className="d-flex gap-2">
              <Button 
                variant="success"
                className="flex-fill"
                onClick={() => updateBookingStatus(booking.booking_id, 'accepted')}
              >
                <FaCheck className="me-1" /> Accept
              </Button>
              <Button 
                variant="danger"
                className="flex-fill"
                onClick={() => updateBookingStatus(booking.booking_id, 'rejected')}
              >
                <FaTimes className="me-1" /> Reject
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default PanditDashboard;