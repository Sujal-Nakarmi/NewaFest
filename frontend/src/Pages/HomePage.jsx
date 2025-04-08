import React from 'react'
import NavBar from '../Components/NavBar'
import HeroSection from '../Components/HeroSection'

import ServicesSection from '../Components/ServiceSection'
import 'bootstrap/dist/css/bootstrap.min.css'
import Footer from '../Components/Footer'






function HomePage() {
  return (
    <div >

        <NavBar /><br/><br/><br/>
        <HeroSection />
        <ServicesSection />
       
        
      


       <Footer />
     
     
    </div>
  )
}

export default HomePage