"use client"

import { useState, useRef, useEffect } from "react"
import { Navbar, Nav, Container, Button } from "react-bootstrap"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { FaSignOutAlt, FaUserCog, FaShoppingCart, FaChevronDown, FaBell } from "react-icons/fa"
import "../CSS/NavBar.css"
import logo from "../Assests/Logo.png"
import axios from "axios"

function NavBar() {
  const [showPopover, setShowPopover] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userFullName, setUserFullName] = useState(null)
  const [userImage, setUserImage] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [cartItemCount, setCartItemCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const target = useRef(null)
  const popoverRef = useRef(null)
  const notificationsRef = useRef(null)
  const navigate = useNavigate()

  // Function to get user profile data including profile picture
  const getUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await axios.get("http://localhost:8000/registerlogin/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // If profile picture URL exists in response, update it in localStorage and state
      if (response.data && response.data.profile_picture_url) {
        localStorage.setItem("user_profile_image", response.data.profile_picture_url)
        setUserImage(response.data.profile_picture_url)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await axios.get("http://localhost:8000/pandit_booking/notifications/")
      setNotifications(response.data.results || [])

      // Count unread notifications
      const unreadCount = response.data.results ? response.data.results.filter((notif) => !notif.is_read).length : 0
      setUnreadNotificationsCount(unreadCount)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  // Mark a single notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      await axios.put(`http://localhost:8000/pandit_booking/notifications/mark-read/${notificationId}/`)

      // Update the local state
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.notification_id === notificationId ? { ...notif, is_read: true } : notif,
        ),
      )

      // Update unread count
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      await axios.put("http://localhost:8000/pandit_booking/notifications/mark-all-read/")

      // Update the local state
      setNotifications((prevNotifications) => prevNotifications.map((notif) => ({ ...notif, is_read: true })))

      // Reset unread count
      setUnreadNotificationsCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Check if user is logged in and retrieve user details
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const fullName = localStorage.getItem("user_full_name")
    const profileImage = localStorage.getItem("user_profile_image")

    setUserFullName(fullName)
    setIsLoggedIn(!!token)

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      // Set profile image from localStorage if it exists
      if (profileImage) {
        setUserImage(profileImage)
      } else {
        // If no profile image in localStorage, try to fetch it
        getUserProfile()
      }

      fetchCartData()
      fetchNotifications()
    }

    const handleCartUpdate = (event) => {
      if (event.detail && event.detail.items) {
        setCartItems(event.detail.items)
        setCartItemCount(event.detail.items.length)
      } else {
        fetchCartData()
      }
    }

    // Listen for profile updates from other components
    const handleProfileUpdate = (event) => {
      if (event.detail && event.detail.profilePicture) {
        setUserImage(event.detail.profilePicture)
      } else {
        getUserProfile()
      }
    }

    // Listen for notification updates from other components
    const handleNotificationUpdate = () => {
      fetchNotifications()
    }

    window.addEventListener("cartUpdated", handleCartUpdate)
    window.addEventListener("profileUpdated", handleProfileUpdate)
    window.addEventListener("notificationUpdated", handleNotificationUpdate)

    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        target.current &&
        !target.current.contains(event.target)
      ) {
        setShowPopover(false)
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        event.target.id !== "notification-bell"
      ) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    // Set up a notification polling interval (optional)
    const notificationInterval = setInterval(() => {
      if (isLoggedIn) {
        fetchNotifications()
      }
    }, 60000) // Check every minute

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate)
      window.removeEventListener("profileUpdated", handleProfileUpdate)
      window.removeEventListener("notificationUpdated", handleNotificationUpdate)
      document.removeEventListener("mousedown", handleClickOutside)
      clearInterval(notificationInterval)
    }
  }, [isLoggedIn])

  const fetchCartData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/renting/cart/")
      setCartItems(response.data.items || [])
      setCartItemCount(response.data.items ? response.data.items.length : 0)
    } catch (error) {
      console.error("Error fetching cart data:", error)
    }
  }

  const handlePopover = () => setShowPopover(!showPopover)

  const handleNotificationsToggle = () => {
    setShowNotifications(!showNotifications)
    // If opening notifications, mark them as seen (optional)
    if (!showNotifications && unreadNotificationsCount > 0) {
      // You could choose to mark them as read when clicked, or just when individual items are clicked
      // markAllNotificationsAsRead();
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_role")
    localStorage.removeItem("user_full_name")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_phone_number")
    localStorage.removeItem("user_address")
    localStorage.removeItem("user_country")
    localStorage.removeItem("user_profile_image")

    delete axios.defaults.headers.common["Authorization"]

    setIsLoggedIn(false)
    setShowPopover(false)
    setShowNotifications(false)
    setCartItems([])
    setCartItemCount(0)
    setUserImage(null)
    setNotifications([])
    setUnreadNotificationsCount(0)

    navigate("/login/user")
  }

  const handleCartClick = () => {
    navigate("/cart")
  }

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    if (!notification.is_read) {
      markNotificationAsRead(notification.notification_id)
    }

    // Handle navigation or action based on notification type
    // This is just an example - adjust according to your notification types
    if (notification.link) {
      navigate(notification.link)
      setShowNotifications(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Format notification time
  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return "Just now"
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hr ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
    }

    return date.toLocaleDateString()
  }

  return (
    <>
      <Navbar bg="light" expand="lg" className="fixed-top main-navbar custom-navbar">
        <Container fluid className="justify-content-between align-items-center h-100">
          <div className="navbar-brand-container">
            <Navbar.Brand>
              <NavLink to="/" className="navbar-nav-link">
                <img src={logo || "/placeholder.svg"} className="nav_logo" alt="Logo" />
              </NavLink>
            </Navbar.Brand>
          </div>

          <div className="nav-links-container">
            <Nav className="navbar-nav-links">
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "navbar-nav-link navbar-active-link" : "navbar-nav-link")}
              >
                Home
              </NavLink>
              <NavLink
                to="/rent-traditionals"
                className={({ isActive }) => (isActive ? "navbar-nav-link navbar-active-link" : "navbar-nav-link")}
              >
                Renting
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? "navbar-nav-link navbar-active-link" : "navbar-nav-link")}
              >
                Contact Us
              </NavLink>
            </Nav>
          </div>

          <div className="user-actions-container">
            {isLoggedIn && (
              <>
                <div className="action-icon-wrapper">
                  <Button
                    variant="link"
                    className="icon-button"
                    onClick={handleNotificationsToggle}
                    id="notification-bell"
                    aria-label="Notifications"
                  >
                    <FaBell size={22} />
                    {unreadNotificationsCount > 0 && <span className="icon-badge">{unreadNotificationsCount}</span>}
                  </Button>
                </div>

                <div className="action-icon-wrapper">
                  <Button variant="link" className="icon-button" onClick={handleCartClick} aria-label="Shopping cart">
                    <FaShoppingCart size={22} />
                    {cartItemCount > 0 && <span className="icon-badge">{cartItemCount}</span>}
                  </Button>
                </div>
              </>
            )}

            <div ref={target}>
              {isLoggedIn ? (
                <div className="user-profile-section" onClick={handlePopover}>
                  <div className="user-avatar-container">
                    {userImage ? (
                      <img
                        src={userImage || "/placeholder.svg"}
                        alt={userFullName || "User"}
                        className="user-avatar"
                        onError={(e) => {
                          // If image fails to load, fallback to initials
                          e.target.style.display = "none"
                          e.target.parentNode.classList.add("initials-avatar")
                          e.target.parentNode.innerText = getInitials(userFullName)
                        }}
                      />
                    ) : (
                      <div className="initials-avatar">{getInitials(userFullName)}</div>
                    )}
                  </div>
                  <span className="my-user-name">{userFullName}</span>
                  <FaChevronDown size={12} className="dropdown-chevron" />
                </div>
              ) : (
                <Button className="nav_sign-up-btn" variant="custom" onClick={handlePopover}>
                  Sign Up
                </Button>
              )}
            </div>
          </div>
        </Container>
      </Navbar>

      {showPopover && !isLoggedIn && (
        <div className="navbar-custom-popover" ref={popoverRef}>
          <div className="navbar-popover-header">Register Account</div>
          <div className="navbar-popover-body">
            <Link to="/register/user" className="navbar-popover-option">
              Register as User
            </Link>
            <Link to="/register/pandit" className="navbar-popover-option">
              Register as Pandit
            </Link>
            <Link to="/login/user" className="navbar-popover-option">
              Already have an account? Login
            </Link>
          </div>
        </div>
      )}

      {showPopover && isLoggedIn && (
        <div className="navbar-custom-popover" ref={popoverRef}>
          <div className="navbar-popover-header">
            <div className="popover-user-info">
              <div className="popover-avatar">
                {userImage ? (
                  <img
                    src={userImage || "/placeholder.svg"}
                    alt={userFullName || "User"}
                    className="popover-user-img"
                    onError={(e) => {
                      // If image fails to load, fallback to initials
                      e.target.style.display = "none"
                      e.target.parentNode.classList.add("popover-initials")
                      e.target.parentNode.innerText = getInitials(userFullName)
                    }}
                  />
                ) : (
                  <div className="popover-initials">{getInitials(userFullName)}</div>
                )}
              </div>
              <div className="popover-user-details">
                <div className="popover-user-name">{userFullName}</div>
                <div className="popover-user-status">Logged In</div>
              </div>
            </div>
          </div>
          <div className="navbar-popover-body">
            <Link to="/profile" className="navbar-popover-option">
              <FaUserCog className="navbar-option-icon" />
              <span>Profile Settings</span>
            </Link>

            <button onClick={handleLogout} className="navbar-popover-option navbar-logout-option">
              <FaSignOutAlt className="navbar-option-icon" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {showNotifications && isLoggedIn && (
        <div className="navbar-notifications-popover" ref={notificationsRef}>
          <div className="notifications-header">
            <h5>Notifications</h5>
            {unreadNotificationsCount > 0 && (
              <Button variant="link" className="mark-all-read-btn" onClick={markAllNotificationsAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
          <div className="notifications-body">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`notification-item ${!notification.is_read ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{formatNotificationTime(notification.created_at)}</span>
                  </div>
                  {!notification.is_read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>
         {/* 
<div className="notifications-footer">
  <Link to="/notifications" className="view-all-link">
    View all notifications
  </Link>
</div> 
*/}

        </div>
      )}
    </>
  )
}

export default NavBar
