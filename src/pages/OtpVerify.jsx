import { useState } from "react";
import { verifyMfaLogin } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();

  const username = location.state?.username;

  const [otp, setOtp] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      await verifyMfaLogin({ username, otp });

      navigate("/dashboard");

    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <h2>Verify OTP</h2>

      <input
        type="text"
        placeholder="Enter OTP"
        onChange={(e) => setOtp(e.target.value)}
      />

      <button type="submit">Verify</button>
    </form>
  );
}