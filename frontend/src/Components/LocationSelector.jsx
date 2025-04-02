import React, { useState, useEffect } from "react";
import { Card, Form, Container, Row, Col } from "react-bootstrap";
import { FaChevronRight, FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import "../CSS/LocationSelector.css"; // We'll create this later

const LocationSelector = ({ onLocationSelected }) => {
  const [provinces, setProvinces] = useState([]);
  const [metroAreas, setMetroAreas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMetroArea, setSelectedMetroArea] = useState("");
  const [selectedArea, setSelectedArea] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState("provinces"); // provinces, metroAreas, areas

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8000/renting/delivery/provinces/");
        setProvinces(response.data);
        setError(null);
      } catch (error) {
        setError("Failed to fetch provinces");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch metro areas when province changes
  useEffect(() => {
    if (!selectedProvince) return;

    const fetchMetroAreas = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/renting/delivery/provinces/${selectedProvince}/metro-areas/`);
        setMetroAreas(response.data);
        setError(null);
        setCurrentView("metroAreas");
      } catch (error) {
        setError("Failed to fetch metro areas");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetroAreas();
  }, [selectedProvince]);

  // Fetch areas when metro area changes
  useEffect(() => {
    if (!selectedProvince || !selectedMetroArea) return;

    const fetchAreas = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/renting/delivery/provinces/${selectedProvince}/metro-areas/${selectedMetroArea}/areas/`
        );
        setAreas(response.data);
        setError(null);
        setCurrentView("areas");
      } catch (error) {
        setError("Failed to fetch areas");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, [selectedProvince, selectedMetroArea]);

  const handleProvinceSelect = (province) => {
    setSelectedProvince(province);
    setSelectedMetroArea("");
    setSelectedArea(null);
  };

  const handleMetroAreaSelect = (metroArea) => {
    setSelectedMetroArea(metroArea);
    setSelectedArea(null);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    
    // Create a complete location object with hierarchy information
    const completeLocation = {
      ...area,
      province: selectedProvince,
      metro_area: selectedMetroArea,
      full_address: `${selectedProvince} > ${selectedMetroArea} > ${area.area_name}`
    };
    
    // Call the callback with the complete location
    if (onLocationSelected) {
      onLocationSelected(completeLocation);
    }
    
    // Update the delivery location in the cart
    updateDeliveryLocation(area.location_id);
  };

  const updateDeliveryLocation = async (locationId) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Please log in to update delivery location");
        return;
      }

      await axios.put(
        "http://localhost:8000/renting/cart/update-delivery-location/",
        { location_id: locationId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Success - handle as needed
    } catch (error) {
      setError(error.response?.data?.error || "Failed to update delivery location");
      console.error(error);
    }
  };

  const handleBack = () => {
    if (currentView === "areas") {
      setCurrentView("metroAreas");
      setSelectedArea(null);
    } else if (currentView === "metroAreas") {
      setCurrentView("provinces");
      setSelectedMetroArea("");
    }
  };

  const filteredProvinces = provinces.filter(province => 
    province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMetroAreas = metroAreas.filter(metro => 
    metro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAreas = areas.filter(area => 
    area.area_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="location-selector-container">
      <Card className="location-selector-card">
        <Card.Header className="location-header">
          {currentView !== "provinces" && (
            <div className="back-link" onClick={handleBack}>
              &lt; Back
            </div>
          )}
          <div className="breadcrumb">
            {selectedProvince && (
              <span className="selected-item">{selectedProvince}</span>
            )}
            {selectedMetroArea && (
              <>
                <FaChevronRight className="breadcrumb-icon" />
                <span className="selected-item">{selectedMetroArea}</span>
              </>
            )}
            <FaChevronRight className="breadcrumb-icon" />
            <span className="prompt-text">Select Address</span>
          </div>
        </Card.Header>
        
        <Card.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <div className="search-container">
            <Form.Control
              type="text"
              placeholder="Select Address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>
          
          <div className="location-list">
            {loading ? (
              <div className="text-center py-3">Loading...</div>
            ) : (
              <>
                {currentView === "provinces" && (
                  filteredProvinces.map((province) => (
                    <div 
                      key={province} 
                      className="location-item"
                      onClick={() => handleProvinceSelect(province)}
                    >
                      {province}
                    </div>
                  ))
                )}
                
                {currentView === "metroAreas" && (
                  filteredMetroAreas.map((metro) => (
                    <div 
                      key={metro} 
                      className="location-item"
                      onClick={() => handleMetroAreaSelect(metro)}
                    >
                      {metro}
                    </div>
                  ))
                )}
                
                {currentView === "areas" && (
                  filteredAreas.map((area) => (
                    <div 
                      key={area.location_id} 
                      className="location-item"
                      onClick={() => handleAreaSelect(area)}
                    >
                      {area.area_name}
                      {area.delivery_charge && (
                        <span className="delivery-charge">Rs {area.delivery_charge}</span>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </Card.Body>
        
       
      </Card>
    </Container>
  );
};

export default LocationSelector;