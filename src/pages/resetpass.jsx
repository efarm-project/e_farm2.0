import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./styles/resetpass.css";
import OTPInput from "../components/otpInput";

const ResetPass = () => {
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState("+254");
    const [rawNumber, setRawNumber] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handlePhoneChange = (value, country) => {
        // Set full phone number with country code
        setPhone(value);

        // Set country code separately
        setCountryCode("+" + country.dialCode);

        // Set raw number (without country code)
        setRawNumber(value.slice(country.dialCode.length));

        // Clear any existing error
        setError("");
    };

    const validatePhoneNumber = () => {
        // Basic validation for length (adjust as needed for specific phone formats)
        const phoneNumberPattern = /^[0-9]{7,15}$/; // 7-15 digits for the phone number
        return phoneNumberPattern.test(rawNumber);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validatePhoneNumber()) {
            setError("Please enter a valid phone number.");
        } else {
            setError("");
            setSuccess(true);
            alert(`Submitted Phone: ${countryCode} ${rawNumber}`);

            // Process the valid phone number here
        }
    };

    return (
        <div className="forgotpass">
            <div className="resetContainer">
                <h1 className="resetTitle">Forgot Your Password?</h1>
                <p className="resetSubtitle">Enter your phone number to reset your code</p>
                <form onSubmit={handleSubmit} className="resetForm">
                    <label className="label" htmlFor="phone">
                        Phone Number
                    </label>
                    <PhoneInput
                        country={"ke"}
                        value={phone}
                        onChange={handlePhoneChange}
                        inputClass="inputField"
                        placeholder="Enter phone number"
                    />
                    {error && <p className="errorText">{error}</p>}
                    {success ? (
                        <OTPInput />
                    ) : (
                        <button type="submit" className="resetButton">
                            Send Reset Code
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ResetPass;
