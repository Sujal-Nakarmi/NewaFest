import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
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
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';

const RentalItemsAdminPanel = () => {
  // State management
  const [rentalItems, setRentalItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    base_price: '',
    is_available: true,
    photo: null
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

  // Fetch rental items from API
  const fetchRentalItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get('http://localhost:8000/renting/renting/public/rental-items/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRentalItems(response.data);
    } catch (err) {
      console.error('Error fetching rental items:', err);
      setError('Failed to load rental items. Please try again later.');
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("access_token");
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalItems();
  }, [navigate]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (showModal && currentItem) {
      setFormData({
        name: currentItem.name || '',
        description: currentItem.description || '',
        category: currentItem.category || '',
        base_price: currentItem.base_price || '',
        is_available: currentItem.is_available || true,
        photo: null
      });
    } else if (showModal) {
      setFormData({
        name: '',
        description: '',
        category: '',
        base_price: '',
        is_available: true,
        photo: null
      });
    }
  }, [showModal, currentItem]);

  // Event handlers
  const handleAddItem = () => {
    setCurrentItem(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleEditItem = (item) => {
    setCurrentItem(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewItem = (item) => {
    setCurrentItem(item);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this rental item? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem("access_token");
        await axios.delete(`http://localhost:8000/renting/renting/rental-items/${itemId}/delete/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchRentalItems();
      } catch (err) {
        console.error('Error deleting rental item:', err);
        alert('Failed to delete rental item. Please try again.');
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
        response = await axios.post('http://localhost:8000/renting/renting/rental-items/create/', formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        response = await axios.put(
          `http://localhost:8000/renting/renting/rental-items/${currentItem.item_id}/update/`,
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
      fetchRentalItems();
    } catch (err) {
      console.error('Error saving rental item:', err);
      alert(err.response?.data?.error || 'Failed to save rental item. Please try again.');
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("access_token");
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const truncateDescription = (text, maxLength = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Category badge styling
  const getCategoryBadgeClass = (category) => {
    if (category.toLowerCase().includes('tent')) return 'badge bg-primary';
    if (category.toLowerCase().includes('table')) return 'badge bg-success';
    if (category.toLowerCase().includes('chair')) return 'badge bg-warning text-dark';
    return 'badge bg-secondary';
  };

  // Filter and pagination logic
  const filteredItems = rentalItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <img src={logo} className="dashboard-logo" alt="Logo" />
        </div>
        <nav className="nav-menu">
          <a href="#" className="nav-item">
            <FiHome size={18} /> Dashboard
          </a>
          <a href="/admin/dashboard/users" className="nav-item">
            <FiUsers size={18} /> Users
          </a>
          <a href="/admin/dashboard/events" className="nav-item">
            <FiCalendar size={18} /> Events
          </a>
          <a href="/admin/dashboard/registrations" className="nav-item">
            <FiCalendar size={18} /> Event Registration
          </a>
          <a href="#" className="nav-item active">
            <FiBookOpen size={18} /> Rental Items
          </a>
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
            placeholder="Search rental items..." 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Rental Items Section */}
        <div className="product-section">
          <div className="product-header">
            <h1>Rental Items Management</h1>
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
              
              <button className="btn btn-primary" onClick={handleAddItem}>
                <FiPlus size={16} className="me-1" /> Add New Item
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

          {/* Rental Items Table */}
          {!loading && !error && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Base Price</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.item_id}>
                        <td>{item.name}</td>
                        <td>
                          <span className={getCategoryBadgeClass(item.category)}>
                            {item.category}
                          </span>
                        </td>
                        <td>${item.base_price}</td>
                        <td>{truncateDescription(item.description)}</td>
                        <td>
                          <span className={`badge ${item.is_available ? 'bg-success' : 'bg-secondary'}`}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td>{formatDate(item.created_at)}</td>
                        <td>
                          <div className="d-flex">
                            <button 
                              className="btn btn-sm btn-outline-info me-2" 
                              onClick={() => handleViewItem(item)}
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2" 
                              onClick={() => handleEditItem(item)}
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => handleDeleteItem(item.item_id)}
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
                        {searchTerm ? 'No matching items found' : 'No rental items available'}
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
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} entries
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

      {/* Rental Item Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'add' ? 'Add New Rental Item' : modalMode === 'edit' ? 'Edit Rental Item' : 'Rental Item Details'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            {modalMode === 'view' ? (
              <div>
                <h4>{formData.name}</h4>
                <div className="row mt-3">
                  <div className="col-md-6">
                    <p><strong>Category:</strong> {formData.category}</p>
                    <p><strong>Base Price:</strong> ${formData.base_price}</p>
                    <p><strong>Status:</strong> {formData.is_available ? 'Available' : 'Unavailable'}</p>
                    <p><strong>Created At:</strong> {currentItem?.created_at ? formatDate(currentItem.created_at) : 'N/A'}</p>
                  </div>
                  {currentItem?.image && (
                    <div className="col-md-6 text-center">
                      <img 
                        src={currentItem.image} 
                        alt="Rental Item" 
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
                  <Form.Label>Item Name *</Form.Label>
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
                    <Form.Label>Category *</Form.Label>
                    <Form.Control
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3 col-md-6">
                    <Form.Label>Base Price *</Form.Label>
                    <Form.Control
                      type="number"
                      name="base_price"
                      value={formData.base_price}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </Form.Group>
                </div>

                <Form.Group className="mb-3 d-flex align-items-center">
                  <Form.Check
                    type="switch"
                    id="available-switch"
                    label="Available for Rent"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleFormChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Item Photo</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    onChange={handleFormChange}
                    accept="image/*"
                  />
                  {currentItem?.image && (
                    <div className="mt-2">
                      <p>Current Photo:</p>
                      <img 
                        src={currentItem.image} 
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
                  'Add Item'
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

export default RentalItemsAdminPanel;