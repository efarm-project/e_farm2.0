import React,{useState} from "react";
import "./styles/otpInput.css"
const OTPInput = () => {
    const [otp, setOtp] = useState('');
    return(
        <div>
            <input className="otpInput" type="text" name="OTP" value={otp} onChange={(e) => {setOtp(e.target.value)}} placeholder="OTP"/>
            <button className="verifyButton">Verify</button>
        </div>

    )
}

export default OTPInput;