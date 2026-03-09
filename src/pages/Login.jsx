import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { Eye, EyeOff } from "lucide-react";
import {
  loginUser,
  setupMfa,
  verifyMfa,
  verifyLogin,
} from "../utils/api";

import { showToast } from "@/utils/showToast";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [qr, setQr] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* RESET ERRORS WHEN STEP CHANGES */

  useEffect(() => {
    setErrors({});
  }, [step]);

  /* SKIP */

  const handleSkip = () => {
    // console.log("token", localStorage)
    navigate("/")
  };

  /* VALIDATIONS */

  const validateLogin = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = {};

    if (!otp) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "OTP must be a 6 digit number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* LOGIN */

  const handleLogin = async () => {
    if (loading) return;
    if (!validateLogin()) return;

    try {
      setLoading(true);

      const res = await loginUser({ username, password });

      /* MFA REQUIRED */

      if (res?.mfa_required) {
        setStep("otp");
        return;
      }

      /* LOGIN SUCCESS */

      if (res?.access) {
        localStorage.setItem("access_token", res.access);
        localStorage.setItem("refresh_token", res.refresh);

        showToast.success("Login successful");
        setStep("enable_mfa");
        return;
      }

      /* LOGIN FAILED RESPONSE */

      showToast.error(
        res?.detail ||
        res?.error ||
        "Invalid username or password"
      );

    } catch (err) {
      showToast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ENABLE MFA */

  const enableMfa = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const res = await setupMfa({ username, password });

      if (!res?.qr_code) {
        throw new Error("Failed to generate QR");
      }

      setQr(res.qr_code);
      setStep("scan_qr");

    } catch (err) {
      showToast.error(err?.message || "MFA Setup Failed");
    } finally {
      setLoading(false);
    }
  };

  /* VERIFY MFA ENABLE */

  const verifyEnableMfa = async () => {
    if (loading) return;
    if (!validateOtp()) return;

    try {
      setLoading(true);

      const res = await verifyMfa({ username, otp });

      if (res?.mfa_enabled) {
        showToast.success("MFA Enabled");
        // console.log("token", localStorage)
        navigate("/")
      } else {
        showToast.error("Invalid OTP");
      }

    } catch (err) {
      showToast.error(err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* VERIFY OTP LOGIN */

  const verifyOtpLogin = async () => {
    if (loading) return;
    if (!validateOtp()) return;

    try {
      setLoading(true);

      const res = await verifyLogin({ username, otp });

      if (res?.access) {
        localStorage.setItem("access_token", res.access);
        localStorage.setItem("refresh_token", res.refresh);
        showToast.success("Login successful");
        navigate("/")
      } else {
        showToast.error("Invalid OTP");
      }

    } catch (err) {
      showToast.error(err?.message || "OTP Login Failed");
    } finally {
      setLoading(false);
    }
  };

  /* UI */

  return (
    <div className="auth-container">
      <div className="auth-left"></div>

      <div className="auth-right">
        <div className="auth-box">

          {step === "login" && (
            <>
              <h2>Login</h2>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors((p) => ({ ...p, username: "" }));
                  }}
                />
                {errors.username && (
                  <span className="error" style={{ color: "white", marginBottom: "1rem" }}>{"*" + errors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input

                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((p) => ({ ...p, password: "" }));
                    }}
                  />

                  <span
                    className="password-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
                {errors.password && (
                  <span className="error" style={{ color: "white", marginBottom: "1rem" }}>{"*" + errors.password}</span>
                )}
              </div>

              <button onClick={handleLogin} disabled={loading}>
                {loading ? <span className="spinner"></span> : "Login"}
              </button>
            </>
          )}

          {step === "enable_mfa" && (
            <>
              <h2 className="secure-title">Secure Your Account</h2>

              <div className="success-banner">
                Login successful!
              </div>

              <p className="mfa-text">
                Enable Multi-Factor Authentication (MFA) for better security.
              </p>

              <button
                className="mfa-btn"
                onClick={enableMfa}
                disabled={loading}
              >
                {loading ? <span className="spinner"></span> : "Set up MFA now"}
              </button>

              <button className="skip-btn" onClick={handleSkip}>
                Skip for now
              </button>
            </>
          )}

          {step === "scan_qr" && (
            <>
              <h2>Set Up Two-Factor Authentication</h2>

              <img src={qr} alt="MFA QR Code" width="200" className="qr" />

              <div className="form-group">
                <label>Enter 6 digit OTP</label>
                <input
                  placeholder="123456"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setErrors((p) => ({ ...p, otp: "" }));
                  }}
                />
                {errors.otp && (
                  <span className="error">{errors.otp}</span>
                )}
              </div>

              <button onClick={verifyEnableMfa} disabled={loading}>
                {loading ? <span className="spinner"></span> : "Verify & Enable"}
              </button>

                 <button className="skip-btn " style={{background:"rgb(40, 167, 69)"}} onClick={handleSkip}>
                Skip For Now
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <h2>Enter OTP</h2>

              <div className="form-group">
                <label>6 digit code</label>
                <input
                  placeholder="123456"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ""));
                    setErrors((p) => ({ ...p, otp: "" }));
                  }}
                />
                {errors.otp && (
                  <span className="error">{"* " + errors.otp}</span>
                )}
              </div>

              <button onClick={verifyOtpLogin} disabled={loading}>
                {loading ? <span className="spinner"></span> : "Verify OTP"}
              </button>

              <button onClick={handleSkip}>
                Back To Login
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}