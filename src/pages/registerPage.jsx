

import React, { useState } from "react";
import "./styles/registerpage.css";
import { LoginRoute } from "../functions/routes";

const Registerpage = () => {
    const [name, setName] = useState('');
    const [phoneNumber, setphoneNumber] = useState('');
    const [location, setlocation] = useState('');
    const [password, setpassword] = useState('');
    const [role, setRole] = useState('Farmer');

    return (
        <div className="registerPage">
            <div className="inputContainer">
                <h2 className="title">Join EcoFarm Community</h2>
                <p className="subtitle">Create an account to join our farming community</p>

                <label className="label">Full Name</label>
                <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="inputField" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                />

                <label className="label">Phone Number</label>
                <input 
                    type="text" 
                    placeholder="Enter your phone number" 
                    className="inputField" 
                    value={phoneNumber} 
                    onChange={(e) => setphoneNumber(e.target.value)} 
                />

                <label className="label">Location</label>
                <input 
                    type="text" 
                    placeholder="Enter your location" 
                    className="inputField" 
                    value={location} 
                    onChange={(e) => setlocation(e.target.value)} 
                />

                <label className="label">Password</label>
                <input 
                    type="password" 
                    placeholder="Enter your password" 
                    className="inputField" 
                    value={password} 
                    onChange={(e) => setpassword(e.target.value)} 
                />

                <label className="label">Role</label>
                <select 
                    className="inputField" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="Farmer">Farmer</option>
                    <option value="Jobseeker">Jobseeker</option>
                    <option value="Vendor">Vendor</option>
                </select>

                <button className="registerButton">Create Account</button>
                <p className="signinText">Already have an account? <a href="/login" className="signinLink" onClick={LoginRoute}>Sign in</a></p>
            </div>
        </div>
    );
};

export default Registerpage;
