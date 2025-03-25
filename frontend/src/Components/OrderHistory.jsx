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

        const response = await axios.get("http://localhost:8000/renting/orders/history/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setError("Failed to fetch orders");
        }
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch order history");
        setShowToast(true);
        setToastMessage(err.response?.data?.error || "Failed to fetch order history");
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

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <h4>Error loading order history</h4>
        <p className="text-muted">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
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
            <span className="text-muted">Total Orders: {orders.length}</span>
          </Col>
        </Row>

        {/* Main Title */}
        <h2 className="order-history-title mb-4">
          <FaShoppingBag className="me-2" />
          My Orders
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-5 empty-orders">
            <h4>No orders found</h4>
            <p className="text-muted">You haven't placed any orders yet</p>
            <Button variant="primary" onClick={() => navigate("/rent-traditionals")}>
              Rent Items Now
            </Button>
          </div>
        ) : (
          <Table responsive bordered hover className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
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
                    Rs {order.total_price.toFixed(2)}
                  </td>
                  <td>
                    <Badge bg={statusVariant[order.status]} className="status-badge">
                      {order.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewDetails(order.order_id)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Toast for errors */}
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={5000}
          autohide
          bg="danger"
          className="position-fixed bottom-0 end-0 m-3"
        >
          <Toast.Header>
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </Container>
    </>
  );
};

export default OrderHistory;