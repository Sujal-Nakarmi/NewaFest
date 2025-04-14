import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiCalendar, FiBookOpen, FiLogOut, FiEye, FiUser, FiInfo, FiCheckCircle, FiX } from 'react-icons/fi';
import logo from "../Assests/Logo.png";
import { Link } from "react-router-dom";

const EventCheckIn = () => {
  const [scannerActive, setScannerActive] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const navigate = useNavigate();
  
  // Reference to the html5QrCode instance
  const html5QrCode = useRef(null);
  // Reference to the scanner container
  const scannerContainerRef = useRef(null);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Initialize and clean up QR scanner
  useEffect(() => {
    // Clean up function
    return () => {
      if (html5QrCode.current && html5QrCode.current.isScanning) {
        html5QrCode.current.stop().catch(error => {
          console.error("Failed to stop scanner", error);
        });
      }
    };
  }, []);

  // Handle starting and stopping the scanner
  useEffect(() => {
    if (scannerActive) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [scannerActive]);

  // Start QR scanner
  const startScanner = () => {
    if (!scannerContainerRef.current) return;
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
    };

    html5QrCode.current = new Html5Qrcode("qr-reader");
    
    html5QrCode.current.start(
      { facingMode: "environment" },
      config,
      onScanSuccess,
      onScanFailure
    ).catch(err => {
      setError(`Unable to start scanner: ${err.message || 'Unknown error'}`);
      setScannerActive(false);
    });
  };

  // Stop QR scanner
  const stopScanner = () => {
    if (html5QrCode.current && html5QrCode.current.isScanning) {
      html5QrCode.current.stop().catch(error => {
        console.error("Failed to stop scanner", error);
      });
    }
  };

  // Handle successful QR scan
  const onScanSuccess = (decodedText) => {
    // Stop scanner after successful scan
    stopScanner();
    setScannerActive(false);
    setScanResult(decodedText);
    verifyRegistration(decodedText);
  };

  // Handle QR scan error
  const onScanFailure = (error) => {
    // Don't show errors for normal scanning attempts
    console.log(`QR scan error: ${error}`);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate('/login');
  };

  // Handle manual registration ID input
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      verifyRegistration(manualInput.trim());
    }
  };

  // Verify registration with API
  const verifyRegistration = async (registrationId) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setRegistrationData(null);
    
    try {
      const token = localStorage.getItem("access_token");
      
      // First, just verify the registration
      const response = await axios.get(
        `http://localhost:8000/adminwork/qr/verify-registration/${registrationId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setRegistrationData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error verifying registration:', err);
      setError(err.response?.data?.message || 'Failed to verify registration. Please try again.');
      setLoading(false);
    }
  };

  // Handle check-in
  const handleCheckIn = async () => {
    if (!registrationData || !registrationData.registration_id) return;
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const token = localStorage.getItem("access_token");
      
      // Check in the attendee
      const response = await axios.post(
        `http://localhost:8000/adminwork/qr/verify-registration/${registrationData.registration_id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setRegistrationData(response.data);
      setSuccessMessage(response.data.message || 'Successfully checked in!');
      setLoading(false);
      
      // Reset after 5 seconds for next check-in
      setTimeout(() => {
        resetCheckIn();
      }, 5000);
    } catch (err) {
      console.error('Error checking in:', err);
      setError(err.response?.data?.message || 'Failed to check in. Please try again.');
      setLoading(false);
    }
  };

  // Reset the check-in process
  const resetCheckIn = () => {
    setScanResult(null);
    setRegistrationData(null);
    setSuccessMessage(null);
    setError(null);
    setManualInput('');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <Link to="/"><img src={logo} className="dashboard-logo" alt="Logo" /></Link>
        </div>
        <nav className="nav-menu">
          <Link to="/admin/dashboard" className="nav-item">
            <FiHome size={18} /> Dashboard
          </Link>
          <Link to="/admin/dashboard/users" className="nav-item">
            <FiUsers size={18} /> Users
          </Link>
          <Link to="/admin/dashboard/events" className="nav-item">
            <FiCalendar size={18} /> Events
          </Link>
          <Link to="/admin/dashboard/checkin" className="nav-item active">
            <FiCheckCircle size={18} /> Check-in
          </Link>
          <Link to="/admin/dashboard/registrations" className="nav-item">
            <FiCalendar size={18} /> Event Registration
          </Link>
        
          <Link to="/admin/dashboard/rentals" className="nav-item">
            <FiCalendar size={18} /> Rental Items
          </Link>
          <Link to="/admin/size-variants" className="nav-item">
            <FiUser size={18} /> Size Variants
          </Link>
          <Link to="/admin/orders" className="nav-item">
            <FiUser size={18} /> Orders
          </Link>
        </nav>
        <div className="logout">
          <a href="#" className="nav-item logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} /> Log out
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <h4 className="m-0">Event Check-in System</h4>
        </div>

        {/* Check-in Section */}
        <div className="checkin-section">
          <div className="card">
            <div className="card-header">
              <h2><FiCheckCircle /> Event Check-in</h2>
            </div>
            <div className="card-body">
              {/* Toggle scanner button */}
              <div className="mb-4 text-center">
                <button 
                  className={`btn ${scannerActive ? 'btn-danger' : 'btn-primary'} btn-lg`}
                  onClick={() => setScannerActive(!scannerActive)}
                >
                  {scannerActive ? <><FiX /> Stop Scanner</> : <><FiCheckCircle /> Start QR Scanner</>}
                </button>
              </div>

              {/* Scanner */}
              <div 
                id="scanner-container" 
                className="qr-scanner-container" 
                ref={scannerContainerRef}
                style={{ display: scannerActive ? 'block' : 'none' }}
              >
                <div id="qr-reader" style={{ width: '100%' }}></div>
              </div>

              {/* Manual Input */}
              <div className="manual-input-container mt-4">
                <h5>Or Enter Registration ID Manually</h5>
                <form onSubmit={handleManualSubmit} className="d-flex">
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    placeholder="Enter Registration ID" 
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                  />
                  <button type="submit" className="btn verify-btn ms-2">Verify</button>
                </form>
              </div>

              {/* Loading */}
              {loading && (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger mt-4" role="alert">
                  <FiX /> {error}
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success mt-4" role="alert">
                  <FiCheckCircle /> {successMessage}
                </div>
              )}

              {/* Registration Details */}
              {registrationData && (
                <div className="registration-details mt-4">
                  <div className="card">
                    <div className={`card-header ${registrationData.checked_in ? 'bg-success' : 'bg'} `}>
                      <h5 className="mb-0">
                        {registrationData.checked_in ? 
                          <><FiCheckCircle /> Already Checked In</> : 
                          <><FiInfo /> Registration Verified - Ready for Check-in</>
                        }
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h5>Registration Details</h5>
                          <table className="table table-striped">
                            <tbody>
                              <tr>
                                <th>Registration ID</th>
                                <td>{registrationData.registration_id}</td>
                              </tr>
                              <tr>
                                <th>Event</th>
                                <td>{registrationData.event_name}</td>
                              </tr>
                              <tr>
                                <th>Category</th>
                                <td>
                                  <span className={`badge ${
                                    registrationData.category?.toLowerCase().includes('volunteer') ? 'bg-success' :
                                    registrationData.category?.toLowerCase().includes('stall') ? 'bg-warning text-dark' :
                                    registrationData.category?.toLowerCase().includes('rally') ? 'bg-info text-dark' :
                                    'bg-secondary'
                                  }`}>
                                    {registrationData.category}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <th>Attendee</th>
                                <td>{registrationData.user_name}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="col-md-6">
                          <h5>Status & Category Details</h5>
                          <table className="table table-striped">
                            <tbody>
                              <tr>
                                <th>Check-in Status</th>
                                <td>
                                  {registrationData.checked_in ? 
                                    <span className="badge bg-success">Checked In</span> : 
                                    <span className="badge bg-warning text-dark">Not Checked In</span>
                                  }
                                </td>
                              </tr>
                              {registrationData.check_in_time && (
                                <tr>
                                  <th>Check-in Time</th>
                                  <td>{formatDate(registrationData.check_in_time)}</td>
                                </tr>
                              )}
                              
                              {/* Category-specific fields */}
                              {registrationData.volunteer_type && (
                                <tr>
                                  <th>Volunteer Type</th>
                                  <td>{registrationData.volunteer_type}</td>
                                </tr>
                              )}
                              {registrationData.instrument && (
                                <tr>
                                  <th>Instrument</th>
                                  <td>{registrationData.instrument}</td>
                                </tr>
                              )}
                              {registrationData.rally_option && (
                                <tr>
                                  <th>Rally Option</th>
                                  <td>{registrationData.rally_option}</td>
                                </tr>
                              )}
                              {registrationData.stall_type && (
                                <tr>
                                  <th>Stall Type</th>
                                  <td>{registrationData.stall_type}</td>
                                </tr>
                              )}
                              {registrationData.stall_location && (
                                <tr>
                                  <th>Stall Location</th>
                                  <td>{registrationData.stall_location}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Check-in Button Row - Modified to place buttons on same row */}
                      {!registrationData.checked_in && (
                        <div className="text-center mt-3 d-flex justify-content-center button-row">
                          <button 
                            className="btn verify-btn btn-lg me-2" 
                            onClick={handleCheckIn}
                            disabled={loading}
                          >
                            {loading ? 'Processing...' : 'Check In Attendee'}
                          </button>
                          <button 
                            className="btn btn-outline-secondary" 
                            onClick={resetCheckIn}
                          >
                            New Check-in
                          </button>
                        </div>
                      )}

                      {/* Only show Reset Button if already checked in */}
                      {registrationData.checked_in && (
                        <div className="text-center mt-3">
                          <button 
                            className="btn btn-outline-secondary" 
                            onClick={resetCheckIn}
                          >
                            New Check-in
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS */}
      <style jsx="true">{`
        .qr-scanner-container {
          max-width: 500px;
          margin: 0 auto;
          border: 2px solid #ccc;
          border-radius: 10px;
          overflow: hidden;
        }
        
        #qr-reader {
          width: 100% !important;
        }
        
        #qr-reader video {
          width: 100% !important;
        }
        
        #qr-reader__scan_region {
          background: white;
        }
        
        #qr-reader__scan_region img {
          display: none;
        }
        
        .checkin-section {
          padding: 20px;
        }
        
        .manual-input-container {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .registration-details {
          animation: fadeIn 0.5s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* Custom CSS for buttons */
        .verify-btn {
          background-color: #8B0000;
          border-color: #8B0000;
          color: white;
        }
        
        .verify-btn:hover {
          background-color: #6B0000;
          border-color: #6B0000;
          color: white;
        }
        
        .button-row {
          gap: 10px;
        }
      `}</style>
    </div>
  );
};

export default EventCheckIn;