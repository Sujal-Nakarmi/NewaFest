import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaMapMarkerAlt, FaClock, FaSearch } from 'react-icons/fa';
import NavBar from '../Components/NavBar';
import Footer from './Footer';
import '../CSS/EventSection.css';

const EventSection = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: 'all',
    month: 'all',
    category: 'all'
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8000/adminwork/events');
        // Sort events alphabetically by name
        const sortedEvents = [...response.data].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setEvents(sortedEvents);
        setFilteredEvents(sortedEvents);
        
        // Find the closest upcoming event
        const now = new Date();
        const futureEvents = response.data.filter(event => new Date(event.start_time) > now);
        
        if (futureEvents.length > 0) {
          const closestEvent = futureEvents.reduce((closest, current) => {
            const closestDate = new Date(closest.start_time);
            const currentDate = new Date(current.start_time);
            return currentDate < closestDate ? current : closest;
          });
          setUpcomingEvent(closestEvent);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch events');
        setLoading(false);
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...events];
    
    // Apply location filter
    if (filters.location !== 'all') {
      result = result.filter(event => 
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Apply month filter
    if (filters.month !== 'all') {
      result = result.filter(event => {
        const eventDate = new Date(event.start_time);
        const monthName = eventDate.toLocaleString('default', { month: 'long' });
        return monthName.toLowerCase() === filters.month.toLowerCase();
      });
    }
    
    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(event => 
        (event.category || '').toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredEvents(result);
  }, [events, filters, searchTerm]);

  // Get unique locations, months, and categories for filter options
  const locations = ['all', ...new Set(events.map(event => event.location))];
  
  const months = ['all'];
  events.forEach(event => {
    const monthName = new Date(event.start_time).toLocaleString('default', { month: 'long' });
    if (!months.includes(monthName)) {
      months.push(monthName);
    }
  });
  
  const categories = ['all', ...new Set(events.map(event => event.category).filter(Boolean))];

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'long' }),
      day: date.getDate()
    };
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <div className="forest-event-loading-container"><div className="forest-event-spinner"></div></div>;
  if (error) return <div className="forest-event-error-container">{error}</div>;

  return (
    <div className="forest-event-page-container">
      <NavBar /><br/><br/><br/><br/>
      
      <div className="forest-event-content-container">
        <div className="forest-event-header">
          <h1 className="forest-event-main-heading">Events</h1>
          <div className="forest-event-search-container">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="forest-event-search-input"
            />
            <button className="forest-event-search-button">
              <FaSearch />
            </button>
          </div>
        </div>
        
        <div className="forest-event-main-content">
          <div className="forest-event-sidebar">
            <div className="forest-event-filter-section">
              <h3>Filter Events</h3>
              
              <div className="forest-event-filter-group">
                <label>Location</label>
                <select 
                  value={filters.location} 
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="forest-event-filter-select"
                >
                  {locations.map((location, index) => (
                    <option key={index} value={location}>{location === 'all' ? 'All Locations' : location}</option>
                  ))}
                </select>
              </div>
              
              <div className="forest-event-filter-group">
                <label>Month</label>
                <select 
                  value={filters.month} 
                  onChange={(e) => handleFilterChange('month', e.target.value)}
                  className="forest-event-filter-select"
                >
                  {months.map((month, index) => (
                    <option key={index} value={month}>{month === 'all' ? 'All Months' : month}</option>
                  ))}
                </select>
              </div>
              
              <button 
                className="forest-event-reset-filter-button"
                onClick={() => {
                  setFilters({
                    location: 'all',
                    month: 'all',
                    category: 'all'
                  });
                  setSearchTerm('');
                }}
              >
                Reset Filters
              </button>
            </div>
            
            <div className="forest-event-upcoming-events">
  <h3>Upcoming Event</h3>
  <hr className="forest-event-divider" />
  {upcomingEvent ? (
    <div className="forest-event-upcoming-event">
      <Link 
        to={`/register/${upcomingEvent.event_detail_id}`} 
        className="forest-event-upcoming-title"
      >
        {upcomingEvent.name}
      </Link>
      <span className="forest-event-upcoming-date">
        {new Date(upcomingEvent.start_time).toLocaleDateString()}
      </span>
    </div>
  ) : (
    <p>No upcoming events</p>
  )}
</div>
          </div>
          
          <div className="forest-event-listing">
            {filteredEvents.length === 0 ? (
              <div className="forest-event-no-events-found">No events found matching your criteria</div>
            ) : (
              filteredEvents.map((event, index) => {
                const date = formatDate(event.start_time);
                const eventDetailId = event.event_detail_id;
                
                return (
                  <div key={event.event_id} className="forest-event-card">
                    <div className="forest-event-date">
                      <div className="forest-event-month">{date.month}</div>
                      <div className="forest-event-day">{date.day}</div>
                    </div>
                    
                    <div className="forest-event-image">
                      <img
                        src={event.photo || "/images/event-placeholder.jpg"}
                        alt={event.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/event-placeholder.jpg";
                        }}
                      />
                    </div>
                    
                    <div className="forest-event-details">
                      <h3 className="forest-event-title">
                        <Link to={`/event/${event.event_id}`}>{event.name}</Link>
                      </h3>
                      
                      <div className="forest-event-meta">
                        <div className="forest-event-location">
                          <FaMapMarkerAlt style={{ marginRight: '5px' }} /> {event.location}
                        </div>
                        <div className="forest-event-time">
                          <FaClock style={{ marginRight: '5px' }} /> {new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      
                      <div className="forest-event-description">
                        {event.description.length > 150 
                          ? `${event.description.substring(0, 150)}...` 
                          : event.description}
                      </div>
                      
                      <div className="forest-event-actions">
                        {eventDetailId && (
                           <Link 
                           to={`/register/${event.event_detail_id}`} 
                           className="forest-event-register-btn"
                         >
                           Get Involved
                         </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div><br/>
      <Footer />
    </div>
  );
};

export default EventSection;