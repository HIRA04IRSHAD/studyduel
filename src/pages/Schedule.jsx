import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, set } from "firebase/database";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMES = ["College", "6–8 PM", "8–10 PM", "10–11 PM"];

const DEFAULT_SCHEDULE = {
  "College":  ["9:30–1:30", "8:50–4:50", "9:30–1:30", "9:30–1:30", "Free", "9:30–1:30"],
  "6–8 PM":   ["DSA + LC", "Rest", "DSA + LC", "GATE Subj", "DSA + LC", "GATE Subj"],
  "8–10 PM":  ["GATE Subj", "GATE Subj", "Math/Apt", "DSA + LC", "GATE Subj", "Math/Apt"],
  "10–11 PM": ["Revision", "Revision", "Revision", "Revision", "Revision", "Revision"],
};

function getColor(val) {
  if (!val) return { bg: "#111", color: "#555" };
  const v = val.toLowerCase();
  if (v.includes("dsa") || v.includes("lc")) return { bg: "#0d1f33", color: "#4da3ff" };
  if (v.includes("gate") || v.includes("subj")) return { bg: "#2a1a00", color: "#f0a500" };
  if (v.includes("math") || v.includes("apt") || v.includes("rev")) return { bg: "#0d2a1a", color: "#1D9E75" };
  if (v.includes("college") || v.includes(":")) return { bg: "#2a0d1a", color: "#ff6b9d" };
  if (v.includes("rest") || v.includes("free")) return { bg: "#1a1a1a", color: "#555" };
  return { bg: "#1a1a2a", color: "#9090ff" };
}

export default function Schedule() {
  const { user, teamId } = useAuth();
  const myId = user?.uid;
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!myId || !teamId) return;
    onValue(ref(db, `teams/${teamId}/schedule/${myId}`), snap => {
      const data = snap.val();
      if (data) setSchedule(data);
      else set(ref(db, `teams/${teamId}/schedule/${myId}`), DEFAULT_SCHEDULE);
    });
  }, [myId, teamId]);

  function updateCell(row, col, val) {
    const updated = { ...schedule, [row]: [...(schedule[row] || [])] };
    updated[row][col] = val;
    setSchedule(updated);
    set(ref(db, `teams/${teamId}/schedule/${myId}/${row}/${col}`), val);
  }

  const card = { background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "12px", padding: "16px 18px", marginBottom: "12px" };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "500", marginBottom: "4px" }}>Schedule</h2>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>Your personal weekly timetable</p>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <p style={{ fontSize: "13px", fontWeight: "500" }}>Weekly timetable</p>
          <button onClick={() => setEditMode(!editMode)}
            style={{ fontSize: "12px", padding: "5px 14px", borderRadius: "8px", cursor: "pointer", border: "0.5px solid #333", background: editMode ? "#1D9E75" : "#111", color: editMode ? "#fff" : "#999" }}>
            {editMode ? "Done" : "Edit"}
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "72px repeat(6, 1fr)", gap: "5px", minWidth: "600px" }}>
            <div />
            {DAYS.map(d => <div key={d} style={{ fontSize: "11px", fontWeight: "500", color: "#666", textAlign: "center", padding: "4px 0" }}>{d}</div>)}
            {TIMES.map(row => (
              <>
                <div key={row} style={{ fontSize: "10px", color: "#555", display: "flex", alignItems: "center" }}>{row}</div>
                {DAYS.map((_, col) => {
                  const val = schedule[row]?.[col] || "";
                  const c = getColor(val);
                  return (
                    <div key={col} style={{ minHeight: "42px", borderRadius: "6px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                      {editMode && row !== "College"
                        ? <input defaultValue={val} onBlur={e => updateCell(row, col, e.target.value)}
                            style={{ width: "100%", fontSize: "10px", background: "transparent", border: "none", color: c.color, outline: "none", textAlign: "center" }} />
                        : <span style={{ fontSize: "10px", color: c.color, textAlign: "center", fontWeight: "500" }}>{val || "—"}</span>
                      }
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}