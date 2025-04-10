import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert } from 'react-bootstrap';
import { FaTrash, FaMinus, FaPlus, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../CSS/Cart.css';
import NavBar from './NavBar';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click handler component
const LocationMarker = ({ setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const CartPage = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState({});
  const navigate = useNavigate();

  // Location selection state
  const [position, setPosition] = useState([27.7172, 85.3240]); // Default to Kathmandu
  const [address, setAddress] = useState("");

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
      
      // If the cart already has location data, set it
      if (response.data.location_latitude && response.data.location_longitude) {
        setPosition([response.data.location_latitude, response.data.location_longitude]);
      }
      
      if (response.data.full_location) {
        setAddress(response.data.full_location);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load cart data. Please try again.');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocode to get address from coordinates
  useEffect(() => {
    const getAddressFromCoordinates = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        if (data && data.display_name) {
          setAddress(data.display_name);
          
          // Update cart with new location information
          updateCartLocation(data.display_name, position[0], position[1]);
        }
      } catch (error) {
        console.error("Error getting address:", error);
      }
    };

    if (position) {
      getAddressFromCoordinates();
    }
  }, [position]);

  const updateCartLocation = async (fullLocation, latitude, longitude) => {
    try {
      const token = localStorage.getItem('access_token');
      
      await axios.put(
        'http://localhost:8000/renting/cart/update-delivery-location/',
        { 
          full_location: fullLocation,
          location_latitude: latitude,
          location_longitude: longitude
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update local cart object with new location data
      setCart(prevCart => ({
        ...prevCart,
        full_location: fullLocation,
        location_latitude: latitude,
        location_longitude: longitude
      }));
      
    } catch (err) {
      console.error('Error updating cart location:', err);
      setError('Failed to update delivery location. Please try again.');
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

  const handleCheckout = async () => {
    if (!address) {
      setError('Please select a delivery location on the map before proceeding to checkout.');
      return;
    }
    
 // In handleCheckout function
try {
  setLoading(true);
  const token = localStorage.getItem('access_token');
  
  console.log("Updating cart location before checkout:", {
    full_location: address,
    location_latitude: position[0],
    location_longitude: position[1]
  });
  
  const response = await axios.put(
    'http://localhost:8000/renting/cart/update-delivery-location/',
    { 
      full_location: address,
      location_latitude: position[0],
      location_longitude: position[1]
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  console.log("Location update successful:", response.data);
  console.log("Navigating to checkout page...");
  navigate('/checkout');
} catch (err) {
  console.error('Error details:', err.response?.data || err.message);
  setError(`Failed to proceed to checkout: ${err.response?.data?.error || err.message}`);
} finally {
      setLoading(false); // Reset loading state
    }
  };

  const itemsTotal = cart.items_total || (cart.items ? cart.items.reduce((total, item) => total + item.price, 0) : 0);
  const deliveryFee = cart.delivery_fee || 0;
  const totalPrice = cart.total_price || (itemsTotal + deliveryFee);

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
    <div>
      <NavBar/><br/><br/>
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
                          <div className="d-flex align-items-center flex-wrap">
                            <div className="me-2">
                              <small className="text-muted d-block">Start Date</small>
                              <DatePicker
                                selected={item.rental_start_date ? new Date(item.rental_start_date) : new Date()}
                                onChange={(date) => {
                                  const endDate = item.rental_end_date ? new Date(item.rental_end_date) : new Date();
                                  if (date > endDate) {
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
                                    <FaCalendarAlt className="me-1 cart-calendar" />
                                    <span>
                                      {item.rental_start_date 
                                        ? new Date(item.rental_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                                        : 'Select'}
                                    </span>
                                  </div>
                                }
                              />
                            </div>
                            <div className="me-2">
                              <small className="text-muted d-block">End Date</small>
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
                                    <FaCalendarAlt className="me-1 cart-calendar" />
                                    <span>
                                      {item.rental_end_date 
                                        ? new Date(item.rental_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                                        : 'Select'}
                                    </span>
                                  </div>
                                }
                              />
                            </div>
                            <div>
                              <small className="text-muted d-block">Days</small>
                              <div className="days-badge">
                                {item.rental_start_date && item.rental_end_date ? (
                                  calculateDays(item.rental_start_date, item.rental_end_date)
                                ) : (
                                  '--'
                                )}
                              </div>
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
                  variant="outline-secondary" 
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
                    
                    {/* Map Component for Location Selection */}
                    <div className="location-selection-container mb-4">
                      <h6 className="mb-3 d-flex align-items-center">
                        <FaMapMarkerAlt className="me-2" /> Select Delivery Location
                      </h6>
                      <div className="map-container" style={{ height: "300px", width: "100%" }}>
                        <MapContainer 
                          center={position} 
                          zoom={13} 
                          style={{ height: "100%", width: "100%" }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <LocationMarker setPosition={setPosition} />
                          {position && (
                            <Marker position={position}>
                              <Popup>
                                Delivery Location<br />
                                {address || "Click to select this location"}
                              </Popup>
                            </Marker>
                          )}
                        </MapContainer>
                        <small className="text-muted mt-2 d-block">Click on the map to select your delivery location.</small>
                      </div>
                    </div>
                    
                    {/* Selected Address Display */}
                    {address && (
                      <div className="selected-location mt-3 mb-4">
                        <div className="d-flex align-items-start">
                          <FaMapMarkerAlt className="mt-1 me-2" />
                          <div>
                            <h6 className="mb-1">Selected Location:</h6>
                            <p className="mb-0">{address}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      className="w-100 mt-3" 
                      style={{ backgroundColor: "#8B0000", color: "white" }}
                      onClick={handleCheckout}
                      disabled={
                        loading || 
                        !cart.items || 
                        cart.items.length === 0 ||
                        !address
                      }
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
    </div>
  );
};

export default CartPage;