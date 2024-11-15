import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/registerpage.css";

const Registerpage = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullnames: name,
          phonenumber: phoneNumber,
          location,
          password,
          role: role.toLowerCase(), // Match backend role names
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! Redirecting to login...');
        navigate('/login'); // Redirect to login page
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registerPage">
      <div className="inputContainer">
        <h2 className="title">Join EcoFarm Community</h2>
        <p className="subtitle">Create an account to join our farming community</p>

        {error && <p className="errorText">{error}</p>}

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
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        <label className="label">Location</label>
        <input
          type="text"
          placeholder="Enter your location"
          className="inputField"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <label className="label">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          className="inputField"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

        <button
          className="registerButton"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="signinText">
          Already have an account? <a href="/login" className="signinLink">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Registerpage;
