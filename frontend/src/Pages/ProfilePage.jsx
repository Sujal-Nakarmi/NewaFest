import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Tabs, Tab, Modal, Image } from "react-bootstrap";
import { FaUser, FaEdit, FaKey, FaSignOutAlt, FaCamera } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../CSS/Profile.css";

function ProfilePage() {
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    address: "",
    country: ""
  });
  
  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  // API base URL
  const API_BASE_URL = "http://localhost:8000/registerlogin";

  // Fetch user profile data
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchUserProfile = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/profile/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUser(data);
      setFormData({
        full_name: data.full_name || "",
        phone_number: data.phone_number || "",
        address: data.address || "",
        country: data.country || ""
      });
      
      // Set profile picture URL if it exists
      if (data.profile_picture_url) {
        setPreviewUrl(data.profile_picture_url);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle profile picture selection
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Reset form data to original user data if canceling
      setFormData({
        full_name: user.full_name || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        country: user.country || ""
      });
      
      // Reset profile picture preview if canceling
      if (user.profile_picture_url) {
        setPreviewUrl(user.profile_picture_url);
      } else {
        setPreviewUrl(null);
      }
      setProfilePicture(null);
    }
    setEditMode(!editMode);
  };

  // Handle form submission for profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const accessToken = localStorage.getItem("access_token");
    
    // Create FormData object for multipart/form-data submission (required for file uploads)
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }
    
    // Add profile picture if one was selected
    if (profilePicture) {
      formDataToSend.append("profile_picture", profilePicture);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/profile/update/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Note: Do NOT set Content-Type header when using FormData
          // It will be set automatically with the correct boundary
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      
      // Update preview URL from response if available
      if (updatedUser.profile_picture_url) {
        setPreviewUrl(updatedUser.profile_picture_url);
        localStorage.setItem("user_profile_image", updatedUser.profile_picture_url);
        
      } else {
        localStorage.removeItem("user_profile_image");
      }
    
       // Update other user data in localStorage
    localStorage.setItem("user_full_name", updatedUser.full_name || "");
    localStorage.setItem("user_phone_number", updatedUser.phone_number || "");
    localStorage.setItem("user_address", updatedUser.address || "");
    localStorage.setItem("user_country", updatedUser.country || "");
      
      setSuccessMessage("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }

    const accessToken = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${API_BASE_URL}/profile/change-password/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to change password");
      }

      setPasswordSuccess("Password changed successfully!");
      // Reset password fields
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: ""
      });
      
      // Close modal after success
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(null);
      }, 2000);
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login/user";
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="profile-card shadow">
            <Card.Header style={{ backgroundColor: "#8B0000" }} className="text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0"><FaUser className="me-2" /> User Profile</h3>
                <Button variant="light" size="sm" onClick={handleLogout}>
                  <FaSignOutAlt className="me-1" /> Logout
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              {loading && !editMode ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading profile...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <>
                  {successMessage && (
                    <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
                      {successMessage}
                    </Alert>
                  )}
                  
                  {/* Profile Picture Section */}
                  <div className="text-center mb-4">
                    <div className="profile-picture-container">
                      {previewUrl ? (
                        <Image 
                          src={previewUrl} 
                          roundedCircle 
                          className="profile-picture"
                          alt="Profile"
                        />
                      ) : (
                        <div className="default-profile-picture">
                          <FaUser size={50} />
                        </div>
                      )}
                      
                      {editMode && (
                        <>
                          <div className="edit-overlay" onClick={triggerFileInput}>
                            <span className="edit-icon">
                              <FaCamera size={20} />
                            </span>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleProfilePictureChange}
                            accept="image/*"
                            className="d-none"
                          />
                        </>
                      )}
                    </div>
                    {editMode && (
                      <p className="text-muted small mt-2">Click on the image to change your profile picture</p>
                    )}
                  </div>
                  
                  <Tabs defaultActiveKey="profile" className="mb-4">
                    <Tab eventKey="profile" title="Profile Information">
                      {editMode ? (
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleInputChange}
                              required
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              value={user?.email || ""}
                              disabled
                              className="bg-light"
                            />
                            <Form.Text className="text-muted">
                              Email cannot be changed
                            </Form.Text>
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="text"
                              name="phone_number"
                              value={formData.phone_number}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                              type="text"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                            />
                          </Form.Group>
                          
                          <div className="d-flex justify-content-end mt-4">
                            <Button variant="secondary" onClick={toggleEditMode} className="me-2">
                              Cancel
                            </Button>
                            <Button variant="success" type="submit" disabled={loading}>
                              {loading ? <Spinner animation="border" size="sm" /> : "Save Changes"}
                            </Button>
                          </div>
                        </Form>
                      ) : (
                        <div className="profile-info">
                          <Row className="mb-3">
                            <Col md={4} className="profile-label">Full Name:</Col>
                            <Col md={8} className="profile-value">{user?.full_name || "Not provided"}</Col>
                          </Row>
                          <Row className="mb-3">
                            <Col md={4} className="profile-label">Email:</Col>
                            <Col md={8} className="profile-value">{user?.email || "Not provided"}</Col>
                          </Row>
                          <Row className="mb-3">
                            <Col md={4} className="profile-label">Role:</Col>
                            <Col md={8} className="profile-value">
                              <span className="badge bg-info">{user?.user_role || "User"}</span>
                            </Col>
                          </Row>
                          <Row className="mb-3">
                            <Col md={4} className="profile-label">Phone Number:</Col>
                            <Col md={8} className="profile-value">{user?.phone_number || "Not provided"}</Col>
                          </Row>
                          <Row className="mb-3">
                            <Col md={4} className="profile-label">Address:</Col>
                            <Col md={8} className="profile-value">{user?.address || "Not provided"}</Col>
                          </Row>
                          <Row className="mb-3">
                            <Col md={4} className="profile-label">Country:</Col>
                            <Col md={8} className="profile-value">{user?.country || "Not provided"}</Col>
                          </Row>
                          
                          <div className="d-flex justify-content-end mt-4">
                            <Button variant="primary" onClick={toggleEditMode}>
                              <FaEdit className="me-1" /> Edit Profile
                            </Button>
                          </div>
                        </div>
                      )}
                    </Tab>
                    
                    <Tab eventKey="security" title="Security">
                      <div className="security-section p-3">
                        <h5>Account Security</h5>
                        <p>Manage your password and security settings</p>
                        
                        <Button 
                          variant="outline-primary" 
                          className="mt-3"
                          onClick={() => setShowPasswordModal(true)}
                        >
                          <FaKey className="me-2" /> Change Password
                        </Button>
                      </div>
                    </Tab>
                  </Tabs>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}
          {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
          
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="old_password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update Password
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ProfilePage;