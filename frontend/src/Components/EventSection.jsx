import React, { useState, useEffect } from 'react';
import '../CSS/EventSection.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const EventSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Replace with your actual API URL
        const response = await axios.get('http://localhost:8000/adminwork/events');
        console.log('Fetched events:', response.data); // For debugging
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch events');
        setLoading(false);
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'long' }),
      day: date.getDate()
    };
  };

  if (loading) return <div className="text-center mt-5">Loading events...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;

  return (
    <div>
      <div>
        <h2 className='text-center Event_heading'>Events</h2>
      </div>

      {events.length === 0 ? (
        <div className="text-center mt-5">No events found</div>
      ) : (
        events.map((event, index) => {
          const date = formatDate(event.start_time);
          const eventDetailId = event.event_detail_id; // Safe check for details array
          
          return (
            <div key={event.event_id}>
              <div className="container mt-5">
                {index > 0 && <hr className="eventonehr" />}
                <div className="row align-items-center">
                  <div className="col-md-2 text-center">
                    <div className="date-box">
                      <div className="month">{date.month}</div>
                      <hr />
                      <div className="day display-1">{date.day}</div>
                    </div>
                  </div>
                  <div className="col-md-5">
                    {/* The photo URL should already be fully formed from the backend */}
                    <img
                      src={event.photo || "https://via.placeholder.com/400x300"}
                      alt={event.name}
                      className="img-fluid rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x300";
                      }}
                    />
                  </div>
                  <div className="col-md-5">
                    <h3 className="mb-3 event_name">{event.name}</h3>
                    <p className="mb-1 event_loc">
                      <strong>Location:</strong> {event.location}
                    </p>
                    <p className="mb-1 event_time">
                      <strong>Time:</strong> {new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <p className="text-muted">{event.description}</p>
                     {/* Only render Link if eventDetailId exists */}
                     {eventDetailId && (
                       <Link to={`/register/${eventDetailId}`} className="get_involved_btn">
                         Get Involved
                       </Link>
                     )}
                  </div>
                </div>
              </div>
              {index < events.length - 1 && <hr className="twoeventhr" />}
            </div>
          );
        })
      )}
    </div>
  );
};

export default EventSection;
