import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { 
  FiPackage, 
  FiDollarSign, 
  FiCalendar, 
  FiUser, 
  FiEye, 
  FiHome,
  FiUsers,
  FiBookOpen,
  FiLogOut
} from 'react-icons/fi';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import '../CSS/UsersAdminPanel.css'; // Reusing the same CSS

// Import logo (you'll need to adjust the path to match your project structure)
import logo from "../Assests/Logo.png";

const VendorOrders = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get('http://localhost:8000/renting/orders/lists/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(response.data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("access_token");
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  // Event handlers
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate('/login');
  };

  const handleViewOrder = (order) => {
    setCurrentOrder(order);
    setShowModal(true);
  };

  // Utility functions
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  // Status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'failed':
        return 'badge bg-danger';
      case 'refunded':
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  };

  // Payment method badge styling
  const getPaymentBadgeClass = (method) => {
    switch (method?.toLowerCase()) {
      case 'khalti':
        return 'badge bg-purple';
      case 'cash':
        return 'badge bg-dark';
      default:
        return 'badge bg-secondary';
    }
  };

  // Filter and pagination logic
  const filteredOrders = orders.filter(order => 
    (order.order_id && order.order_id.toString().includes(searchTerm)) ||
    (order.user_name && order.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.status && order.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.payment_method && order.payment_method.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Calculate total revenue
  const calculateTotalRevenue = () => {
    return filteredOrders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => {
        const orderTotal = order.total_amount || 0;
        return total + parseFloat(orderTotal);
      }, 0);
  };

  // Count orders by status
  const countOrdersByStatus = (status) => {
    return filteredOrders.filter(order => order.status === status).length;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <img src={logo} className="dashboard-logo" alt="Logo" />
        </div>
        <nav className="nav-menu">
          <a href="/vendor/dashboard" className="nav-item">
            <FiPackage size={18} /> My Products
          </a>
          <a href="/vendor/orders" className="nav-item active">
            <FiCalendar size={18} /> Orders
          </a>
          <a href="/vendor/size-variants" className="nav-item">
            <FiUser size={18} /> Size Variants
          </a>
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
          <h4 className="m-0">Welcome Vendor!</h4>
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Order Stats Cards */}
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-primary shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                      Total Orders
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">{filteredOrders.length}</div>
                  </div>
                  <div className="col-auto">
                    <FiCalendar size={28} className="text-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        

          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-info shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                      Completed Orders
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">{countOrdersByStatus('completed')}</div>
                  </div>
                  <div className="col-auto">
                    <FiUser size={28} className="text-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-warning shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                      Pending Orders
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">{countOrdersByStatus('pending')}</div>
                  </div>
                  <div className="col-auto">
                    <FiCalendar size={28} className="text-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="product-section">
          <div className="product-header">
            <h1>All Orders</h1>
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

          {/* Orders Table */}
          {!loading && !error && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                    <th>Transaction ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr key={order.order_id}>
                        <td>#{order.order_id}</td>
                        <td>{order.user_name || 'Unknown'}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          <span className={getStatusBadgeClass(order.status)}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span className={getPaymentBadgeClass(order.payment_method)}>
                            {order.payment_method_display || order.payment_method}
                          </span>
                        </td>
                        <td>
                          {order.transaction_id || 'N/A'}
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-info" 
                            onClick={() => handleViewOrder(order)}
                            title="View Details"
                          >
                            <FiEye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        {searchTerm ? 'No matching orders found' : 'No orders available'}
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
                  Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} entries
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

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Order Details - #{currentOrder?.order_id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrder && (
            <div>
              <div className="row">
                <div className="col-md-6">
                  <h5>Order Information</h5>
                  <p><strong>Order ID:</strong> #{currentOrder.order_id}</p>
                  <p><strong>Created:</strong> {formatDate(currentOrder.created_at)}</p>
                  <p><strong>Last Updated:</strong> {formatDate(currentOrder.updated_at)}</p>
                  <p>
                    <strong>Status:</strong> 
                    <span className={getStatusBadgeClass(currentOrder.status)}>
                      {currentOrder.status}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <h5>Customer Information</h5>
                  <p><strong>Name:</strong> {currentOrder.user_name || 'Unknown'}</p>
                  <p><strong>Email:</strong> {currentOrder.user_email || 'Not available'}</p>
                </div>
              </div>

              <hr />

              <div className="row">
                <div className="col-md-6">
                  <h5>Payment Details</h5>
                  <p>
                    <strong>Payment Method:</strong> 
                    <span className={getPaymentBadgeClass(currentOrder.payment_method)}>
                      {currentOrder.payment_method_display || currentOrder.payment_method}
                    </span>
                  </p>
                  <p><strong>Transaction ID:</strong> {currentOrder.transaction_id || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <h5>Order Summary</h5>
                  <p><strong>Total Items:</strong> {currentOrder.items?.length || 0}</p>
                  <p><strong>Total Amount:</strong> ${currentOrder.total_amount || '0.00'}</p>
                </div>
              </div>

              <hr />

              <h5>Order Items</h5>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th>Size</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Rental Period</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrder.items?.length > 0 ? (
                      currentOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.item_name || 'Unknown Product'}</td>
                          <td>{item.size || 'N/A'}</td>
                          <td>${parseFloat(item.price).toFixed(2) || '0.00'}</td>
                          <td>{item.quantity || 1}</td>
                          <td>
                            {item.rental_start_date && item.rental_end_date ? 
                              `${item.rental_start_date} to ${item.rental_end_date}` : 
                              'N/A'}
                          </td>
                          <td>${(parseFloat(item.price) * item.quantity).toFixed(2) || '0.00'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">No items in this order</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="5" className="text-end"><strong>Total:</strong></td>
                      <td>${currentOrder.total_amount || '0.00'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {currentOrder.khalti_data && (
                <>
                  <hr />
                  <h5>Khalti Payment Information</h5>
                  <div className="bg-light p-3 rounded">
                    <pre className="mb-0">{JSON.stringify(currentOrder.khalti_data, null, 2)}</pre>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Outlet />
    </div>
  );
};

export default VendorOrders;