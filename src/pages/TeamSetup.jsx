import { useState } from "react";
import { db } from "../firebase";
import { ref, get, set } from "firebase/database";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function TeamSetup() {
  const { user, setTeamId } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createTeam() {
    setLoading(true);
    setError("");
    const code = generateCode();
    const teamRef = ref(db, `teams/${code}`);
    const snap = await get(teamRef);
    if (snap.exists()) { createTeam(); return; }

    await set(ref(db, `teams/${code}/members/${user.uid}`), user.email);
    await set(ref(db, `users/${user.uid}/teamId`), code);
    setTeamId(code);
    navigate("/");
    setLoading(false);
  }

  async function joinTeam() {
    setLoading(true);
    setError("");
    const code = joinCode.toUpperCase().trim();
    if (code.length !== 6) { setError("Invalid code — must be 6 characters"); setLoading(false); return; }

    const snap = await get(ref(db, `teams/${code}`));
    if (!snap.exists()) { setError("Team not found — check the code"); setLoading(false); return; }

    const members = snap.val().members || {};
    if (Object.keys(members).length >= 2) { setError("Team is full — max 2 members"); setLoading(false); return; }

    await set(ref(db, `teams/${code}/members/${user.uid}`), user.email);
    await set(ref(db, `users/${user.uid}/teamId`), code);
    setTeamId(code);
    navigate("/");
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f0f" }}>
      <div style={{ background: "#1a1a1a", border: "0.5px solid #333", borderRadius: "12px", padding: "32px", width: "360px" }}>
        <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "500", marginBottom: "6px" }}>
          Study<span style={{ color: "#1D9E75" }}>Duel</span>
        </h2>
        <p style={{ color: "#666", fontSize: "13px", marginBottom: "28px" }}>
          Create a team or join your partner
        </p>

        {error && (
          <p style={{ color: "#E24B4A", fontSize: "12px", marginBottom: "14px", background: "#2a1a1a", padding: "8px 12px", borderRadius: "6px" }}>
            {error}
          </p>
        )}

        {/* Create */}
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "13px", fontWeight: "500", color: "#ccc", marginBottom: "8px" }}>New team</p>
          <p style={{ fontSize: "12px", color: "#555", marginBottom: "10px" }}>Generate a code and share with your partner</p>
          <button
            onClick={createTeam}
            disabled={loading}
            style={{ width: "100%", padding: "10px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}
          >
            Create Team
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <div style={{ flex: 1, height: "0.5px", background: "#333" }} />
          <span style={{ fontSize: "12px", color: "#555" }}>or</span>
          <div style={{ flex: 1, height: "0.5px", background: "#333" }} />
        </div>

        {/* Join */}
        <div>
          <p style={{ fontSize: "13px", fontWeight: "500", color: "#ccc", marginBottom: "8px" }}>Join existing team</p>
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && joinTeam()}
            placeholder="Enter 6-digit code"
            maxLength={6}
            style={{ width: "100%", padding: "10px 12px", marginBottom: "10px", background: "#111", border: "0.5px solid #333", borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none", letterSpacing: "4px", textAlign: "center" }}
          />
          <button
            onClick={joinTeam}
            disabled={loading}
            style={{ width: "100%", padding: "10px", background: "transparent", color: "#1D9E75", border: "0.5px solid #1D9E75", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}
          >
            Join Team
          </button>
        </div>

        <p style={{ fontSize: "11px", color: "#444", textAlign: "center", marginTop: "20px" }}>
          Logged in as {user?.email}
        </p>
      </div>
    </div>
  );
}