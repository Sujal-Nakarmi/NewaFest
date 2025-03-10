import React from 'react'
import NavBar from '../Components/NavBar'
import HeroSection from '../Components/HeroSection'
import EventCard from '../Components/EventSection'
import 'bootstrap/dist/css/bootstrap.min.css'





function HomePage() {
  return (
    <div >

        <NavBar />
        <HeroSection />
        <EventCard />
     
     
    </div>
  )
}

export default HomePage