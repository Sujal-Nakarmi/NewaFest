"use client"
import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Form, InputGroup, Modal, Toast } from "react-bootstrap"
import { Search } from "react-bootstrap-icons"
import { FaCalendarAlt } from "react-icons/fa"
import axios from "axios"
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import '../CSS/RentingItem.css'

const ClothingGrid = () => {
  const [clothingItems, setClothingItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [rentalStartDate, setRentalStartDate] = useState(new Date())
  const [rentalEndDate, setRentalEndDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  })
  const [addingToCart, setAddingToCart] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastVariant, setToastVariant] = useState("success")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
    
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/renting/renting/public/rental-items/")
        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }
        const data = await response.json()
        setClothingItems(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = (item) => {
    if (!isLoggedIn) {
      setToastVariant("warning");
      setToastMessage("Please log in to add items to your cart");
      setShowToast(true);
      return;
    }
    
    setSelectedItem(item)
    let defaultVariant = null;
    
    if (item.has_size_variants && item.size_variants && item.size_variants.length > 0) {
      // Find a default variant or use the first one
      defaultVariant = item.size_variants.find(v => v.is_default) || item.size_variants[0];
      setSelectedVariant(defaultVariant);
    }
    
    setQuantity(1);
    // Reset dates
    setRentalStartDate(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setRentalEndDate(tomorrow);
    
    setShowModal(true);
  }

  const handleVariantChange = (e) => {
    const variantId = e.target.value;
    const variant = selectedItem.size_variants.find(v => v.variant_id === parseInt(variantId));
    setSelectedVariant(variant);
  }

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value));
  }

  const handleStartDateChange = (date) => {
    setRentalStartDate(date);
    // If start date is after end date, update end date to start date + 1
    if (date >= rentalEndDate) {
      const newEndDate = new Date(date);
      newEndDate.setDate(newEndDate.getDate() + 1);
      setRentalEndDate(newEndDate);
    }
  }

  const handleEndDateChange = (date) => {
    setRentalEndDate(date);
  }

  // Calculate rental days between two dates
  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays; // Minimum 1 day
  }

  const handleSubmitAddToCart = async () => {
    try {
      setAddingToCart(true);
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        setToastVariant("warning");
        setToastMessage("Please log in to add items to your cart");
        setShowToast(true);
        setShowModal(false);
        return;
      }
      
      const response = await axios.post(
        "http://localhost:8000/renting/cart/add/",
        {
          item_id: selectedItem.item_id,
          variant_id: selectedVariant ? selectedVariant.variant_id : null,
          quantity: quantity,
          rental_start_date: rentalStartDate.toISOString().split('T')[0],
          rental_end_date: rentalEndDate.toISOString().split('T')[0]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setToastVariant("success");
      setToastMessage("Item added to cart successfully!");
      setShowToast(true);
      setShowModal(false);
      
      // Update any global cart state or trigger a refresh
      // You could emit an event or use context/redux to update cart count in navbar
      
      // This will dispatch a custom event that NavBar can listen for
      const event = new CustomEvent('cartUpdated', { 
        detail: { items: response.data.items } 
      });
      window.dispatchEvent(event);
      
    } catch (err) {
      console.error("Error adding to cart:", err);
      setToastVariant("danger");
      setToastMessage(err.response?.data?.error || "Failed to add item to cart");
      setShowToast(true);
    } finally {
      setAddingToCart(false);
    }
  }

  // Function to get the availability status and count
  const getAvailabilityInfo = (item) => {
    if (item.has_size_variants && item.size_variants && item.size_variants.length > 0) {
      const totalQuantity = item.total_quantity || 
        item.size_variants.reduce((total, variant) => total + variant.quantity, 0);
      return {
        status: `${totalQuantity} in stock`,
        className: "in-stock"
      };
    } else {
      return {
        status: "Available",
        className: "available"
      };
    }
  }

  // Function to get available sizes text
  const getAvailableSizes = (item) => {
    if (item.has_size_variants && item.size_variants && item.size_variants.length > 0) {
      const sizes = item.size_variants.map(v => v.size).join(', ');
      return `Available in: ${sizes}`;
    }
    return null;
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="clothing-title">Clothes</h1>
        <InputGroup className="search-bar">
          <InputGroup.Text className="bg-white border-end-0">
            <Search />
          </InputGroup.Text>
          <Form.Control placeholder="Search" aria-label="Search" className="border-start-0" />
        </InputGroup>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {clothingItems.map((item) => {
          const availabilityInfo = getAvailabilityInfo(item);
          const availableSizes = getAvailableSizes(item);
          
          return (
            <Col key={item.item_id}>
              <Card className="clothing-card h-100">
                <div className="image-container mx-auto">
                  <Card.Img
                    variant="top"
                    src={item.image}
                    className="rounded-circle clothing-image"
                  />
                </div>
                <Card.Body className="text-center">
                  <Card.Title className="item-name">{item.name}</Card.Title>
                  
                  <div className="price-availability-container">
                    <span className="item-price">Rs {item.base_price}</span>
                    <span className={`availability-badge ${availabilityInfo.className}`}>
                      {availabilityInfo.status}
                    </span>
                  </div>
                  
                  {availableSizes && (
                    <div className="available-sizes">
                      <small className="text-muted">{availableSizes}</small>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <Button 
                      variant="primary" 
                      className="add-to-cart-btn" 
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Add to Cart Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add to Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div>
              <div className="d-flex mb-3">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name} 
                  className="modal-item-image me-3" 
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%' }}
                />
                <div>
                  <h5>{selectedItem.name}</h5>
                  <p className="text-muted mb-0">Rs {selectedItem.base_price}</p>
                </div>
              </div>

              {selectedItem.has_size_variants && selectedItem.size_variants && selectedItem.size_variants.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label>Size</Form.Label>
                  <Form.Select onChange={handleVariantChange} value={selectedVariant?.variant_id || ''}>
                    {selectedItem.size_variants.map(variant => (
                      <option key={variant.variant_id} value={variant.variant_id}>
                        {variant.size} ({variant.quantity} available) - Rs {variant.price || selectedItem.base_price}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Select onChange={handleQuantityChange} value={quantity}>
                  {Array.from({ length: selectedVariant ? Math.min(selectedVariant.quantity, 10) : 10 }, (_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rental Period</Form.Label>
                <div className="date-picker-container d-flex flex-column">
                  <div className="mb-2">
                    <div className="d-flex align-items-center mb-1">
                      <FaCalendarAlt className="me-2" />
                      <span>Start Date</span>
                    </div>
                    <DatePicker
                      selected={rentalStartDate}
                      onChange={handleStartDateChange}
                      selectsStart
                      startDate={rentalStartDate}
                      endDate={rentalEndDate}
                      minDate={new Date()}
                      className="form-control form-control-sm"
                      dateFormat="MM/dd/yyyy"
                    />
                  </div>
                  
                  <div>
                    <div className="d-flex align-items-center mb-1">
                      <FaCalendarAlt className="me-2" />
                      <span>End Date</span>
                    </div>
                    <DatePicker
                      selected={rentalEndDate}
                      onChange={handleEndDateChange}
                      selectsEnd
                      startDate={rentalStartDate}
                      endDate={rentalEndDate}
                      minDate={rentalStartDate}
                      className="form-control form-control-sm"
                      dateFormat="MM/dd/yyyy"
                    />
                  </div>
                  
                  <div className="mt-2 text-muted">
                    <small>
                      {calculateDays(rentalStartDate, rentalEndDate)} days
                    </small>
                  </div>
                </div>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mt-4">
                <div>
                  <strong>Total: </strong>
                  <span>Rs {(selectedVariant?.price || selectedItem.base_price) * quantity * calculateDays(rentalStartDate, rentalEndDate)}</span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={5000}
        autohide
        className="position-fixed bottom-0 end-0 m-3"
        bg={toastVariant}
        text={toastVariant === "warning" ? "dark" : "white"}
      >
        <Toast.Header closeButton={true}>
          <strong className="me-auto">Cart Notification</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </Container>
  )
}

export default ClothingGrid