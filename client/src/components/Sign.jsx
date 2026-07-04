import React, { useState } from "react";
export default function Sign({ setIslogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
        credentials: "include",
      });
      const data = await res.json();
      console.log("register data", data);
      if (res.ok) {
        alert("Registration Successful");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <form onSubmit={handleRegister}>
      <div className="accountform">
        <h1 className="teco">Create Account</h1>
        <p style={{ color: "#b181ff" }}>Join CabMate</p>
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
