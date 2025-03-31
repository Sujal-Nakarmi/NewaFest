import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/UsersAdminPanel.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiCalendar, 
  FiBookOpen, 
  FiLogOut, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiPlus,
  FiUser
} from 'react-icons/fi';
import logo from "../Assests/Logo.png";
import { Link } from "react-router-dom";
import { format, parseISO } from 'date-fns';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

const Events = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    start_time: '',
    year: new Date().getFullYear(),
    photo: null,
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get('http://localhost:8000/adminwork/admin/events/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("access_token");
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [navigate]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (showModal && currentEvent) {
      setFormData({
        name: currentEvent.name || '',
        description: currentEvent.description || '',
        location: currentEvent.location || '',
        start_time: currentEvent.start_time ? format(parseISO(currentEvent.start_time), "yyyy-MM-dd'T'HH:mm") : '',
        year: currentEvent.year || new Date().getFullYear(),
        photo: null,
        is_active: currentEvent.is_active || true
      });
    } else if (showModal) {
      setFormData({
        name: '',
        description: '',
        location: '',
        start_time: '',
        year: new Date().getFullYear(),
        photo: null,
        is_active: true
      });
    }
  }, [showModal, currentEvent]);

  // Event handlers
  const handleAddEvent = () => {
    setCurrentEvent(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewEvent = (event) => {
    setCurrentEvent(event);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem("access_token");
        await axios.delete(`http://localhost:8000/adminwork/admin/events/delete/${eventId}/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchEvents();
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('Failed to delete event. Please try again.');
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem("access_token");
          navigate('/login');
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate('/login');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("access_token");
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      let response;
      if (modalMode === 'add') {
        response = await axios.post('http://localhost:8000/adminwork/admin/events/manage/', formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await axios.put(
          `http://localhost:8000/adminwork/admin/events/update/${currentEvent.event_id}/`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      setShowModal(false);
      fetchEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      alert(err.response?.data?.error || 'Failed to save event. Please try again.');
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("access_token");
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utility functions
  const formatEventDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy - hh:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const truncateDescription = (text, maxLength = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Filter and pagination logic
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <Link to="/"><img src={logo} className="dashboard-logo" alt="Logo" /></Link>
        </div>
        <nav className="nav-menu">
          <a href="#" className="nav-item">
            <FiHome size={18} /> Dashboard
          </a>
          <Link to="/admin/dashboard/users" className="nav-item">
            <FiUsers size={18} /> Users
          </Link>
        
          <a href="#" className="nav-item active">
            <FiCalendar size={18} /> Events
          </a>
          <Link to="/admin/dashboard/registrations" className="nav-item">
            <FiCalendar size={18} /> Event Registration
          </Link>
          <Link to="/admin/dashboard/rentals" className="nav-item">
                      <FiCalendar size={18} /> Rental Items
                    </Link>
           <Link to="/admin/size-variants" className="nav-item ">
                      <FiUser size={18} /> Size Variants
                    </Link>
        </nav>
        <div className="logout">
          <a href="#" className="nav-item logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} /> Log out
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <h4 className="m-0">Welcome Admin!</h4>
          <input 
            type="text" 
            placeholder="Search events..." 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Events Section */}
        <div className="product-section">
          <div className="product-header">
            <h1>Events Management</h1>
            <div className="product-controls">
              <div className="showing-dropdown">
                <span>Showing</span>
                <select 
                  className="form-select"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              <button className="btn btn-primary" onClick={handleAddEvent}>
                <FiPlus size={16} className="me-1" /> Add New Event
              </button>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
          
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Events Table */}
          {!loading && !error && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Event Name</th>
                    <th>Location</th>
                    <th>Date & Time</th>
                    <th>Year</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEvents.length > 0 ? (
                    currentEvents.map((event) => (
                      <tr key={event.event_id}>
                        <td>{event.name}</td>
                        <td>{event.location}</td>
                        <td>{formatEventDate(event.start_time)}</td>
                        <td>{event.year}</td>
                        <td>{truncateDescription(event.description)}</td>
                        <td>
                          <span className={`badge ${event.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {event.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex">
                            <button 
                              className="btn btn-sm btn-outline-info me-2" 
                              onClick={() => handleViewEvent(event)}
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2" 
                              onClick={() => handleEditEvent(event)}
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => handleDeleteEvent(event.event_id)}
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        {searchTerm ? 'No matching events found' : 'No events available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 0 && (
            <div className="pagination-container mt-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  Showing {indexOfFirstEvent + 1} to {Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} entries
                </div>
                <div className="d-flex">
                  <button 
                    className="btn btn-outline-secondary me-2" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <div className="btn-group me-2">
                    {pageNumbers.map(number => (
                      <button 
                        key={number}
                        className={`btn ${currentPage === number ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setCurrentPage(number)}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'add' ? 'Add New Event' : modalMode === 'edit' ? 'Edit Event' : 'Event Details'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            {modalMode === 'view' ? (
              <div>
                <h4>{formData.name}</h4>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <p><strong>Location:</strong> {formData.location}</p>
                    <p><strong>Date & Time:</strong> {formData.start_time ? format(parseISO(formData.start_time), 'PPpp') : 'N/A'}</p>
                    <p><strong>Year:</strong> {formData.year}</p>
                    <p><strong>Status:</strong> {formData.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                  {currentEvent?.photo && (
                    <div className="col-md-6 text-center">
                      <img 
                        src={currentEvent.photo} 
                        alt="Event" 
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px' }} 
                      />
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <h5>Description</h5>
                  <p className="text-muted">{formData.description || 'No description provided'}</p>
                </div>
              </div>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Event Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>

                <div className="row">
                  <Form.Group className="mb-3 col-md-6">
                    <Form.Label>Location *</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3 col-md-6">
                    <Form.Label>Year *</Form.Label>
                    <Form.Control
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleFormChange}
                      min="2000"
                      max="2100"
                      required
                    />
                  </Form.Group>
                </div>

                <div className="row">
                  <Form.Group className="mb-3 col-md-6">
                    <Form.Label>Date & Time *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleFormChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3 col-md-6 d-flex align-items-end">
                    <Form.Check
                      type="switch"
                      id="active-switch"
                      label="Active Event"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleFormChange}
                    />
                  </Form.Group>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Event Photo</Form.Label>
                  <Form.Control
                    type="file"
                    name="photo"
                    onChange={handleFormChange}
                    accept="image/*"
                  />
                  {currentEvent?.photo && (
                    <div className="mt-2">
                      <p>Current Photo:</p>
                      <img 
                        src={currentEvent.photo} 
                        alt="Current" 
                        className="img-thumbnail"
                        style={{ maxHeight: '100px' }} 
                      />
                    </div>
                  )}
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            {modalMode !== 'view' && (
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" />
                    <span className="ms-2">Saving...</span>
                  </>
                ) : modalMode === 'add' ? (
                  'Add Event'
                ) : (
                  'Save Changes'
                )}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Events;