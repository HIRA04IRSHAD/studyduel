import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/tasks", label: "Daily Tasks" },
  { to: "/dsa", label: "DSA Tracker" },
  { to: "/gate", label: "GATE Tracker" },
  { to: "/schedule", label: "Schedule" },
  { to: "/resources", label: "Resources" },
  { to: "/battle", label: "Battle" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <div style={{
      width: "180px",
      height: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
      background: "#111",
      borderRight: "0.5px solid #222",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 100,
    }}>
      <div style={{ padding: "16px 16px 14px", fontSize: "15px", fontWeight: "500", color: "#fff", borderBottom: "0.5px solid #222", flexShrink: 0 }}>
        Study<span style={{ color: "#1D9E75" }}>Duel</span>
      </div>

      <div style={{ flex: 1, paddingTop: "8px" }}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            style={({ isActive }) => ({
              display: "block",
              padding: "9px 16px",
              fontSize: "13px",
              color: isActive ? "#fff" : "#666",
              textDecoration: "none",
              background: isActive ? "#1a1a1a" : "transparent",
              borderRight: isActive ? "2px solid #1D9E75" : "2px solid transparent",
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div style={{ padding: "12px 16px", borderTop: "0.5px solid #222", flexShrink: 0 }}>
        <p style={{ fontSize: "11px", color: "#555", marginBottom: "8px", wordBreak: "break-all" }}>
          {user?.email}
        </p>
        <button
          onClick={handleLogout}
          style={{ fontSize: "12px", color: "#E24B4A", background: "none", border: "0.5px solid #333", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", width: "100%" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}