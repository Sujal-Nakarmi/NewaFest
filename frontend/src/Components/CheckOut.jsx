import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem('access_token');
  
      if (!token) {
        navigate('/login/user');
        return;
      }
  
      const response = await axios.get('http://localhost:8000/renting/cart/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Cart API Response in Frontend:", response.data); // Debugging
  
      if (!response.data.items || response.data.items.length === 0) {
        setError('Your cart is empty or has been processed. Please add items to your cart.');
        navigate('/rent-traditionals');
        return;
      }
  
  // Replace this check in fetchCartData()
if (!response.data.delivery_location_details) {
  // With this check instead
  if (!response.data.full_location) {
    setError('Please select a delivery location before checkout.');
    navigate('/cart');
    return;
  }
}
  
      setCart(response.data);
    } catch (err) {
      setError('Failed to load checkout data. Please try again.');
      console.error('Error fetching cart for checkout:', err);
    } finally {
      setFetchLoading(false);
    }
  };
  
  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(
        'http://localhost:8000/renting/api/initiate-payment/', 
        {
          cart_id: cart.cart_id,
          return_url: window.location.origin + '/payment/success'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Redirect to Khalti payment page
      window.location.href = response.data.payment_url;
    } catch (error) {
      console.error('Payment initiation failed', error);
      setError('Payment initiation failed. Please try again.');
      setIsLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Container className="py-5 mt-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-2">Loading checkout information...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button 
          variant="primary"
          onClick={() => navigate('/cart')}
        >
          Return to Cart
        </Button>
      </Container>
    );
  }

  if (!cart) {
    return (
      <Container className="py-5 mt-5">
        <Alert variant="warning">No checkout information available.</Alert>
        <Button 
          variant="primary"
          onClick={() => navigate('/rent-traditionals')}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5 mt-5">
      <h2 className="mb-4">Checkout</h2>
      
      <Card className="mb-4">
        <Card.Header as="h5">Order Summary</Card.Header>
        <Card.Body>
          <div className="mb-3">
            {cart.items.map(item => (
              <div key={item.item_id} className="d-flex justify-content-between mb-2">
                <div>
                  <strong>{item.item_name}</strong> ({item.size}) x {item.quantity}
                  <div className="text-muted small">
                    {new Date(item.rental_start_date).toLocaleDateString()} to {new Date(item.rental_end_date).toLocaleDateString()}
                  </div>
                </div>
                <div>Rs {item.price}</div>
              </div>
            ))}
          </div>
          
          <hr />
          
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal:</span>
            <span>Rs {cart.items_total}</span>
          </div>
          
          <div className="d-flex justify-content-between mb-2">
            <span>Delivery Fee:</span>
            <span>Rs {cart.delivery_fee}</span>
          </div>
          
          <div className="d-flex justify-content-between mt-3">
            <strong>Total:</strong>
            <strong>Rs {cart.total_price}</strong>
          </div>
        </Card.Body>
      </Card>

     
<Card className="mb-4">
  <Card.Header as="h5">Delivery Information</Card.Header>
  <Card.Body>
    <div className="mb-3">
      <strong>Delivery Location:</strong>
      <p className="mt-2">{cart.full_location}</p>
    </div>
    
    {/* You can also display a small static map if you want */}
    {cart.location_latitude && cart.location_longitude && (
      <div className="mt-3">
        <img 
          src={`https://maps.googleapis.com/maps/api/staticmap?center=${cart.location_latitude},${cart.location_longitude}&zoom=15&size=600x300&markers=color:red%7C${cart.location_latitude},${cart.location_longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`}
          alt="Delivery Location Map"
          className="img-fluid rounded"
        />
      </div>
    )}
  </Card.Body>
</Card>
      
    
      
      <div className="d-grid gap-2">
        <Button 
          onClick={handleCheckout}
          disabled={isLoading}
          size="lg"
          variant="success"
        >
          {isLoading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Processing...</span>
            </>
          ) : 'Pay with Khalti'}
        </Button>
        
        <Button 
          variant="outline-secondary"
          size="md"
          onClick={() => navigate('/cart')}
          className="mt-2"
        >
          Return to Cart
        </Button>
      </div>
    </Container>
  );
};

export default Checkout;