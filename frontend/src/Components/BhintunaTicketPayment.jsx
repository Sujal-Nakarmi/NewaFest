import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function BhintunaTicketPayment({ 
  show, 
  handleClose, 
  eventRegistrationId 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // Initiate ticket payment
  const initiatePayment = async () => {
    setIsLoading(true);
    setPaymentError(null);

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error('You must be logged in to purchase a ticket');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/adminwork/tickets/initiate_payment/',
        { 
          registration_id: eventRegistrationId,
          return_url: 'http://localhost:5173/ticket/payment/success'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Store ticket details for later verification
      setTicketDetails(response.data);

      // Redirect to Khalti payment URL
      window.location.href = response.data.payment_url;
    } catch (error) {
      console.error('Payment initiation error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to initiate payment';
      setPaymentError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Verify ticket payment after returning from Khalti
  const verifyPayment = async (pidx) => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await axios.post(
        'http://localhost:8000/adminwork/tickets/verify-payment/',
        { pidx },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Ticket payment successful!');
        handleClose();
      } else {
        toast.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for payment verification on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pidx = urlParams.get('pidx');

    if (pidx) {
      verifyPayment(pidx);
    }
  }, []);

  return (
    <>
      <ToastContainer />
      
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bhintuna Rally Ticket Payment</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {paymentError && (
            <Alert variant="danger">
              {paymentError}
            </Alert>
          )}
          
          <div className="payment-details">
            <p>Event: Bhintuna Rally</p>
            <p>Ticket Price: NPR 200</p>
          </div>
          
          <Button 
            variant="primary" 
            onClick={initiatePayment} 
            disabled={isLoading}
            className="w-100"
          >
            {isLoading ? 'Processing...' : 'Pay with Khalti'}
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default BhintunaTicketPayment;