import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/UsersAdminPanel.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiCalendar, FiBookOpen, FiLogOut, FiEdit, FiTrash2, FiEye, FiUser, FiArrowUpCircle, FiCheckCircle } from 'react-icons/fi';
import logo from "../Assests/Logo.png";
import { Link } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    user_role: 'normal_user',
    address: '',
    country: '',
    password: '',
    experience_year: '',
    experience_description: ''
  });
  const [vendorData, setVendorData] = useState({
    user_id: '',
    company_name: '',
    business_description: ''
  });
  const navigate = useNavigate();
  
  // Base API URL
  const API_BASE_URL = 'http://localhost:8000/registerlogin';

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard/`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          search: searchTerm
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

  useEffect(() => {
    fetchUsers();
  }, [navigate, searchTerm]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate('/login');
  };

  // Pagination logic
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / itemsPerPage);

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle vendor form input changes
  const handleVendorInputChange = (e) => {
    const { name, value } = e.target;
    setVendorData({
      ...vendorData,
      [name]: value
    });
  };

  // Handle add user form submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      
      // Create a copy of formData to send
      const dataToSend = { ...formData };
      
      // Remove pandit-specific fields if user role is not pandit
      if (dataToSend.user_role !== 'pandit') {
        delete dataToSend.experience_year;
        delete dataToSend.experience_description;
      }
      
      await axios.post(`${API_BASE_URL}/api/admin/users/create/`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setShowAddModal(false);
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        user_role: 'normal_user',
        address: '',
        country: '',
        password: '',
        experience_year: '',
        experience_description: ''
      });
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user. Please try again.');
    }
  };

  // Handle edit user
  const handleEditUser = async (userId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCurrentUser(response.data);
      // Set form data without password (we don't want to update password necessarily)
      const { password, ...userData } = response.data;
      setFormData({
        ...userData,
        password: '',
        experience_year: userData.experience_year || '',
        experience_description: userData.experience_description || ''
      });
      setShowEditModal(true);
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err);
      setError('Failed to load user details. Please try again.');
    }
  };

  // Handle update user form submission
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      // Remove password if it's empty (don't update password)
      const updateData = {...formData};
      if (!updateData.password) {
        delete updateData.password;
      }
      
      // Remove pandit-specific fields if user role is not pandit
      if (updateData.user_role !== 'pandit') {
        delete updateData.experience_year;
        delete updateData.experience_description;
      }
      
      await axios.put(`${API_BASE_URL}/api/admin/users/${currentUser.id}/`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    }
  };

  // Handle delete user
  const handleDeleteUser = (userId) => {
    setCurrentUser({id: userId});
    setShowDeleteModal(true);
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_BASE_URL}/api/admin/users/${currentUser.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  // Handle promote user to vendor
  const handlePromoteUser = (userId) => {
    setCurrentUser({id: userId});
    setVendorData({
      user_id: userId,
      company_name: '',
      business_description: ''
    });
    setShowPromoteModal(true);
  };

  // Confirm promote to vendor
  const confirmPromoteToVendor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${API_BASE_URL}/api/admin/promote-to-vendor/`, vendorData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowPromoteModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error promoting user to vendor:', err);
      setError('Failed to promote user to vendor. Please try again.');
    }
  };

  // Render experience fields if user role is pandit
  const renderExperienceFields = (isPandit) => {
    if (!isPandit) return null;
    
    return (
      <>
        <div className="mb-3">
          <label htmlFor="experience_year" className="form-label">Experience Years</label>
          <input 
            type="number" 
            className="form-control" 
            id="experience_year"
            name="experience_year"
            value={formData.experience_year}
            onChange={handleInputChange}
            required={formData.user_role === 'pandit'}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="experience_description" className="form-label">Experience Description</label>
          <textarea 
            className="form-control" 
            id="experience_description"
            name="experience_description"
            value={formData.experience_description}
            onChange={handleInputChange}
            rows="3"
            required={formData.user_role === 'pandit'}
          ></textarea>
        </div>
      </>
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
          <a href="/admin/dashboard/all" className="nav-item">
            <FiHome size={18} /> Dashboard
          </a>
          <a href="#" className="nav-item active">
            <FiUsers size={18} /> Users
          </a>

       
          <Link to="/admin/dashboard/events" className="nav-item">
            <FiCalendar size={18} /> Events
          </Link>

           <Link to="/admin/dashboard/checkin" className="nav-item ">
                      <FiCheckCircle size={18} /> Check-in
                    </Link>
          
          <Link to="/admin/dashboard/registrations" className="nav-item">
            <FiCalendar size={18} /> Event Registration
          </Link>
          <Link to="/admin/dashboard/rentals" className="nav-item">
            <FiCalendar size={18} /> Rental Items
          </Link>
          <a href="/admin/size-variants" className="nav-item">
            <FiUser size={18} /> Size Variants
          </a>
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
              
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add New User</button>
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
                            {user.user_role === 'normal_user' &&(
                              <button 
                                className="btn btn-sm btn-outline-success me-1" 
                                onClick={() => handlePromoteUser(user.id)}
                                title="Promote to Vendor"
                              >
                                <FiArrowUpCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">No users found</td>
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddUser}>
                  <div className="mb-3">
                    <label htmlFor="full_name" className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone_number" className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="user_role" className="form-label">Role</label>
                    <select 
                      className="form-select" 
                      id="user_role"
                      name="user_role"
                      value={formData.user_role}
                      onChange={handleInputChange}
                    >
                      <option value="normal_user">Normal User</option>
                      <option value="pandit">Pandit</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="country" className="form-label">Country</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  {/* Conditionally render experience fields for pandit */}
                  {renderExperienceFields(formData.user_role === 'pandit')}
                  
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Add User</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdateUser}>
                  <div className="mb-3">
                    <label htmlFor="edit_full_name" className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="edit_full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit_email" className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="edit_email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit_phone_number" className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="edit_phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit_user_role" className="form-label">Role</label>
                    <select 
                      className="form-select" 
                      id="edit_user_role"
                      name="user_role"
                      value={formData.user_role}
                      onChange={handleInputChange}
                    >
                      <option value="normal_user">Normal User</option>
                      <option value="pandit">Pandit</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit_address" className="form-label">Address</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="edit_address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit_country" className="form-label">Country</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="edit_country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  {/* Conditionally render experience fields for pandit */}
                  {renderExperienceFields(formData.user_role === 'pandit')}
                  
                  <div className="mb-3">
                    <label htmlFor="edit_password" className="form-label">Password (Leave blank to keep unchanged)</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="edit_password"
                      name="password"
                      value={formData.password || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Update User</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this user? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDeleteUser}>Delete User</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promote to Vendor Modal */}
      {showPromoteModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Promote to Vendor</h5>
                <button type="button" className="btn-close" onClick={() => setShowPromoteModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={confirmPromoteToVendor}>
                  <div className="mb-3">
                    <label htmlFor="company_name" className="form-label">Company Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="company_name"
                      name="company_name"
                      value={vendorData.company_name}
                      onChange={handleVendorInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="business_description" className="form-label">Business Description</label>
                    <textarea 
                      className="form-control" 
                      id="business_description"
                      name="business_description"
                      value={vendorData.business_description}
                      onChange={handleVendorInputChange}
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowPromoteModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Promote to Vendor</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background overlay for modals */}
      {(showAddModal || showEditModal || showDeleteModal || showPromoteModal) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
};

export default Users;