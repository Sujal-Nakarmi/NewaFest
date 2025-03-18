const EventRegistrationRouter = () => {
    const { eventDetailId } = useParams();
    
    // Convert to number for comparison
    const eventId = parseInt(eventDetailId);
    
    // Render different components based on the event ID
    switch(eventId) {
      case 12:  // ID for Ihi
        return <IhiDetail />;
      case 13:  // ID for Bhintuna
        return <BhintunaDetail />;
      case 14:  // ID for Gai Jatra
        return <GaiJatra />;
      default:
        // Fallback or redirect to a "not found" page
        return <DefaultEventDetail />;
    }
  };

  export default EventRegistrationRouter