import "../index.css";
import Login from "./Login";
import Sign from "./Sign";
import Info from "./Info";
import { useState } from "react";
export default function Account() {
  const [isLogin, setIslogin] = useState(true);
  return (
    <div className="home-page">
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
            <div className="account-page">
              {isLogin ? (
                <Login setIslogin={setIslogin} />
              ) : (
                <Sign setIslogin={setIslogin} />
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
