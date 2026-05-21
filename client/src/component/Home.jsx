import React from "react";
import "../index.css";
import Navbar from "./Navbar";
import Account from "./Account";
import Info from "./Info";
export default function Home() {
  return (
    <div className="home-page">
      <Navbar />
      <main className="home-main">
        <section className="home-hero">
          <Info />
        </section>
        <aside className="home-panel">
          <div className="panel-card">
            <div className="panel-heading">
              <p className="panel-eyebrow">Welcome to CabMate</p>
              <p className="panel-description">
                Sign in or register to share and discover ride matches quickly.
              </p>
            </div>
            <Account />
          </div>
        </aside>
      </main>
    </div>
  );
}
