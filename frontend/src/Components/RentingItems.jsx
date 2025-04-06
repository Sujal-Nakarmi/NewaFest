import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Button, Form, InputGroup, Modal, Toast, Badge } from "react-bootstrap"
import { Search } from "react-bootstrap-icons"
import { FaCalendarAlt, FaMapMarkerAlt, FaTag } from "react-icons/fa"
import axios from "axios"
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import '../CSS/RentingItem.css'

const ClothingGrid = () => {
  const [clothingItems, setClothingItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
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
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [categories, setCategories] = useState([
    "All", "Men", "Women", "Ornaments", "Props"
  ])
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [locations, setLocations] = useState([
    "All Locations", "Kathmandu", "Patan", "Bhaktapur", "Basantapur"
  ])

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoryParam = selectedCategory && selectedCategory !== "All" 
          ? `?category=${selectedCategory}` 
          : "";
          
        const response = await fetch(`http://localhost:8000/renting/renting/public/rental-items/${categoryParam}`)
        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }
        const data = await response.json()
        setClothingItems(data)
        setFilteredItems(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedCategory])

  useEffect(() => {
    if (clothingItems.length > 0) {
      let filtered = [...clothingItems];
      
      if (searchQuery.trim() !== "") {
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      filtered = filtered.filter(item => {
        const price = item.base_price;
        return price >= priceRange.min && price <= priceRange.max;
      });
      
      if (selectedLocation && selectedLocation !== "All Locations") {
        filtered = filtered.filter(item => 
          item.location === selectedLocation || !item.location
        );
      }
      
      setFilteredItems(filtered);
    }
  }, [searchQuery, priceRange, clothingItems, selectedLocation]);

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
      defaultVariant = item.size_variants.find(v => v.is_default) || item.size_variants[0];
      setSelectedVariant(defaultVariant);
    }
    
    setQuantity(1);
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
    if (date >= rentalEndDate) {
      const newEndDate = new Date(date);
      newEndDate.setDate(newEndDate.getDate() + 1);
      setRentalEndDate(newEndDate);
    }
  }

  const handleEndDateChange = (date) => {
    setRentalEndDate(date);
  }

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
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

  const getAvailabilityInfo = (item) => {
    if (item.has_size_variants && item.size_variants && item.size_variants.length > 0) {
      const totalQuantity = item.total_quantity || 
        item.size_variants.reduce((total, variant) => total + variant.quantity, 0);
      
      if (totalQuantity > 50) {
        return {
          status: `${totalQuantity} in stock`,
          className: "in-stock"
        };
      } else if (totalQuantity > 10) {
        return {
          status: `${totalQuantity} in stock`,
          className: "available"
        };
      } else {
        return {
          status: `${totalQuantity} in stock`,
          className: "limited"
        };
      }
    } else {
      return {
        status: "Available",
        className: "available"
      };
    }
  }

  const getAvailableSizes = (item) => {
    if (item.has_size_variants && item.size_variants && item.size_variants.length > 0) {
      const sizes = item.size_variants.map(v => v.size).join(', ');
      return `Available in: ${sizes}`;
    }
    return null;
  }

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceRange({ min: 0, max: 10000 });
    setSelectedLocation("All Locations");
    setFilteredItems(clothingItems);
  }
  
  const navigateToOrders = () => {
    window.location.href = '/orders/history';
  }

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-danger m-5" role="alert">
      <h4>Error loading items</h4>
      <p>{error}</p>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );

  return (
    <Container fluid className="rental-container">
      <div className="event-header">
  <h1 className="clothing-title">Rent Items</h1>
  <div className="actions-container">
    <div className="cloth-search-container">
      <InputGroup className="cloth-search-bar">
        <Form.Control 
          placeholder="Search items..." 
          aria-label="Search" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="primary" className="cloth-search-button">
          <Search />
        </Button>
      </InputGroup>
    </div>
    {isLoggedIn && (
      <Button 
        onClick={navigateToOrders}
        className="order-history-btn"
      >
        My Orders
      </Button>
    )}
  </div>
</div>

      <Row className="d-flex flex-nowrap">
  {/* Filter Column - make it fixed width */}
  <Col lg={3} md={3} sm={3} className="mb-4" style={{minWidth: "250px"}}>
          <div className="filter-panel">
            <h3 className="filter-events-title">Filter Items</h3>
            
            {/* Category Filter */}
            <div className="filter-group">
              <h4 className="filter-label">Category</h4>
              <Form.Select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                {categories.map(category => (
                  <option key={category} value={category === "All" ? "" : category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </div>
            
            {/* Price Range Filter */}
            <div className="filter-group">
              <h4 className="filter-label">Price Range (Rs)</h4>
              <div className="price-range-inputs">
                <Row className="gx-2 align-items-center">
                  <Col>
                    <Form.Control 
                      type="number" 
                      placeholder="Min" 
                      min="0"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                    />
                  </Col>
                  <Col xs="auto" className="px-0">
                    <span className="text-muted">—</span>
                  </Col>
                  <Col>
                    <Form.Control 
                      type="number" 
                      placeholder="Max"
                      min="0"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value) || 10000})}
                    />
                  </Col>
                </Row>
              </div>
            </div>
            
            {/* Reset Filters Button */}
            <Button 
              variant="secondary" 
              onClick={handleResetFilters}
              className="reset-filters-btn"
            >
              Reset Filters
            </Button>
          </div>
        </Col>
        
        {/* Main Content Area */}
        <Col lg={9} md={9} sm={9} className="main-content-area">
          {filteredItems.length === 0 ? (
            <div className="no-results">
              <img 
                src="/api/placeholder/200/200" 
                alt="No results" 
                className="mb-3" 
                style={{ opacity: 0.5 }}
              />
              <h4>No items match your filters</h4>
              <p className="text-muted">Try adjusting your search criteria</p>
              <Button variant="primary" onClick={handleResetFilters} className="mt-2">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <p>
                Found <strong>{filteredItems.length} items</strong>
                {selectedCategory && <span> in <strong>{selectedCategory}</strong></span>}
                {selectedLocation !== "All Locations" && <span> from <strong>{selectedLocation}</strong></span>}
                {priceRange.min > 0 || priceRange.max < 10000 ? (
                  <span> with price range <strong>Rs {priceRange.min} - Rs {priceRange.max}</strong></span>
                ) : null}
              </p>
              
              <Row className="item-grid">
  {filteredItems.map((item) => {
    const availabilityInfo = getAvailabilityInfo(item);
    const availableSizes = getAvailableSizes(item);
    
    return (
      <Col key={item.item_id} xs={12} sm={6} md={6} lg={4} className="mb-4">
        <div className="clothing-card h-100">
          <div className="image-container">
            <img
              src={item.image || "/api/placeholder/180/180"}
              className="clothing-image"
              alt={item.name}
            />
          </div>
          <div className="card-body">
            <h3 className="item-name">{item.name}</h3>
            
            <div className="price-availability-container">
              <span className="item-price">Rs {item.base_price.toLocaleString()}</span>
              <span className={`availability-badge ${availabilityInfo.className}`}>
                {availabilityInfo.status}
              </span>
            </div>
            
            <div className="item-metadata">
              {item.category && (
                <Badge bg="light" text="dark" className="category-badge">
                  {item.category}
                </Badge>
              )}
              {item.location && (
                <small className="text-muted">
                  <FaMapMarkerAlt size={12} className="me-1" />
                  {item.location}
                </small>
              )}
            </div>
            
            {availableSizes && (
              <div className="available-sizes">
                <small className="text-muted">{availableSizes}</small>
              </div>
            )}
            
            <Button 
              variant="primary" 
              className="add-to-cart-btn w-100" 
              onClick={() => handleAddToCart(item)}
            >
              Add to cart
            </Button>
          </div>
        </div>
      </Col>
    );
  })}
</Row>
            </>
          )}
        </Col>
      </Row>

      {/* Item Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="modal-title">Add to Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div>
              <div className="d-flex mb-4">
                <div className="modal-image-container me-3">
                  <img 
                    src={selectedItem.image || "/api/placeholder/100/100"} 
                    alt={selectedItem.name} 
                    className="modal-item-image" 
                    style={{ width: '100px', height: '100px' }}
                  />
                </div>
                <div>
                  <h4>{selectedItem.name}</h4>
                  <div className="d-flex align-items-center mb-2">
                    <span className=" fw-bold me-3">Rs {selectedItem.base_price.toLocaleString()}</span>
                    {selectedItem.category && (
                      <Badge bg="light" text="dark" className="category-badge">
                        {selectedItem.category}
                      </Badge>
                    )}
                  </div>
                  {selectedItem.location && (
                    <div className="text-muted mb-2">
                      <FaMapMarkerAlt size={14} className="me-1" />
                      {selectedItem.location}
                    </div>
                  )}
                </div>
              </div>

              <Card className="bg-light border-0 mb-4 rounded-3">
                <Card.Body>
                  {selectedItem.has_size_variants && selectedItem.size_variants && selectedItem.size_variants.length > 0 && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Select Size</Form.Label>
                      <Form.Select 
                        onChange={handleVariantChange} 
                        value={selectedVariant?.variant_id || ''}
                      >
                        {selectedItem.size_variants.map(variant => (
                          <option key={variant.variant_id} value={variant.variant_id}>
                            {variant.size} ({variant.quantity} available) - Rs {variant.price || selectedItem.base_price}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Quantity</Form.Label>
                    <Form.Select 
                      onChange={handleQuantityChange} 
                      value={quantity}
                    >
                      {Array.from({ length: selectedVariant ? Math.min(selectedVariant.quantity, 10) : 10 }, (_, i) => (
                        <option key={i+1} value={i+1}>{i+1}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-0">
                    <Form.Label className="fw-bold">Rental Period</Form.Label>
                    <div className="date-picker-container">
                      <Row className="mb-2">
                        <Col sm={6} className="mb-2 mb-sm-0">
                          <div className="date-field-label d-flex align-items-center mb-1">
                            <FaCalendarAlt className="me-2 calendar-icon" size={14} />
                            <span>Start Date</span>
                          </div>
                          <DatePicker
                            selected={rentalStartDate}
                            onChange={handleStartDateChange}
                            selectsStart
                            startDate={rentalStartDate}
                            endDate={rentalEndDate}
                            minDate={new Date()}
                            className="form-control"
                            dateFormat="MMM dd, yyyy"
                          />
                        </Col>
                        
                        <Col sm={6}>
                          <div className="date-field-label d-flex align-items-center mb-1">
                            <FaCalendarAlt className="me-2 calendar-icon" size={14} />
                            <span>End Date</span>
                          </div>
                          <DatePicker
                            selected={rentalEndDate}
                            onChange={handleEndDateChange}
                            selectsEnd
                            startDate={rentalStartDate}
                            endDate={rentalEndDate}
                            minDate={rentalStartDate}
                            className="form-control"
                            dateFormat="MMM dd, yyyy"
                          />
                        </Col>
                      </Row>
                      
                      <div className="rental-duration">
                        <span className="fw-bold ml-5" style={{ marginRight: "5px" }}>
                          {calculateDays(rentalStartDate, rentalEndDate)} days
                        </span>
                        <span>rental period</span>
                      </div>
                    </div>
                  </Form.Group>
                </Card.Body>
              </Card>

              <div className="total-price-card">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Daily Rate:</span>
                  <span>Rs {(selectedVariant?.price || selectedItem.base_price).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Quantity:</span>
                  <span>{quantity}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Duration:</span>
                  <span>{calculateDays(rentalStartDate, rentalEndDate)} days</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold fs-5">Total:</span>
                  <span className="fw-bold fs-5 text-primary">
                    Rs {((selectedVariant?.price || selectedItem.base_price) * quantity * calculateDays(rentalStartDate, rentalEndDate)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between border-top-0">
          <Button 
            variant="primary" 
            onClick={handleSubmitAddToCart}
            disabled={addingToCart}
            className="add-to-cart-btn px-4"
          >
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={5000}
        autohide
        className="position-fixed end-0 m-3"
        style={{ top: "80px", zIndex: 1050 }}
        bg={toastVariant}
      >
        <Toast.Header closeButton={true}>
          <strong className="me-auto">Cart Notification</strong>
        </Toast.Header>
        <Toast.Body className={toastVariant === "warning" || toastVariant === "danger" ? "text-white" : ""}>
          {toastMessage}
        </Toast.Body>
      </Toast>
    </Container>
  )
}

export default ClothingGrid