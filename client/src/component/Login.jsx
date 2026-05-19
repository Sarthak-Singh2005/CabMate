import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
export default function Login({ setIslogin }) {
  const [see, setSee] = useState(false);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const Navigate = useNavigate();
  const handleLogin=async(e)=>{
    e.preventDefault();
    try{
      const res = await fetch("http://localhost:5000/api/auth/login",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        }, 
        body:JSON.stringify({email,password}),
        credentials:"include",
      });
      const data = await res.json();
      console.log("DataLogin",data);
      Navigate("/rides");
    }catch(err){
      console.log(err);
    }
  }
  return (
    <form onSubmit={handleLogin}>
    <div className="accountform">
     
      <h1 className="teco">Login to CabMate</h1>
      <p style={{ color: "purple" }}>Sign in with Email</p>
      <label htmlFor="email" className="teco">
        E-mail:
      </label>
      <input type="email" id="email" placeholder="Enter Your Email" onChange={(e)=>setEmail(e.target.value)} />
      <label htmlFor="password" className="teco">
        Password
      </label>
      <div className="passwordBox">
        <input
          onChange={(e)=>setPassword(e.target.value)}
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
    </form>
  );
}
