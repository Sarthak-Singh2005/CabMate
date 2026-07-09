import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import toast from "react-hot-toast";

export default function Login({ setIslogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          password,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("userId", data.user.id);
        window.dispatchEvent(new Event("cabmate-auth-change"));
        toast.success(data.message || "Login successful");
        navigate("/rides");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Unable to connect to the server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="accountform">
        <h1 className="teco">Login to CabMate</h1>
        
        <div className="auth-field">
          <label htmlFor="phone" className="teco1">
            Mobile Number{" "}
            <span className="required-star" aria-hidden="true">
              *
            </span>
          </label>
          <input
            type="tel"
            required
            id="phone"
            maxLength={10}
            placeholder=" eg 9876543211"
            className="teco1input"
            pattern="[0-9]{10}"
            inputMode="numeric"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
          />
        </div>
        <div className="auth-field">
          <label htmlFor="password" className="teco1">
            Password{" "}
            <span className="required-star" aria-hidden="true">
              *
            </span>
          </label>
          <input
            className="teco1input"
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            id="password"
            placeholder="Enter your password"
            required
            value={password}
          />
        </div>
        <button className="btnform" disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
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
            Register
          </span>
        </p>
      </div>
    </form>
  );
}
