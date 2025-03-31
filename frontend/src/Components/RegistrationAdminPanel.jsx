import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/UsersAdminPanel.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiCalendar, FiBookOpen, FiLogOut, FiEye, FiUser, FiInfo } from 'react-icons/fi';
import logo from "../Assests/Logo.png";
import { Link } from "react-router-dom";

const EventRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch registrations from API
  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const url = filterYear 
          ? `http://localhost:8000/adminwork/admin/events/registrations/?year=${filterYear}`
          : 'http://localhost:8000/adminwork/admin/events/registrations/';
          
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRegistrations(response.data);
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
  }, [navigate, filterYear]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate('/login');
  };

  // Search functionality
  const filteredRegistrations = registrations.filter(registration => 
    registration.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (registration.music_instrument && registration.music_instrument.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (registration.drinks && registration.drinks.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (registration.user_info?.name && registration.user_info.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (registration.user_info?.email && registration.user_info.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
    if (category?.toLowerCase().includes('music')) return 'badge bg-info text-dark';
    if (category?.toLowerCase().includes('volunteer')) return 'badge bg-success';
    if (category?.toLowerCase().includes('stall')) return 'badge bg-warning text-dark';
    if (category?.toLowerCase().includes('ihi')) return 'badge bg-secondary';
    return 'badge bg-secondary';
  };

  // Handle view details
  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailsModal(true);
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

  // Close modal
  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedRegistration(null);
  };

  // Modal component for viewing details
  const DetailsModal = ({ registration, onClose }) => {
    if (!registration) return null;
    
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h5 className="modal-title">Registration Details</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <h6 className="text-muted">Basic Information</h6>
                <p><strong>ID:</strong> {registration.registration_id}</p>
                <p><strong>Event:</strong> {registration.event_name}</p>
                <p><strong>Category:</strong> <span className={getCategoryBadgeClass(registration.category)}>{registration.category}</span></p>
                <p><strong>Year:</strong> {registration.year}</p>
                <p><strong>Registration Date:</strong> {formatDate(registration.registration_date)}</p>
                {registration.seats && <p><strong>Seats:</strong> {registration.seats}</p>}
              </div>
              
              <div className="col-md-6">
                <h6 className="text-muted">User Information</h6>
                {registration.user_info && (
                  <>
                    <p><strong>Name:</strong> {registration.user_info.name}</p>
                    <p><strong>Phone:</strong> {registration.user_info.phone_number}</p>
                    <p><strong>User ID:</strong> {registration.user_info.id}</p>
                  </>
                )}
              </div>
            </div>
            
            <hr />
            
            {/* Category-specific details */}
            <div className="row">
              <div className="col-12">
                <h6 className="text-muted">Category Details</h6>
                
                {/* Music */}
                {registration.category?.toLowerCase().includes('music') && registration.music_instrument && (
                  <p><strong>Instrument:</strong> {registration.music_instrument}</p>
                )}
                
                {/* Stall */}
                {registration.category?.toLowerCase().includes('stall') && (
                  <>
                    {registration.stall_type && <p><strong>Stall Type:</strong> {registration.stall_type}</p>}
                    {registration.stall_location && <p><strong>Location:</strong> {registration.stall_location}</p>}
                    {registration.drinks && <p><strong>Drinks:</strong> {registration.drinks}</p>}
                    {registration.food_items && <p><strong>Food Items:</strong> {registration.food_items}</p>}
                  </>
                )}
                
                {/* Volunteer */}
                {registration.category?.toLowerCase().includes('volunteer') && (
                  <>
                    {registration.volunteer_type && <p><strong>Volunteer Type:</strong> {registration.volunteer_type}</p>}
                    {registration.volunteer_laps && registration.volunteer_laps.length > 0 && (
                      <div>
                        <p><strong>Volunteer Laps:</strong></p>
                        <ul className="list-unstyled">
                          {registration.volunteer_laps.map((lap, index) => (
                            <li key={index} className="mb-1">
                              Lap {lap.lap_number}: {lap.route} at {lap.time}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                
                {/* Ihi */}
                {registration.ihi_info && (
                  <>
                    <p><strong>Ihi Location:</strong> {registration.ihi_info.location}</p>
                    <p><strong>Phone:</strong> {registration.ihi_info.phone}</p>
                    <p><strong>Description:</strong> {registration.ihi_info.description}</p>
                    <p><strong>Seats:</strong> {registration.ihi_info.seats}</p>
                  </>
                )}
                
                {/* Ticket info */}
                {registration.ticket_info && (
                  <>
                    <hr />
                    <h6 className="text-muted">Payment Information</h6>
                    <p><strong>Price:</strong> Rs. {registration.ticket_info.price}</p>
                    <p><strong>Payment Status:</strong> <span className={`badge ${registration.ticket_info.payment_status === 'completed' ? 'bg-success' : 'bg-warning'}`}>{registration.ticket_info.payment_status}</span></p>
                    <p><strong>Payment Method:</strong> {registration.ticket_info.payment_method}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
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
          <Link to="/admin/dashboard/registrations" className="nav-item active">
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
              <div className="year-filter me-3">
                <span>Filter by Year: </span>
                <select 
                  className="form-select" 
                  value={filterYear} 
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
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
                   
                    <th>Event Name</th>
                    <th>Category</th>
                    <th>User</th>
                    <th>Phone Number</th>
                    <th>Year</th>
                    <th>Registration Date</th>
                    
                    
                  </tr>
                </thead>
                <tbody>
                  {currentRegistrations.length > 0 ? (
                    currentRegistrations.map((registration) => (
                      <tr key={registration.registration_id}>
                        
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
                          {registration.category?.toLowerCase().includes('music') && registration.music_instrument && (
                            <span>Instrument: {registration.music_instrument}</span>
                          )}
                          {registration.category?.toLowerCase().includes('stall') && registration.drinks && (
                            <span>Drinks: {registration.drinks}</span>
                          )}
                          {registration.category?.toLowerCase().includes('volunteer') && registration.volunteer_type && (
                            <span>Type: {registration.volunteer_type}</span>
                          )}
                          {registration.category?.toLowerCase().includes('ihi') && registration.ihi_info && (
                            <span>Location: {registration.ihi_info.location}</span>
                          )}
                        </td>
                       
                      </tr>
                    ))
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

      {/* Details Modal */}
      {showDetailsModal && <DetailsModal registration={selectedRegistration} onClose={closeModal} />}
    </div>
  );
};

export default EventRegistrations;