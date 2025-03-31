import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../CSS/IhiHeroSection.css';
import IhiHead from '../Assests/IhiHead.png';
import IhiRegistrationModal from './IhiRegistrationModal';

const IhiHeroSection = () => {
  // State to control modal visibility
  const [showModal, setShowModal] = useState(false);
  
  // Get eventDetailId from URL parameters
  const { eventDetailId } = useParams();
  
  const handleOpenModal = () => {
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="App">
      {/* Hero Section */}
      <div className="ihi">
        <div className="container text-center">
          <h1>Get Involved</h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2>Become a part of this event</h2>
          <p className="lead">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
          </p>
        </div>
        <br/><br/>
        <div className="event-card">
          <div className="row align-items-center">
            <div className="col-lg-5">
              <img src={IhiHead} alt="Ihi Ceremony" style={{ width: "400px", height: "400px" }} />
            </div>
            <div className="col-lg-7">
              <h3 className="event-title">Ihi</h3>
              <p className="event-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
              </p>
              <p className="event-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
              </p>
              <button className="register-btn" onClick={handleOpenModal}>Register</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ihi Registration Modal */}
      <IhiRegistrationModal
        show={showModal}
        handleClose={handleCloseModal}
        eventDetailId={eventDetailId}
      />
    </div>
  );
};

export default IhiHeroSection;