import React, { useState } from "react";
import "./styles/loginpage.css";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="loginPage">
            <div className="inputContainer">
                <h2 className="title">Welcome Back</h2>
                <p className="subtitle">Sign in to your account</p>

                <label className="label" htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    className="inputField"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                <button className="loginButton">Sign In</button>

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
