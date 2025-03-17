import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert } from 'react-bootstrap';
import { FaTrash, FaMinus, FaPlus, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../CSS/Cart.css';
import DeliveryLocationSelector from './DeliveryLocation';

const CartPage = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        navigate('/login/user');
        return;
      }
      
      const response = await axios.get('http://localhost:8000/renting/cart/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCart(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load cart data. Please try again.');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [cartItemId]: true }));
      const token = localStorage.getItem('access_token');
      
      const response = await axios.put(
        `http://localhost:8000/renting/cart/items/${cartItemId}/`,
        { quantity: newQuantity },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setCart(response.data);
    } catch (err) {
      setError('Failed to update quantity. Please try again.');
      console.error('Error updating quantity:', err);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const updateRentalDates = async (cartItemId, startDate, endDate) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [cartItemId]: true }));
      const token = localStorage.getItem('access_token');
      
      const response = await axios.put(
        `http://localhost:8000/renting/cart/items/${cartItemId}/`,
        { 
          rental_start_date: startDate.toISOString().split('T')[0],
          rental_end_date: endDate.toISOString().split('T')[0]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setCart(response.data);
    } catch (err) {
      setError('Failed to update rental dates. Please try again.');
      console.error('Error updating rental dates:', err);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [cartItemId]: true }));
      const token = localStorage.getItem('access_token');
      
      const response = await axios.delete(
        `http://localhost:8000/renting/cart/items/${cartItemId}/remove/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setCart(response.data);
    } catch (err) {
      setError('Failed to remove item. Please try again.');
      console.error('Error removing item:', err);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await axios.delete(
        'http://localhost:8000/renting/cart/clear/',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setCart(response.data);
    } catch (err) {
      setError('Failed to clear cart. Please try again.');
      console.error('Error clearing cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelected = (location) => {
    // Update the cart with the new location
    const updatedCart = { ...cart };
    updatedCart.delivery_location_details = location;
    updatedCart.delivery_fee = parseFloat(location.delivery_charge);
    
    // Recalculate total price
    const itemsTotal = updatedCart.items_total || 
      (updatedCart.items ? updatedCart.items.reduce((total, item) => total + parseFloat(item.price), 0) : 0);
    updatedCart.total_price = (parseFloat(itemsTotal) + parseFloat(updatedCart.delivery_fee)).toFixed(2);
    
    setCart(updatedCart);
  };

  const handleCheckout = () => {
    if (!cart.delivery_location_details) {
      setError('Please select a delivery location before proceeding to checkout.');
      return;
    }
    navigate('/checkout');
  };

  // Calculate total price from the cart data
  const itemsTotal = cart.items_total || (cart.items ? cart.items.reduce((total, item) => total + item.price, 0) : 0);
  const deliveryFee = cart.delivery_fee || 0;
  const totalPrice = cart.total_price || (itemsTotal + deliveryFee);

  // Calculate rental days between two dates
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Container className="py-5 mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your cart...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5 mt-5">
      <h1 className="mb-4">Your Cart</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {cart.items && cart.items.length === 0 ? (
        <div className="text-center py-5">
          <h3>Your cart is empty</h3>
          <p className="mb-4">Looks like you haven't added any items to your cart yet.</p>
          <Button variant="primary" onClick={() => navigate('/rent-traditionals')}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Table responsive className="cart-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Size</th>
                    <th>Price/Day</th>
                    <th>Quantity</th>
                    <th>Rental Period</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items && cart.items.map((item) => (
                    <tr key={item.item_id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.item_image && (
                            <img 
                              src={item.item_image} 
                              alt={item.item_name || "Rental item"} 
                              className="cart-item-image" 
                              onError={(e) => {e.target.onerror = null; e.target.src="/placeholder-image.png"}}
                            />
                          )}
                          <div className="ms-3">
                            <h6 className="mb-0">{item.item_name}</h6>
                          </div>
                        </div>
                      </td>
                      <td>{item.size}</td>
                      <td>Rs {item.unit_price}</td>
                      <td>
                        <div className="quantity-control">
                          <Button 
                            variant="light" 
                            size="sm"
                            onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                            disabled={updateLoading[item.item_id] || item.quantity <= 1}
                          >
                            <FaMinus />
                          </Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button 
                            variant="light" 
                            size="sm"
                            onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                            disabled={updateLoading[item.item_id]}
                          >
                            <FaPlus />
                          </Button>
                        </div>
                      </td>
                      <td>
                        <div className="date-picker-container">
                          <DatePicker
                            selected={item.rental_start_date ? new Date(item.rental_start_date) : new Date()}
                            onChange={(date) => {
                              const endDate = item.rental_end_date ? new Date(item.rental_end_date) : new Date();
                              if (date > endDate) {
                                // If start date is after end date, set end date to start date + 1
                                const newEndDate = new Date(date);
                                newEndDate.setDate(newEndDate.getDate() + 1);
                                updateRentalDates(item.item_id, date, newEndDate);
                              } else {
                                updateRentalDates(item.item_id, date, endDate);
                              }
                            }}
                            selectsStart
                            startDate={item.rental_start_date ? new Date(item.rental_start_date) : new Date()}
                            endDate={item.rental_end_date ? new Date(item.rental_end_date) : new Date()}
                            minDate={new Date()}
                            className="form-control form-control-sm"
                            disabled={updateLoading[item.item_id]}
                            customInput={
                              <div className="d-flex align-items-center">
                                <FaCalendarAlt className="me-2" />
                                <span>
                                  {item.rental_start_date 
                                    ? new Date(item.rental_start_date).toLocaleDateString() 
                                    : 'Select start date'}
                                </span>
                              </div>
                            }
                          />
                          <span className="mx-2">to</span>
                          <DatePicker
                            selected={item.rental_end_date ? new Date(item.rental_end_date) : new Date()}
                            onChange={(date) => {
                              const startDate = item.rental_start_date ? new Date(item.rental_start_date) : new Date();
                              updateRentalDates(item.item_id, startDate, date);
                            }}
                            selectsEnd
                            startDate={item.rental_start_date ? new Date(item.rental_start_date) : new Date()}
                            endDate={item.rental_end_date ? new Date(item.rental_end_date) : new Date()}
                            minDate={item.rental_start_date ? new Date(item.rental_start_date) : new Date()}
                            className="form-control form-control-sm"
                            disabled={updateLoading[item.item_id]}
                            customInput={
                              <div className="d-flex align-items-center">
                                <FaCalendarAlt className="me-2" />
                                <span>
                                  {item.rental_end_date 
                                    ? new Date(item.rental_end_date).toLocaleDateString() 
                                    : 'Select end date'}
                                </span>
                              </div>
                            }
                          />
                          <div className="mt-1 text-muted">
                            {item.rental_start_date && item.rental_end_date && (
                              <small>
                                {calculateDays(item.rental_start_date, item.rental_end_date)} days
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>Rs {item.price}</td>
                      <td>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => removeItem(item.item_id)}
                          disabled={updateLoading[item.item_id]}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Row className="mt-4">
            <Col md={6}>
              <Button 
                variant="outline-secondary" 
                onClick={clearCart}
                disabled={loading}
              >
                Clear Cart
              </Button>
              <Button 
                variant="outline-primary" 
                className="ms-2"
                onClick={() => navigate('/rent-traditionals')}
              >
                Continue Shopping
              </Button>
            </Col>
            <Col md={6}>
              <Card className="summary-card">
                <Card.Body>
                  <h5 className="mb-3">Order Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Items ({cart.items ? cart.items.length : 0}):</span>
                    <span>Rs {itemsTotal}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Delivery Fee:</span>
                    <span>Rs {deliveryFee}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Total:</strong>
                    <strong>Rs {totalPrice}</strong>
                  </div>
                  
                  <DeliveryLocationSelector 
                    onLocationSelected={handleLocationSelected} 
                  />
                  
                  <Button 
                    variant="primary" 
                    className="w-100 mt-3"
                    onClick={handleCheckout}
                    disabled={loading || !cart.items || cart.items.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default CartPage;