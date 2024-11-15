import React from 'react';
import './styles/navbar.css'
import { EdRoute, HomeRoute, RegRoute } from '../functions/routes';
import EdResource from '../pages/educationalResource';

const Navbar = () => {
    return(
        <div className="navbar">
            <h3 className='logo'>EcoFarm Network</h3>
            <div className="links">
                <p onClick={HomeRoute}>Home</p>
                <button className="getStarted" onClick={RegRoute}>Get Started</button>
            </div>
        </div>
    )
}

export default Navbar;