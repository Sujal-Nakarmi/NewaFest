import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/UsersAdminPanel.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiCalendar, FiBookOpen, FiLogOut, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import logo from "../Assests/Logo.png";
import { Link } from "react-router-dom"

const Users = () => {
  const [users, setUsers] = useState([]);
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

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get('http://localhost:8000/registerlogin/api/admin/dashboard/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data.users);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
        setLoading(false);
        
        // If unauthorized, redirect to login
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem("access_token");
          navigate('/login');
        }
      }
    };

    fetchUsers();
  }, [navigate]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate('/login');
  };

  // Search functionality
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // User role badge styling
  const getRoleBadgeClass = (role) => {
    const roleClasses = {
      'admin': 'badge bg-danger',
      'normal_user': 'badge bg-success',
      'pandit': 'badge bg-warning text-dark',
      'vendor': 'badge bg-info text-dark'
    };
    return roleClasses[role] || 'badge bg-secondary';
  };

  // Handle edit user
  const handleEditUser = (userId) => {
    console.log(`Edit user ${userId}`);
    // Navigate to edit page or open modal
  };

  // Handle delete user
  const handleDeleteUser = (userId) => {
    console.log(`Delete user ${userId}`);
    // Show confirmation modal and delete if confirmed
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
          <a href="#" className="nav-item active">
            <FiUsers size={18} /> Users
          </a>
          <a href="#" className="nav-item">
            <FiBookOpen size={18} /> Pandits
          </a>
          <Link to="/admin/dashboard/events" className="nav-item">
                <FiCalendar size={18} /> Events
        </Link>
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
            placeholder="Search users..." 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* User Section */}
        <div className="product-section">
          <div className="product-header">
            <h1>Users Detail</h1>
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
              
              <button className="btn btn-primary">Add New User</button>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && <div className="text-center my-4"><div className="spinner-border" role="status"></div></div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* User Table */}
          {!loading && !error && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Role</th>
                    <th>Address</th>
                    <th>Country</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.full_name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone_number}</td>
                        <td>
                          <span className={getRoleBadgeClass(user.user_role)}>
                            {user.user_role.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{user.address}</td>
                        <td>{user.country}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-outline-primary me-1" 
                              onClick={() => handleEditUser(user.id)}
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger me-1" 
                              onClick={() => handleDeleteUser(user.id)}
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
                      <td colSpan="7" className="text-center">No users found</td>
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

export default Users;