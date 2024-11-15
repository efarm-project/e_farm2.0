import React from 'react';
import Navbar from '../components/navbar';
import HeroSection from '../components/heroSection';
import './styles/landingPage.css'

const LandingPage = () => {
    return(
        <div className="landingPage">
            <Navbar/>
            <HeroSection/>
        </div>
    )
}

export default LandingPage;