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
          <h2 className='IHH2'>Become a part of this event</h2>
          <p className="lead">
          Celebrate the sacred Ihi ceremony and preserve our cherished Newar tradition with pride and purpose.
          Register now to be part of this spiritual journey and book a trusted Pandit to perform the Ihi ritual.
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
              Ihi (Bel Bibaha) is a sacred and unique rite of passage in Newar culture where young Newar girls are ceremonially married to the bel fruit (wood apple), symbolizing Lord Vishnu. This spiritual tradition ensures that the girl remains symbolically married even after her future human marriage, protecting her from the stigmas of widowhood. The event is filled with rituals, music, blessings, and vibrant attire, reflecting the deep cultural heritage and spiritual beliefs of the Newar community.

Join us to celebrate this meaningful tradition and keep the essence of Newar identity alive for future generations.
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