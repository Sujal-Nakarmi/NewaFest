import React from 'react'
import NavBar from '../Components/NavBar'
import 'bootstrap/dist/css/bootstrap.min.css'
import GaiJatraHeroSection from '../Components/GaiJatraHeroSection'
import GaiJatraCelebration from '../Components/GaiJatraCelebrationMethod'



function GaiJatra() {
  return (
    <div >
      <NavBar /><br/><br/>
      <GaiJatraHeroSection/>
      <GaiJatraCelebration/>
     
     
    </div>
  )
}

export default GaiJatra