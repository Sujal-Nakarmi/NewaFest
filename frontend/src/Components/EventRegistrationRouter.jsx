import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import BhintunaDetail from '../Pages/BhintunaDetail';
import IhiDetail from '../Pages/IhiDetail';
import GaiJatra from '../Pages/GaiJatra';

const EventRegistrationRouter = () => {
  const { eventDetailId } = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/adminwork/event-detail/${eventDetailId}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
        setLoading(false);
      }
    };

    if (eventDetailId) {
      fetchEventDetails();
    }
  }, [eventDetailId]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!event) {
    return <Navigate to="/events" />;
  }

  // Case insensitive comparison and trim any whitespace
  const eventName = event.name.toLowerCase().trim();
  
  // Use switch statement for clarity
  switch (eventName) {
    case 'bhintuna':
      return <BhintunaDetail eventDetailId={eventDetailId} event={event} />;
    case 'ihi':
      return <IhiDetail eventDetailId={eventDetailId} event={event} />;
    case 'gai jatra':
      return <GaiJatra eventDetailId={eventDetailId} event={event} />;
    default:
      console.log(`No specific component for event: ${event.name}, using default`);
      return <BhintunaDetail eventDetailId={eventDetailId} event={event} />;
  }
};

export default EventRegistrationRouter;