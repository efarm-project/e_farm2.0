import React, { useState } from "react";
import "./styles/loginpage.css";

const LoginPage = () => {
  const [phoneNumber, setPhonenumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer'); // Default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phonenumber: phoneNumber,
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Login successful!');
        console.log('Logged in user:', data);
        // Redirect or perform further actions here
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="inputContainer">
        <h2 className="title">Welcome Back</h2>
        <p className="subtitle">Sign in to your account</p>

        {error && <p className="errorText">{error}</p>}

        <label className="label" htmlFor="phonenumber">Phone number</label>
        <input
          type="text"
          id="phonenumber"
          className="inputField"
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(e) => setPhonenumber(e.target.value)}
        />

        <label className="label" htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          className="inputField"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="label" htmlFor="role">Role</label>
        <select
          id="role"
          className="inputField"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="farmer">Farmer</option>
          <option value="vendor">Vendor</option>
          <option value="jobSeeker">Job Seeker</option>
        </select>

        <button
          className="loginButton"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <p className="forgotPassword">
          <a href="#" className="forgotPasswordLink">Forgot Password?</a>
        </p>

        <p className="registerText">
          Don't have an account? <a href="/register" className="registerLink">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
