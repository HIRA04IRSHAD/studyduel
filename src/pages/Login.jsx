import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f0f" }}>
      <div style={{ background: "#1a1a1a", border: "0.5px solid #333", borderRadius: "12px", padding: "32px", width: "340px" }}>
        <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "500", marginBottom: "6px" }}>
          Study<span style={{ color: "#1D9E75" }}>Duel</span>
        </h2>
        <p style={{ color: "#666", fontSize: "13px", marginBottom: "24px" }}>
          {isSignup ? "Create your account" : "Welcome back"}
        </p>

        {error && (
          <p style={{ color: "#E24B4A", fontSize: "12px", marginBottom: "12px", background: "#2a1a1a", padding: "8px 12px", borderRadius: "6px" }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px 12px", marginBottom: "10px", background: "#111", border: "0.5px solid #333", borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px 12px", marginBottom: "16px", background: "#111", border: "0.5px solid #333", borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none" }}
          />
          <button
            type="submit"
            style={{ width: "100%", padding: "10px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p style={{ color: "#666", fontSize: "12px", textAlign: "center", marginTop: "16px" }}>
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <span
            onClick={() => setIsSignup(!isSignup)}
            style={{ color: "#1D9E75", cursor: "pointer" }}
          >
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}