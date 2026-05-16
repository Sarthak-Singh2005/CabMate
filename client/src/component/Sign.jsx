import React, { useState } from "react";
export default function Sign({ setIslogin }) {
  const [see, setSee] = useState(false);
  return (
    <div className="accountform">
      <h1 className="teco">Create Account</h1>
      <p style={{ color: "purple" }}>Join CabMate</p>
      <label htmlFor="name" className="teco">
        Full Name
      </label>
      <input type="text" id="name" placeholder="Enter Your Name" />
      <label htmlFor="email" className="teco">
        Email
      </label>
      <input type="email" id="email" placeholder="Enter Your Email" />

      <label htmlFor="password" className="teco">
        Password
      </label>
      <div className="passwordBox">
        <input
          type={see ? "text" : "password"}
          id="password"
          placeholder="Enter Your Password "
        />
        {see ? (
          <button type="button" className="icon" onClick={() => setSee(false)}>
            👁️
          </button>
        ) : (
          <button type="button" className="icon" onClick={() => setSee(true)}>
            🙈
          </button>
        )}
      </div>
      <button className="btnform" type="submit">
        Sign Up
      </button>
      <p style={{ color: "purple" }}>
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
  );
}
