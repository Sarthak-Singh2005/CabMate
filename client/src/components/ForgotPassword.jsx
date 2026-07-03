import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus("Please enter your email address.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(data.message || "If this email is registered, a reset link will be sent.");
      } else {
        setStatus(data.message || "Email not registered");
      }
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus("Server error. Please try again later.");
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="accountform">
        <h1 className="teco">Forgot Password</h1>
        <p style={{ color: "#b181ff" }}>
          Enter your email address and we&apos;ll send password reset
          instructions.
        </p>
        <label htmlFor="reset-email" className="teco1">
          E-mail:
        </label>
        <input
          id="reset-email"
          type="email"
          className="teco1input"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btnform" type="submit" onClick={handleSubmit}>
          Send Reset Link
        </button>
        {status && (
          <p style={{ color: "#ffffff", marginTop: "1rem" }}>{status}</p>
        )}
        <p style={{ color: "#b181ff", marginTop: "1.5rem" }}>
          Remembered your password?{" "}
          <span
            onClick={() => navigate("/")}
            style={{
              cursor: "pointer",
              color: "white",
              textDecoration: "underline",
              display: "inline",
            }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
