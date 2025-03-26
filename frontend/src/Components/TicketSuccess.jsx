import React, { useEffect, useState } from 'react';
import { Container, Alert, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const TicketPaymentSuccess = () => {
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get pidx from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const pidx = queryParams.get('pidx');
    
    if (!pidx) {
      setVerificationStatus('error');
      setErrorMessage('Payment verification failed. Missing payment identifier.');
      return;
    }
    
    verifyPayment(pidx);
  }, [location]);

  const verifyPayment = async (pidx) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('Authentication error. Please log in again.');
        navigate('/login/user');
        return;
      }
      
      const response = await axios.post(
        'http://localhost:8000/adminwork/tickets/verify-payment/',
        { pidx },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setVerificationStatus('success');
        setOrderDetails({
          orderId: response.data.order_id,
          ticketId: response.data.ticket_id,
          registrationId: response.data.event_registration_id,
        });
      } else {
        setVerificationStatus('error');
        setErrorMessage(response.data.message || 'Payment verification failed.');
      }
    } catch (error) {
      console.error('Payment verification failed', error);
      setVerificationStatus('error');
      setErrorMessage(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Payment verification failed. Please contact support.'
      );
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Verifying your payment...</p>
          </div>
        );
        
      case 'success':
        return (
          <>
            <Alert variant="success" className="mb-4">
              <Alert.Heading>Payment Successful!</Alert.Heading>
              <p>
                Your payment has been processed successfully. We have received your registration detail.
              </p>
            </Alert>
            
            <Card className="mb-4">
              <Card.Header as="h5">Registration Information</Card.Header>
              <Card.Body>
                
                <p><strong>Ticket ID:</strong> {orderDetails?.ticketId}</p>
                <p><strong>Registration ID:</strong> {orderDetails?.registrationId}</p>
              </Card.Body>
            </Card>
            
            <div className="d-grid gap-2">
              <Button 
                variant="outline-secondary"
                onClick={() => navigate('/')}
                className="mt-2"
              >
                Return to Home
              </Button>
            </div>
          </>
        );
        
      case 'error':
        return (
          <>
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Payment Verification Failed</Alert.Heading>
              <p>{errorMessage}</p>
            </Alert>
            
            <div className="d-grid gap-2">
              <Button 
                variant="primary"
                size="lg"
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
              
              <Button 
                variant="outline-secondary"
                onClick={() => navigate('/contact')}
                className="mt-2"
              >
                Contact Support
              </Button>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container className="py-5 mt-5">
      <h2 className="mb-4">Payment Status</h2>
      {renderContent()}
    </Container>
  );
};

export default TicketPaymentSuccess;
