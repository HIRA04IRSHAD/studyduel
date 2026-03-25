import { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo("");

    if (isSignup) {
      // Check username
      if (!username.trim()) { setError("Username required"); return; }
      if (username.length < 3) { setError("Username must be 3+ characters"); return; }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError("Username: only letters, numbers, underscore"); return; }

      // Check unique username
      const snap = await get(ref(db, `usernames/${username.toLowerCase()}`));
      if (snap.exists()) { setError("Username already taken — try another"); return; }

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Save username
        await set(ref(db, `usernames/${username.toLowerCase()}`), cred.user.uid);
        await set(ref(db, `users/${cred.user.uid}/username`), username);
        await set(ref(db, `users/${cred.user.uid}/email`), email);
        // Send verification email
        await sendEmailVerification(cred.user);
        setInfo("Verification email sent! Check your inbox and verify before logging in.");
        setEmail("");
setPassword("");
setUsername("");
      } catch (err) {
        setError(err.message);
      }

    } else {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) {
          setError("Email not verified yet. Check your inbox!");
          await auth.signOut();
          return;
        }
        navigate("/");
      } catch (err) {
        setError(err.message);
      }
    }
  }

  const inp = { width: "100%", padding: "10px 12px", marginBottom: "10px", background: "#111", border: "0.5px solid #333", borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f0f" }}>
      <div style={{ background: "#1a1a1a", border: "0.5px solid #333", borderRadius: "12px", padding: "32px", width: "340px" }}>
        <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "500", marginBottom: "6px" }}>
          Study<span style={{ color: "#1D9E75" }}>Duel</span>
        </h2>
        <p style={{ color: "#666", fontSize: "13px", marginBottom: "24px" }}>
          {isSignup ? "Create your account" : "Welcome back"}
        </p>

        {error && <p style={{ color: "#E24B4A", fontSize: "12px", marginBottom: "12px", background: "#2a1a1a", padding: "8px 12px", borderRadius: "6px" }}>{error}</p>}
        {info && <p style={{ color: "#1D9E75", fontSize: "12px", marginBottom: "12px", background: "#0d2a1a", padding: "8px 12px", borderRadius: "6px" }}>{info}</p>}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input
              type="text"
              placeholder="Username (e.g. rahul_gate)"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={inp}
            />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={inp} />
          <input type="password" placeholder="Password (6+ characters)" value={password} onChange={e => setPassword(e.target.value)} required style={inp} />
          <button type="submit" style={{ width: "100%", padding: "10px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", marginTop: "4px" }}>
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p style={{ color: "#666", fontSize: "12px", textAlign: "center", marginTop: "16px" }}>
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <span onClick={() => { setIsSignup(!isSignup); setError(""); setInfo(""); }} style={{ color: "#1D9E75", cursor: "pointer" }}>
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}