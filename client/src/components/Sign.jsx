import { useState } from "react";
import { API_BASE_URL } from "../config/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
export default function Sign({ setIslogin }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ phone: phone.trim(), password, name, gender }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("userId", data.user.id);
        window.dispatchEvent(new Event("cabmate-auth-change"));
        toast.success(data.message || "Registration successful");
        navigate("/rides");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <div className="accountform">
        <h1 className="teco">Create Account</h1>
        <div className="auth-field">
          <label htmlFor="name" className="teco1">
            Name <span className="required-star" aria-hidden="true">*</span>
          </label>
          <input
            className="teco1input"
            type="text"
            id="name"
            required
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Your Name"
          />
        </div>
        <div className="auth-field">
          <label htmlFor="tel" className="teco1">
            Mobile Number <span className="required-star" aria-hidden="true">*</span>
          </label>
          <input
            className="teco1input"
            type="tel"
            id="tel"
            required
            maxLength={10}
            pattern="[0-9]{10}"
            inputMode="numeric"
            value={phone}
            placeholder="Enter your Mobile Number"
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
          />
        </div>
        <div className="auth-field">
          <label htmlFor="gender" className="teco1">
            Gender <span className="required-star" aria-hidden="true">*</span>
          </label>
          <select
            className="teco1input"
            id="gender"
            value={gender}
            required
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Choose Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="auth-field">
          <label htmlFor="password" className="teco1">
            Password <span className="required-star" aria-hidden="true">*</span>
          </label>
          <input
            className="teco1input"
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            id="password"
            required
            placeholder="Enter Your Password"
          />
        </div>
        <button className="btnform" disabled={loading} type="submit">
          {loading ? "Creating..." : "Create Account"}
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
