import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/UsersAdminPanel.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiCalendar, FiBookOpen, FiLogOut, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import logo from "../Assests/Logo.png";
import { Link } from "react-router-dom"

const EventRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
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
    registration.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    registration.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (registration.music_instrument && registration.music_instrument.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (registration.drinks && registration.drinks.toLowerCase().includes(searchTerm.toLowerCase()))
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
    if (category.toLowerCase().includes('music')) return 'badge bg-info text-dark';
    if (category.toLowerCase().includes('volunteer')) return 'badge bg-success';
    if (category.toLowerCase().includes('stall')) return 'badge bg-warning text-dark';
    return 'badge bg-secondary';
  };

  // Handle view details
  const handleViewDetails = (registrationId) => {
    console.log(`View details for registration ${registrationId}`);
    // Navigate to details page or open modal
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                    <th>ID</th>
                    <th>Event Name</th>
                    <th>Category</th>
                    <th>Year</th>
                    <th>Registration Date</th>
                    <th>Details</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRegistrations.length > 0 ? (
                    currentRegistrations.map((registration) => (
                      <tr key={registration.registration_id}>
                        <td>{registration.registration_id}</td>
                        <td>{registration.event_name}</td>
                        <td>
                          <span className={getCategoryBadgeClass(registration.category)}>
                            {registration.category}
                          </span>
                        </td>
                        <td>{registration.year}</td>
                        <td>{formatDate(registration.registration_date)}</td>
                        <td>
                          {registration.music_instrument && (
                            <span>Instrument: {registration.music_instrument}</span>
                          )}
                          {registration.drinks && (
                            <span>Drinks: {registration.drinks}</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-outline-primary me-1" 
                              onClick={() => handleViewDetails(registration.registration_id)}
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">No registrations found</td>
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

export default EventRegistrations;