import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/UsersAdminPanel.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiCalendar, FiBookOpen, FiLogOut, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import logo from "../Assests/Logo.png";
import { Link } from "react-router-dom";
import { format } from 'date-fns';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get('http://localhost:8000/adminwork/admin/events/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem("access_token");
          navigate('/login');
        }
      }
    };

    fetchEvents();
  }, [navigate]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate('/login');
  };

  // Search functionality
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Format date
  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy - hh:mm a');
    } catch (error) {
      return dateString;
    }
  };

  // Truncate description
  const truncateDescription = (text, maxLength = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Handle edit event
  const handleEditEvent = (eventId) => {
    console.log(`Edit event ${eventId}`);
    // Navigate to edit page or open modal
  };

  // Handle delete event
  const handleDeleteEvent = (eventId) => {
    console.log(`Delete event ${eventId}`);
    // Show confirmation modal and delete if confirmed
  };

  // Handle view event details
  const handleViewEvent = (eventId) => {
    console.log(`View event ${eventId}`);
    // Navigate to event details or open details modal
  };

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
          <a href="#" className="nav-item">
            <FiBookOpen size={18} /> Pandits
          </a>
          <a href="#" className="nav-item active">
            <FiCalendar size={18} /> Events
          </a>
          <Link to="/admin/dashboard/registrations" className="nav-item ">
                     <FiCalendar size={18} /> Event Registration
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
            <h1>Events Detail</h1>
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
              
              <button className="btn btn-primary">Add New Event</button>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && <div className="text-center my-4"><div className="spinner-border" role="status"></div></div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Events Table */}
          {!loading && !error && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Location</th>
                    <th>Date & Time</th>
                    <th>Year</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
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
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-outline-info me-1" 
                              onClick={() => handleViewEvent(event.event_id)}
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-primary me-1" 
                              onClick={() => handleEditEvent(event.event_id)}
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger me-1" 
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
                      <td colSpan="7" className="text-center">No events found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 0 && (
            <div className="pagination-container">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="page-numbers">
                {pageNumbers.map(number => (
                  <button 
                    key={number}
                    className={`btn ${currentPage === number ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number < 10 ? `0${number}` : number}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;