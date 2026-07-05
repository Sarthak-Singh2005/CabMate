import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
export default function Login({ setIslogin }) {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      console.log("data", data);
      if (res.ok) {
        localStorage.setItem("userId", data.user.id);
        window.dispatchEvent(new Event("cabmate-auth-change"));
        navigate("/rides");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
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
        navigate("/rides");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <form onSubmit={handleLogin}>
      <div className="accountform">
        <h1 className="teco">Login to CabMate</h1>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => {
            console.log("Google Login Failed");
          }}
        />
        <label htmlFor="email" className="teco1">
          E-mail:
        </label>
        <input
          type="email"
          id="email"
          className="teco1input"
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
        <p
          style={{ color: "#b181ff", marginBottom: "1rem", textAlign: "right" }}
        >
          <span
            onClick={() => navigate("/forgot-password")}
            style={{
              cursor: "pointer",
              color: "white",
              textDecoration: "underline",
              display: "inline",
            }}
          >
            Forgot Password?
          </span>
        </p>
        <button className="btnform" type="submit">
          Login
        </button>
        <p style={{ color: "#b181ff" }}>
          Don't have an account?{" "}
          <span
            onClick={() => setIslogin(false)}
            style={{
              cursor: "pointer",
              color: "white",
              textDecoration: "underline",
              display: "inline",
            }}
          >
            Sign Up
          </span>
        </p>
      </div>
    </form>
  );
}
