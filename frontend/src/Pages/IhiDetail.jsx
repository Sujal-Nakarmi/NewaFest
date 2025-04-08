import React from 'react'
import NavBar from '../Components/NavBar'
import IhiHeroSection from '../Components/IhiHeroSection'
import PanditBooking from '../Components/PanditBookingSection.jsx'
import IhiCelebration from '../Components/IhiCelebration.jsx'

function IhiDetail(){
    return(
        <div>
            <NavBar /><br/><br/>
            <IhiHeroSection />
            <PanditBooking />
            <IhiCelebration />

        </div>

    )

}

export default IhiDetail