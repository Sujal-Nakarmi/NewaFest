import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';

const EventModal = ({ show, onHide, onSubmit, event, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    start_time: '',
    year: new Date().getFullYear(),
    photo: null,
    is_active: true
  });

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        location: event.location || '',
        start_time: event.start_time ? format(parseISO(event.start_time), "yyyy-MM-dd'T'HH:mm") : '',
        year: event.year || new Date().getFullYear(),
        photo: null,
        is_active: event.is_active || true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        location: '',
        start_time: '',
        year: new Date().getFullYear(),
        photo: null,
        is_active: true
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare form data for submission
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('start_time', formData.start_time);
    formDataToSend.append('year', formData.year);
    formDataToSend.append('is_active', formData.is_active);
    if (formData.photo) {
      formDataToSend.append('photo', formData.photo);
    }

    onSubmit(formDataToSend);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === 'add' ? 'Add New Event' : mode === 'edit' ? 'Edit Event' : 'Event Details'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {mode === 'view' ? (
            <div>
              <h4>{formData.name}</h4>
              <p><strong>Location:</strong> {formData.location}</p>
              <p><strong>Date & Time:</strong> {formData.start_time}</p>
              <p><strong>Year:</strong> {formData.year}</p>
              <p><strong>Status:</strong> {formData.is_active ? 'Active' : 'Inactive'}</p>
              <p><strong>Description:</strong></p>
              <p>{formData.description}</p>
              {event?.photo && (
                <div className="mt-3">
                  <img 
                    src={event.photo} 
                    alt="Event" 
                    style={{ maxWidth: '100%', maxHeight: '200px' }} 
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Event Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={mode === 'view'}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  disabled={mode === 'view'}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  disabled={mode === 'view'}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  disabled={mode === 'view'}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  disabled={mode === 'view'}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Active Event"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  disabled={mode === 'view'}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Event Photo</Form.Label>
                <Form.Control
                  type="file"
                  name="photo"
                  onChange={handleChange}
                  accept="image/*"
                  disabled={mode === 'view'}
                />
                {event?.photo && (
                  <div className="mt-2">
                    <img 
                      src={event.photo} 
                      alt="Current" 
                      style={{ maxWidth: '100px', maxHeight: '100px' }} 
                    />
                  </div>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          {mode !== 'view' && (
            <Button variant="primary" type="submit">
              {mode === 'add' ? 'Add Event' : 'Save Changes'}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EventModal;