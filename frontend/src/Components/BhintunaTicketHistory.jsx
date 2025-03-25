import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Container, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { format } from 'date-fns';

function BhintunaTicketHistory() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketHistory = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('You must be logged in to view ticket history');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          'http://localhost:8000/adminwork/tickets/history/',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setTickets(response.data.tickets);
        setIsLoading(false);
      } catch (error) {
        console.error('Ticket history error:', error);
        setError('Failed to fetch ticket history');
        setIsLoading(false);
      }
    };

    fetchTicketHistory();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge bg="success">Paid</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'failed':
        return <Badge bg="danger">Failed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Card.Header>
          <h3>Ticket History</h3>
        </Card.Header>
        <Card.Body>
          {tickets.length === 0 ? (
            <p>No tickets found.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Event Name</th>
                  <th>Event Date</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Purchase Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.ticket_id}>
                    <td>{ticket.ticket_id}</td>
                    <td>{ticket.event_name}</td>
                    <td>{format(new Date(ticket.event_date), 'dd MMM yyyy')}</td>
                    <td>NPR {ticket.price.toFixed(2)}</td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td>{format(new Date(ticket.created_at), 'dd MMM yyyy HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default BhintunaTicketHistory;