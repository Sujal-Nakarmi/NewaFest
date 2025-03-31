import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RentalItemForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    base_price: '',
    is_available: true,
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categories = ['Clothing', 'Ornaments', 'Accessories', 'Costumes'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = new FormData();
    for (const key in formData) {
      submitData.append(key, formData[key]);
    }
    if (image) {
      submitData.append('image', image);
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://localhost:8000/renting/renting/rental-items/create/',
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Navigate back to the products list
      navigate('/vendor/products');
    } catch (error) {
      console.error('Error creating rental item:', error);
      setError(error.response?.data?.error || 'Failed to create rental item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2 className="my-4">Add New Rental Item</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Base Price (Rs)</Form.Label>
                  <Form.Control
                    type="number"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Available for rent"
                name="is_available"
                checked={formData.is_available}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/vendor/dashboard')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Item'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RentalItemForm;