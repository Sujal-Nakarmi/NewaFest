import { useState, useEffect } from "react";
import { Container, Table, Button, Badge, Toast, Spinner, Row, Col } from "react-bootstrap";
import axios from "axios";
import { FaShoppingBag, FaCalendarAlt, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../CSS/OrderHistory.css";
import NavBar from '../Components/NavBar';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const navigate = useNavigate();

  // Status badge colors
  const statusVariant = {
    pending: "warning",
    completed: "success",
    failed: "danger",
    refunded: "info",
    cancelled: "secondary"
  };

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        console.log("Fetching orders with token:", token);

        // Fixed API URL to match the one working in Postman
        const response = await axios.get("http://localhost:8000/renting/orders/history/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("API Response:", response.data);
        setApiResponse(response.data);

        // Handling the response properly based on the actual structure
        if (response.data && response.data.success) {
          console.log("Orders loaded:", response.data.orders);
          setOrders(response.data.orders || []);
        } else {
          console.error("API returned success:false or missing data", response.data);
          setError("Failed to fetch orders: API returned success:false");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        const errorMessage = err.response?.data?.error || err.message || "Failed to fetch order history";
        setError(errorMessage);
        setShowToast(true);
        setToastMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // Debug information component
  const DebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="mt-5 p-3 border border-warning" style={{background: '#fffbea'}}>
        <h5>Debug Information</h5>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>Orders Length: {orders?.length || 0}</p>
        <div>
          <h6>API Response:</h6>
          <pre style={{maxHeight: '200px', overflow: 'auto'}}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <Container className="d-flex flex-column justify-content-center align-items-center" style={{ height: "50vh" }}>
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Loading your order history...</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar /><br/><br/><br/>
      <Container className="py-5 order-history-container">
        {/* Back Button and Title Row */}
        <Row className="mb-4 align-items-center">
          <Col xs="auto">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate("/rent-traditionals")}
              className="d-flex align-items-center"
            >
              <FaArrowLeft className="me-2" />
              Back to Renting
            </Button>
          </Col>
          <Col className="text-end">
            <span className="text-muted">Total Orders: {orders?.length || 0}</span>
          </Col>
        </Row>

        {/* Main Title */}
        <h2 className="order-history-title mb-4">
          <FaShoppingBag className="me-2" />
          My Orders
        </h2>

        {/* Display error if present */}
        {error && (
          <div className="alert alert-danger">
            <h5>Error loading order history</h5>
            <p>{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {!error && orders?.length === 0 ? (
          <div className="text-center py-5 empty-orders">
            <h4>No orders found</h4>
            <p className="text-muted">You haven't placed any orders yet</p>
            <Button variant="primary" onClick={() => navigate("/rent-traditionals")}>
              Rent Items Now
            </Button>
          </div>
        ) : !error && (
          <Table responsive bordered hover className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr key={order.order_id}>
                  <td>#{order.order_id}</td>
                  <td>
                    <FaCalendarAlt className="me-2 text-muted" />
                    {formatDate(order.created_at)}
                  </td>
                  <td>
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td>
                    Rs {order.total_amount?.toFixed(2)}
                  </td>
                  <td>
                    <Badge bg={statusVariant[order.status] || "secondary"} className="status-badge">
                      {order.status}
                    </Badge>
                  </td>
                
                </tr>
              ))}
            </tbody>
          </Table>
        )}

     
      </Container>
    </>
  );
};

export default OrderHistory;