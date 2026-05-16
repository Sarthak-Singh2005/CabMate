import React from "react";
import "../index.css";
import Navbar from "./Navbar";
import Account from "./Account";
import Info from "./Info";
export default function Home() {
  return (
    <div className="home">
      <Navbar />
      <div className="home-content">
        <Info />
        <Account />
      </div>
    </div>
  );
}
