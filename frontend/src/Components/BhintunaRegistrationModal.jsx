"use client"
import { Modal, Form, Button } from "react-bootstrap"
import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import "../CSS/BhintunaRegistrationModal.css"

function RegistrationModal({ show, handleClose, eventType, categoryId }) {
  const { eventDetailId } = useParams()
  const [formData, setFormData] = useState({})
  const [rallyOptions, setRallyOptions] = useState([])

  useEffect(() => {
    if (eventType === "rally") {
      fetchRallyOptions()
    }
  }, [eventType])

  const fetchRallyOptions = async () => {
    try {
      const response = await axios.get("http://localhost:8000/adminwork/events/rallyoptions/")
      setRallyOptions(response.data)
    } catch (error) {
      console.error("Error fetching rally options:", error)
    }
  }

  const getHeaderImage = (type) => {
    switch (type) {
      case "rally":
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-07%20at%2012.02.35%E2%80%AFAM-uloRB0rddzPTOOHBTfwdV47XBpDee5.png"
      case "volunteer":
        return "music-background.jpg"
      case "stall":
        return "stalls-background.jpg"
      default:
        return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-07%20at%2012.02.35%E2%80%AFAM-uloRB0rddzPTOOHBTfwdV47XBpDee5.png"
    }
  }

  const getTitle = (type) => {
    switch (type) {
      case "rally":
        return "Participation"
      case "volunteer":
        return "Music"
      case "stall":
        return "Stalls"
      default:
        return "Registration"
    }
  }

  const getSpecialField = (type) => {
    switch (type) {
      case "rally":
        return (
          <Form.Group className="mb-3">
            <Form.Label>Rally Option</Form.Label>
            <Form.Select
              className="form-input"
              onChange={(e) => setFormData({ ...formData, rally_option: e.target.value })}
            >
              <option value="">Select an option</option>
              {rallyOptions.map((option) => (
                <option key={option.option_id} value={option.option_id}>
                  {option.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )
      case "music":
        return (
          <Form.Group className="mb-3">
            <Form.Label>Music Instrument</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter instrument"
              className="form-input"
              onChange={(e) => setFormData({ ...formData, music_instrument: e.target.value })}
            />
          </Form.Group>
        )
      case "stall":
        return (
          <Form.Group className="mb-3">
            <Form.Label>Drinks</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter drinks"
              className="form-input"
              onChange={(e) => setFormData({ ...formData, drinks: e.target.value })}
            />
          </Form.Group>
        )
      default:
        return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("access_token")
    if (!token) {
      alert("You must be logged in to register!")
      return
    }

    const registrationData = {
      event_detail: eventDetailId,
      category: categoryId,
      ...formData,
    }

    try {
      const response = await fetch("http://localhost:8000/adminwork/events/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(registrationData),
      })

      if (!response.ok) {
        throw new Error("Failed to register for the event")
      }

      const data = await response.json()
      console.log("Registration success:", data)
      handleClose()
    } catch (error) {
      console.error("Error:", error)
      alert("There was an error registering for the event.")
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered className="registration-modal" size="lg">
      <div
        className="modal-header-custom"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${getHeaderImage(eventType)})`,
        }}
      >
        <h2 className="modal-title-custom">{getTitle(eventType)}</h2>
        <button type="button" className="btn-close btn-close-white" onClick={handleClose} aria-label="Close"></button>
      </div>

      <Modal.Body className="custom-modal-body">
        <Form onSubmit={handleSubmit}>
          {getSpecialField(eventType)}

          <div className="button-container">
            <Button className="register-button" type="submit">
              Register
            </Button>
            <Button className="cancel-button" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default RegistrationModal
