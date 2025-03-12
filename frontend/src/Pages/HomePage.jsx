import React from 'react'
import NavBar from '../Components/NavBar'
import HeroSection from '../Components/HeroSection'

import ServicesSection from '../Components/ServiceSection'
import 'bootstrap/dist/css/bootstrap.min.css'





function HomePage() {
  return (
    <div >

        <NavBar /><br/><br/><br/>
        <HeroSection />
        <ServicesSection />
       
     
     
    </div>
  )
}

export default HomePage