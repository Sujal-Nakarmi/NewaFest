import React from "react";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ isOpen, onClose, message, redirectPath = "/login/user" }) => {
    const navigate = useNavigate();
    
    if (!isOpen) return null;
    
    const handleLogin = () => {
      // Get return URL from localStorage or default to current URL
      const returnUrl = localStorage.getItem("returnUrl") || window.location.pathname;
      // Navigate to login with returnUrl as a query parameter
      navigate(`${redirectPath}?returnUrl=${encodeURIComponent(returnUrl)}`);
    };
    
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className="modal-content" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">Authentication Required</h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>{message || "You need to be logged in to access this feature."}</p>
          </div>
          <div className="modal-footer">
            <button 
              className="btn btn-primary" 
              onClick={handleLogin}
            >
              Log In
            </button>
            <button 
              className="btn btn-outline-secondary" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
        
      
      <style jsx="true">{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 5px;
          width: 100%;
          max-width: 500px;
          animation: slideIn 0.3s ease-out;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
        }
        
        .modal-body {
          padding: 1rem;
        }
        
        .modal-footer {
          padding: 1rem;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          border-top: 1px solid #dee2e6;
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthModal;