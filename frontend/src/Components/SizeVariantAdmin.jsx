import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Spinner, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiPackage, 
  FiCalendar,
  FiUser,
  FiLogOut,
  FiUsers,
  FiHome
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../CSS/UsersAdminPanel.css';
import { Link } from "react-router-dom";

// Import logo (you'll need to adjust the path to match your project structure)
import logo from "../Assests/Logo.png";

const SizeVariantManagerAdmin = () => {
  // State management
  const [rentalItems, setRentalItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sizeVariants, setSizeVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [variantLoading, setVariantLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentVariant, setCurrentVariant] = useState(null);
  const [formData, setFormData] = useState({
    size: '',
    quantity: 1,
    price: '',
    is_default: false
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

  // Fetch rental items when component mounts
  useEffect(() => {
    fetchRentalItems();
  }, []);

  // Fetch size variants when a rental item is selected
  useEffect(() => {
    if (selectedItem) {
      fetchSizeVariants(selectedItem.item_id);
    }
  }, [selectedItem]);

  // Reset form data when modal opens
  useEffect(() => {
    if (showModal && currentVariant) {
      setFormData({
        size: currentVariant.size || '',
        quantity: currentVariant.quantity || 1,
        price: currentVariant.price || '',
        is_default: currentVariant.is_default || false
      });
    } else if (showModal) {
      setFormData({
        size: '',
        quantity: 1,
        price: '',
        is_default: false
      });
    }
  }, [showModal, currentVariant]);

  // Fetch all rental items
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
      // Select the first item by default if available
      if (response.data.length > 0) {
        setSelectedItem(response.data[0]);
      }
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

  // Fetch size variants for a specific rental item
  const fetchSizeVariants = async (itemId) => {
    setVariantLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`http://localhost:8000/renting/renting/rental-items/${itemId}/size-variants/all/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSizeVariants(response.data);
    } catch (err) {
      console.error('Error fetching size variants:', err);
      setError('Failed to load size variants. Please try again later.');
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("access_token");
        navigate('/login');
      }
    } finally {
      setVariantLoading(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Open modal to add a new size variant
  const handleAddVariant = () => {
    setCurrentVariant(null);
    setModalMode('add');
    setShowModal(true);
  };

  // Open modal to edit an existing size variant
  const handleEditVariant = (variant) => {
    setCurrentVariant(variant);
    setModalMode('edit');
    setShowModal(true);
  };

  // Handle size variant deletion
  const handleDeleteVariant = async (variantId) => {
    if (!selectedItem) return;
    
    if (window.confirm('Are you sure you want to delete this size variant? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem("access_token");
        await axios.delete(`http://localhost:8000/renting/renting/rental-items/${selectedItem.item_id}/size-variants/${variantId}/delete/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Refresh size variants list
        fetchSizeVariants(selectedItem.item_id);
      } catch (err) {
        console.error('Error deleting size variant:', err);
        if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error);
        } else {
          alert('Failed to delete size variant. Please try again.');
        }
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem("access_token");
          navigate('/login');
        }
      }
    }
  };

  // Handle form submission for adding/editing size variant
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("access_token");
      let response;
      
      if (modalMode === 'add') {
        response = await axios.post(
          `http://localhost:8000/renting/renting/rental-items/${selectedItem.item_id}/size-variants/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        response = await axios.put(
          `http://localhost:8000/renting/renting/rental-items/${selectedItem.item_id}/size-variants/${currentVariant.variant_id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      setShowModal(false);
      fetchSizeVariants(selectedItem.item_id);
    } catch (err) {
      console.error('Error saving size variant:', err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert('Failed to save size variant. Please try again.');
      }
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("access_token");
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle change of selected rental item
  const handleItemChange = (e) => {
    const itemId = parseInt(e.target.value);
    const item = rentalItems.find(item => item.item_id === itemId);
    setSelectedItem(item);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate('/login');
  };

  // Get category badge style
  const getCategoryBadgeClass = (category) => {
    if (!category) return 'badge bg-secondary';
    if (category.toLowerCase().includes('tent')) return 'badge bg-primary';
    if (category.toLowerCase().includes('table')) return 'badge bg-success';
    if (category.toLowerCase().includes('chair')) return 'badge bg-warning text-dark';
    return 'badge bg-secondary';
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <img src={logo} className="dashboard-logo" alt="Logo" />
        </div>
        <nav className="nav-menu">
           <a href="/admin/dashboard/all" className="nav-item">
                      <FiHome size={18} /> Dashboard
                    </a>
            <a href="/admin/dashboard/users" className="nav-item ">
                        <FiUsers size={18} /> Users
                      </a>

         
         
          <Link to="/admin/dashboard/events" className="nav-item">
            <FiCalendar size={18} /> Events
          </Link>
          <Link to="/admin/dashboard/registrations" className="nav-item">
                      <FiCalendar size={18} /> Event Registration
                    </Link>
                    <Link to="/admin/dashboard/rentals" className="nav-item">
                      <FiCalendar size={18} /> Rental Items
                    </Link>
                    <a href="/admin/size-variants" className="nav-item active">
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
        </div>

        {/* Size Variants Section */}
        <div className="product-section">
          <div className="product-header">
            <h1>Size Variant Management</h1>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}

          {/* Error Message */}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Content when loaded */}
          {!loading && rentalItems.length > 0 && (
            <Card className="shadow-sm">
              <Card.Body>
                {/* Item Selection Dropdown */}
                <Form.Group className="mb-4">
                  <Form.Label><strong>Select Product</strong></Form.Label>
                  <Form.Select 
                    value={selectedItem?.item_id || ''} 
                    onChange={handleItemChange}
                    className="form-select"
                  >
                    {rentalItems.map(item => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Selected Item Details - REDESIGNED */}
                {selectedItem && (
                  <div className="mb-4 product-details-container border rounded p-3">
                    <Row className="align-items-center">
                      <Col md={9}>
                        <h5 className="mb-3">{selectedItem.name}</h5>
                        <Row className="mb-3">
                          <Col md={4} className="mb-2 mb-md-0">
                            <div className="d-flex align-items-center">
                              <span className="text-muted me-2">Category:</span>
                              <span className={getCategoryBadgeClass(selectedItem.category)}>
                                {selectedItem.category || 'N/A'}
                              </span>
                            </div>
                          </Col>
                          <Col md={4} className="mb-2 mb-md-0">
                            <div className="d-flex align-items-center">
                              <span className="text-muted me-2">Base Price:</span>
                              <span className="fw-bold">Rs {selectedItem.base_price}</span>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="d-flex align-items-center">
                              <span className="text-muted me-2">Status:</span>
                              <span className={`badge ${selectedItem.is_available ? 'bg-success' : 'bg-secondary'}`}>
                                {selectedItem.is_available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                          </Col>
                        </Row>
                      </Col>
                      {selectedItem.image && (
                        <Col md={3} className="text-center">
                          <img 
                            src={selectedItem.image} 
                            alt={selectedItem.name} 
                            className="img-thumbnail"
                            style={{ maxHeight: '120px', maxWidth: '100%' }} 
                          />
                        </Col>
                      )}
                    </Row>
                  </div>
                )}

                {/* Size Variants Section - IMPROVED HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-3 mt-4 border-bottom pb-2">
                  <h5 className="mb-0">Size Variants</h5>
                  {selectedItem && (
                    <Button variant="primary" onClick={handleAddVariant}>
                      <FiPlus size={16} className="me-1" /> Add Size Variant
                    </Button>
                  )}
                </div>

                {/* Size Variants Loading */}
                {variantLoading && (
                  <div className="text-center my-4">
                    <Spinner animation="border" size="sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                )}

                {/* Size Variants Table */}
                {!variantLoading && selectedItem && (
                  <>
                    {sizeVariants.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover ">
                          <thead className="table-light">
                            <tr>
                              <th>Size</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Default</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sizeVariants.map(variant => (
                              <tr key={variant.variant_id}>
                                <td className="align-middle">{variant.size}</td>
                                <td className="align-middle">{variant.quantity}</td>
                                <td className="align-middle">Rs {variant.price || selectedItem.base_price}</td>
                                <td className="align-middle">
                                  {variant.is_default ? (
                                    <Badge bg="success">Default</Badge>
                                  ) : (
                                    <Badge bg="secondary">No</Badge>
                                  )}
                                </td>
                                <td className="align-middle">
                                  <div className="d-flex">
                                    <button 
                                      className="btn btn-sm btn-outline-primary me-2" 
                                      onClick={() => handleEditVariant(variant)}
                                      title="Edit"
                                    >
                                      <FiEdit size={16} />
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-outline-danger" 
                                      onClick={() => handleDeleteVariant(variant.variant_id)}
                                      title="Delete"
                                    >
                                      <FiTrash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <Alert variant="info">
                        No size variants found for this item. Click 'Add Size Variant' to create one.
                      </Alert>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Message when no items are available */}
          {!loading && rentalItems.length === 0 && (
            <Alert variant="warning">
              No rental items found. Please add some items first before managing size variants.
            </Alert>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Size Variant */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'add' ? 'Add Size Variant' : 'Edit Size Variant'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Size *</Form.Label>
              <Form.Control
                type="text"
                name="size"
                value={formData.size}
                onChange={handleFormChange}
                placeholder="e.g., Small, Medium, Large, 10x10"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity *</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                min="1"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Price (Optional - if empty, base price will be used)
              </Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                min="0"
                step="0.01"
                placeholder={selectedItem ? `Default: Rs ${selectedItem.base_price}` : 'Enter price'}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="default-size-variant"
                label="Set as default size variant"
                name="is_default"
                checked={formData.is_default}
                onChange={handleFormChange}
              />
              <Form.Text className="text-muted">
                The default size will be pre-selected for customers.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" />
                  <span className="ms-2">Saving...</span>
                </>
              ) : (
                'Save'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default SizeVariantManagerAdmin;