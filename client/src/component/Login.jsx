import React, { useState } from "react";
export default function Login({ setIslogin }) {
  const [see, setSee] = useState(false);
  return (
    <div className="accountform">
      <h1 className="teco">Login to CabMate</h1>
      <p style={{ color: "purple" }}>Sign in with Email</p>
      <label htmlFor="email" className="teco">
        E-mail:
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
        Login
      </button>
      <p style={{ color: "purple" }}>
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
  );
}
