"use client"

import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "../CSS/BhintunaHeroSection.css"
import RegistrationModal from "../Components/BhintunaRegistrationModal"
import Rally from '../Assests/Rally.png'
import VMusic from '../Assests/VMusic.png'
import VStall from '../Assests/VStall.png'

function GaiJatraHeroSection() {
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState("")
  const [categoryId, setCategoryId] = useState(null)  // New state to store category ID
  const [categories, setCategories] = useState([])

  // Fetch categories from API
  useEffect(() => {
    fetch("http://localhost:8000/adminwork/events/categories/")  
      .then(response => response.json())
      .then(data => {
        setCategories(data)
      })
      .catch(error => console.error("Error fetching categories:", error))
  }, [])

  // Handle register click with dynamic category ID
  const handleRegisterClick = (eventType) => {
    const category = categories.find(cat => cat.code.toLowerCase() === eventType.toLowerCase())
    if (category) {
      setCategoryId(category.category_id)  // Set category ID based on event type
      setSelectedEvent(eventType)
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedEvent("")
    setCategoryId(null)  // Reset category ID when modal is closed
  }

  return (
    <div className="App">
      {/* Hero Section */}
      <div className="bhintuna">
        <div className="container text-center">
          <h1>Get Involved</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2>Become a part of Gai Jatra</h2>
          <p className="lead">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
          </p>
        </div>

        <div className="row">
        

          {/* Volunteer */}
          <div className="col-md-4">
            <div className="event-card">
              <img
                src={VMusic}
                alt="Musicians performing"
                className="img-fluid"
              />
              <div className="event-title">Volunteer</div>
              <div className="event-subtitle">(Volunteer Registration)</div>
              <button className="btn register-btn" onClick={() => handleRegisterClick("volunteer")}>
                Register
              </button>
            </div>
          </div>

          {/* Stalls */}
          <div className="col-md-4">
            <div className="event-card">
              <img src= {VStall} alt="Food stalls" className="img-fluid" />
              <div className="event-title">Stalls</div>
              <div className="event-subtitle">(Stall Registration)</div>
              <button className="btn register-btn" onClick={() => handleRegisterClick("stall")}>
                Register
              </button>
            </div>
          </div>
        </div>
      </div>

      <RegistrationModal 
        show={showModal} 
        handleClose={handleCloseModal} 
        eventType={selectedEvent} 
        categoryId={categoryId}  // Pass the category ID to modal
      />
    </div>
  )
}

export default GaiJatraHeroSection
