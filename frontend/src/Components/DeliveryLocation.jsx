import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import LocationSelector from "./LocationSelector";

const DeliveryLocationSelector = ({ onLocationSelected }) => {
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelected = (location) => {
    setSelectedLocation(location);
    setShowLocationSelector(false);
    
    // Call the parent callback
    if (onLocationSelected) {
      onLocationSelected(location);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <Card.Title>Delivery Location</Card.Title>
      </Card.Header>
      <Card.Body>
        {!showLocationSelector ? (
          <>
            {selectedLocation ? (
              <div className="selected-location-info">
                <h5>{selectedLocation.area_name}</h5>
                <p>Delivery charge: Rs {selectedLocation.delivery_charge}</p>
                <Button 
                  variant="outline-primary" 
                  onClick={() => setShowLocationSelector(true)}
                >
                  Change Location
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p>Please select a delivery location</p>
                <Button 
                  variant="primary" 
                  onClick={() => setShowLocationSelector(true)}
                >
                  Select Location
                </Button>
              </div>
            )}
          </>
        ) : (
          <LocationSelector onLocationSelected={handleLocationSelected} />
        )}
      </Card.Body>
    </Card>
  );
};

export default DeliveryLocationSelector;