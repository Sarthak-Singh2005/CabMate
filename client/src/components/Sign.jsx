import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

import { API_BASE_URL } from "../config/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
export default function Sign({ setIslogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Registration successful");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userId", data.user.id);
        window.dispatchEvent(new Event("cabmate-auth-change"));
        toast.success(data.message || "Login successful");
        navigate("/rides");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <form onSubmit={handleRegister}>
      <div className="accountform">
        <h1 className="teco">Create Account</h1>
        <p style={{ color: "#b181ff" }}>Join CabMate</p>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => {
            console.error("Google Login Failed");
          }}
        />
        <label htmlFor="name" className="teco1">
          Full Name
        </label>
        <input
          className="teco1input"
          type="text"
          id="name"
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Your Name"
        />
        <label htmlFor="email" className="teco1">
          Email
        </label>
        <input
          className="teco1input"
          type="email"
          id="email"
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password" className="teco1">
          Password
        </label>
        <input
          className="teco1input"
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          id="password"
          placeholder="Enter Your Password"
        />
        <button className="btnform" type="submit">
          Sign Up
        </button>
        <p style={{ color: "#b181ff" }}>
          Already have an account?{" "}
          <span
            onClick={() => setIslogin(true)}
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
    </form>
  );
}
