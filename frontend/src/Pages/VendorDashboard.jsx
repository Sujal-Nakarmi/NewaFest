import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiDollarSign, FiCalendar, FiUser } from 'react-icons/fi';

const VendorDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/renting/api/vendor/dashboard/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data.stats);
        setRecentOrders(response.data.recent_orders);
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner animation="border" />;

  return (
    <Container fluid>
      <h2 className="my-4">Vendor Dashboard</h2>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total Products</h6>
                  <h3>{stats.total_products || 0}</h3>
                </div>
                <FiPackage size={24} className="text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Active Rentals</h6>
                  <h3>{stats.active_rentals || 0}</h3>
                </div>
                <FiCalendar size={24} className="text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">This Month's Revenue</h6>
                  <h3>Rs {stats.monthly_revenue || 0}</h3>
                </div>
                <FiDollarSign size={24} className="text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Pending Returns</h6>
                  <h3>{stats.pending_returns || 0}</h3>
                </div>
                <FiUser size={24} className="text-info" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Card className="mb-4">
        <Card.Header>
          <h5>Recent Orders</h5>
        </Card.Header>
        <Card.Body>
          <Table striped hover>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.order_id}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.item_count} items</td>
                  <td>Rs {order.total_price}</td>
                  <td>
                    <span className={`badge bg-${order.status === 'completed' ? 'success' : 'warning'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => navigate(`/vendor/orders/${order.order_id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <Row>
        <Col md={4}>
          <Button 
            variant="primary" 
            className="w-100 mb-2"
            onClick={() => navigate('/vendor/products/add')}
          >
            Add New Product
          </Button>
        </Col>
        <Col md={4}>
          <Button 
            variant="outline-primary" 
            className="w-100 mb-2"
            onClick={() => navigate('/vendor/products')}
          >
            Manage Products
          </Button>
        </Col>
        <Col md={4}>
          <Button 
            variant="outline-secondary" 
            className="w-100 mb-2"
            onClick={() => navigate('/vendor/orders')}
          >
            View All Orders
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default VendorDashboard;