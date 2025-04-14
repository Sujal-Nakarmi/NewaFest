import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/UsersAdminPanel.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiCalendar, FiBookOpen, FiLogOut, FiEye, FiUser, FiInfo, FiChevronDown, FiChevronUp, FiCheckCircle } from 'react-icons/fi';
import logo from "../Assests/Logo.png";
import { Link } from "react-router-dom";

const EventRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterEventName, setFilterEventName] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Extract unique categories and event names for filter dropdowns
  useEffect(() => {
    if (registrations.length > 0) {
      const uniqueCategories = [...new Set(registrations.map(reg => reg.category))].filter(Boolean);
      const uniqueEvents = [...new Set(registrations.map(reg => reg.event_name))].filter(Boolean);
      
      setCategories(uniqueCategories);
      setEvents(uniqueEvents);
    }
  }, [registrations]);

  // Fetch registrations from API
  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        
        // Build the URL with query parameters
        let url = 'http://localhost:8000/adminwork/admin/events/registrations/';
        const params = [];
        
       
        if (filterCategory) {
          params.push(`category=${filterCategory}`);
        }
        if (filterEventName) {
          params.push(`event_name=${filterEventName}`);
        }
        
        if (params.length > 0) {
          url += '?' + params.join('&');
        }
          
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Sort registrations by date, newest first
        const sortedRegistrations = response.data.sort((a, b) => {
          return new Date(b.registration_date) - new Date(a.registration_date);
        });
        
        setRegistrations(sortedRegistrations);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError('Failed to load registrations. Please try again later.');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem("access_token");
          navigate('/login');
        }
      }
    };

    fetchRegistrations();
  }, [navigate,  filterCategory, filterEventName]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate('/login');
  };

  // Reset filters
  const resetFilters = () => {
    
    setFilterCategory('');
    setFilterEventName('');
    setCurrentPage(1);
  };

  // Toggle row expansion
  const toggleRowExpansion = (registrationId) => {
    setExpandedRows(prev => ({
      ...prev,
      [registrationId]: !prev[registrationId]
    }));
  };

  // Search functionality
  const filteredRegistrations = registrations.filter(registration => 
    registration.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (registration.user_info?.name && registration.user_info.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (registration.user_info?.phone_number && registration.user_info.phone_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastRegistration = currentPage * itemsPerPage;
  const indexOfFirstRegistration = indexOfLastRegistration - itemsPerPage;
  const currentRegistrations = filteredRegistrations.slice(indexOfFirstRegistration, indexOfLastRegistration);
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Category badge styling
  const getCategoryBadgeClass = (category) => {
    if (!category) return 'badge bg-secondary';
    
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('volunteer')) return 'badge bg-success';
    if (lowerCategory.includes('stall')) return 'badge bg-warning text-dark';
    if (lowerCategory.includes('rally')) return 'badge bg-info text-dark';
    if (lowerCategory.includes('ihi')) return 'badge bg-primary';
    
    return 'badge bg-secondary';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render details based on category
  const renderDetailsByCategory = (registration) => {
    if (!registration.details || registration.details.length === 0) {
      return <p>No additional details available</p>;
    }

    return (
      <div className="registration-details mt-3">
        {registration.details.map((detail, index) => (
          <div key={index} className="detail-card p-3 mb-3 bg-light rounded">
            
            
            {/* Common detail */}
            {detail.seats && (
              <div className="mb-2">
                <strong>Seats:</strong> {detail.seats}
              </div>
            )}
            
            {/* Stall details */}
            {registration.category === 'Stall' && (
              <>
                {detail.stall_type && (
                  <div className="mb-2">
                    <strong>Stall Type:</strong> {detail.stall_type}
                  </div>
                )}
                {detail.stall_location && (
                  <div className="mb-2">
                    <strong>Location:</strong> {detail.stall_location}
                  </div>
                )}
                {detail.drinks && (
                  <div className="mb-2">
                    <strong>Drinks:</strong> {detail.drinks}
                  </div>
                )}
                {detail.food_items && (
                  <div className="mb-2">
                    <strong>Food Items:</strong> {detail.food_items}
                  </div>
                )}
              </>
            )}
            
            {/* Rally details */}
            {registration.category === 'Rally' && (
              <>
                {detail.rally_option && (
                  <div className="mb-2">
                    <strong>Rally Option:</strong> {detail.rally_option}
                  </div>
                )}
                {detail.rally_laps && detail.rally_laps.length > 0 && (
                  <div className="mb-2">
                    <strong>Laps:</strong>
                    <ul className="list-group mt-2">
                      {detail.rally_laps.map((lap, lapIndex) => (
                        <li key={lapIndex} className="list-group-item">
                          Lap {lap.lap_number}: {lap.route_description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            
            {/* Volunteer details */}
            {registration.category === 'Volunteer' && (
              <>
                {detail.volunteer_type && (
                  <div className="mb-2">
                    <strong>Volunteer Type:</strong> {detail.volunteer_type}
                  </div>
                )}
                {detail.instrument && (
                  <div className="mb-2">
                    <strong>Instrument:</strong> {detail.instrument}
                  </div>
                )}
                {detail.volunteer_laps && detail.volunteer_laps.length > 0 && (
                  <div className="mb-2">
                    <strong>Volunteer Laps:</strong>
                    <ul className="list-group mt-2">
                      {detail.volunteer_laps.map((lap, lapIndex) => (
                        <li key={lapIndex} className="list-group-item">
                          Lap {lap.lap_number}: {lap.route_description}, Time: {lap.time || 'TBD'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            
            {/* Ihi details */}
            {registration.category === 'Ihi' && (
              <>
                {detail.location && (
                  <div className="mb-2">
                    <strong>Location:</strong> {detail.location}
                  </div>
                )}
                {detail.phone && (
                  <div className="mb-2">
                    <strong>Phone:</strong> {detail.phone}
                  </div>
                )}
                {detail.description && (
                  <div className="mb-2">
                    <strong>Description:</strong> {detail.description}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <Link to="/"><img src={logo} className="dashboard-logo" alt="Logo" /></Link>
        </div>
        <nav className="nav-menu">
          <Link to="/admin/dashboard" className="nav-item">
            <FiHome size={18} /> Dashboard
          </Link>
          <Link to="/admin/dashboard/users" className="nav-item">
            <FiUsers size={18} /> Users
          </Link>
          <Link to="/admin/dashboard/events" className="nav-item">
            <FiCalendar size={18} /> Events
          </Link>
           <Link to="/admin/dashboard/checkin" className="nav-item ">
                      <FiCheckCircle size={18} /> Check-in
                    </Link>
          <Link to="/admin/dashboard/registrations" className="nav-item active">
            <FiCalendar size={18} /> Event Registration
          </Link>
          <Link to="/admin/dashboard/rentals" className="nav-item">
            <FiCalendar size={18} /> Rental Items
          </Link>
          <Link to="/admin/size-variants" className="nav-item">
            <FiUser size={18} /> Size Variants
          </Link>
          <Link to="/admin/orders" className="nav-item">
                      <FiUser size={18} /> Orders
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
            placeholder="Search registrations..." 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Registration Section */}
        <div className="product-section">
          <div className="product-header">
            <h1>Event Registrations</h1>
            <div className="product-controls">
              <div className="filter-section d-flex flex-wrap gap-3 mb-3">
               
                
                {/* Category Filter */}
                <div className="filter-item">
                  <span>Category: </span>
                  <select 
                    className="form-select" 
                    value={filterCategory} 
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                {/* Event Name Filter */}
                <div className="filter-item">
                  <span>Event: </span>
                  <select 
                    className="form-select" 
                    value={filterEventName} 
                    onChange={(e) => {
                      setFilterEventName(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Events</option>
                    {events.map(event => (
                      <option key={event} value={event}>{event}</option>
                    ))}
                  </select>
                </div>
                
                {/* Reset Filters Button */}
                <div className="filter-item">
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
              
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
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && <div className="text-center my-4"><div className="spinner-border" role="status"></div></div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Registration Table */}
          {!loading && !error && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Event Name</th>
                    <th>Category</th>
                    <th>User</th>
                    <th>Phone Number</th>
                    <th>Year</th>
                    <th>Registration Date</th>
                    <th>Slots Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRegistrations.length > 0 ? (
                    currentRegistrations.map((registration) => {
                      const registrationId = registration.registration_ids && registration.registration_ids[0];
                      return (
                        <React.Fragment key={registrationId}>
                          <tr>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => toggleRowExpansion(registrationId)}
                              >
                                {expandedRows[registrationId] ? <FiChevronUp /> : <FiChevronDown />}
                              </button>
                            </td>
                            <td>{registration.event_name}</td>
                            <td>
                              <span className={getCategoryBadgeClass(registration.category)}>
                                {registration.category}
                              </span>
                            </td>
                            <td>
                              {registration.user_info?.name || 'N/A'}
                            </td>
                            <td>
                              {registration.user_info?.phone_number || 'N/A'}
                            </td>
                            <td>{registration.year}</td>
                            <td>{formatDate(registration.registration_date)}</td>
                            <td>
                              <span className="badge bg-slot">
                                {registration.total_seats || 'N/A'}
                              </span>
                            </td>
                          </tr>
                          {expandedRows[registrationId] && (
                            <tr>
                              <td colSpan="8" className="expanded-details">
                                {renderDetailsByCategory(registration)}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">No registrations found</td>
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

      {/* Add some custom CSS */}
      <style jsx="true">{`
        .expanded-details {
          background-color: #f8f9fa;
          padding: 15px;
        }
        
        .detail-card {
          border-left: 4px solid #6c757d;
        }
        
        .badge.bg-slot {
          background-color: #28a745;
          color: white;
        }
        
        .filter-section {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        
        .filter-item {
          display: flex;
          align-items: center;
          margin-right: 15px;
        }
        
        .filter-item span {
          margin-right: 5px;
          white-space: nowrap;
        }
        
        .filter-item .form-select {
          min-width: 120px;
        }
      `}</style>
    </div>
  );
};

export default EventRegistrations;