import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { useAuth } from "../context/AuthContext";

const GATE_SUBJECTS = [
  "Operating Systems", "DBMS", "Computer Networks", "COA",
  "Discrete Mathematics", "TOC", "Algorithms", "Data Structures",
  "Digital Logic", "Compiler Design",
];

export default function GATETracker() {
  const { user, teamId } = useAuth();
  const myId = user?.uid;
  const [myProgress, setMyProgress] = useState({});
  const [otherProgress, setOtherProgress] = useState({});
  const [myTargets, setMyTargets] = useState([]);
  const [otherTargets, setOtherTargets] = useState([]);
  const [newTarget, setNewTarget] = useState("");

  useEffect(() => {
    if (!myId || !teamId) return;
    onValue(ref(db, `teams/${teamId}/gate/${myId}/subjects`), snap => setMyProgress(snap.val() || {}));
    onValue(ref(db, `teams/${teamId}/gate/${myId}/targets`), snap => {
      const data = snap.val();
      if (data) setMyTargets(Object.entries(data).map(([id, v]) => ({ id, ...v })));
      else setMyTargets([]);
    });
    onValue(ref(db, `teams/${teamId}/gate`), snap => {
      const data = snap.val();
      if (!data) return;
      const other = Object.entries(data).find(([uid]) => uid !== myId);
      if (other) {
        setOtherProgress(other[1].subjects || {});
        const t = other[1].targets;
        if (t) setOtherTargets(Object.values(t));
        else setOtherTargets([]);
      }
    });
  }, [myId, teamId]);

  function updateSubject(subject, delta) {
    const next = Math.max(0, (myProgress[subject] || 0) + delta);
    set(ref(db, `teams/${teamId}/gate/${myId}/subjects/${subject}`), next);
  }

  function addTarget() {
    if (!newTarget.trim()) return;
    push(ref(db, `teams/${teamId}/gate/${myId}/targets`), { text: newTarget, done: false });
    setNewTarget("");
  }

  function toggleTarget(id, done) {
    set(ref(db, `teams/${teamId}/gate/${myId}/targets/${id}/done`), !done);
  }

  function deleteTarget(id) {
    remove(ref(db, `teams/${teamId}/gate/${myId}/targets/${id}`));
  }

  const card = { background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "12px", padding: "16px 18px", marginBottom: "12px" };
  const btn = { width: "26px", height: "26px", borderRadius: "6px", border: "0.5px solid #333", background: "#111", color: "#fff", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "500", marginBottom: "4px" }}>GATE Tracker</h2>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>Subject-wise progress + weekly targets</p>

      <div style={card}>
        <p style={{ fontSize: "13px", fontWeight: "500", marginBottom: "14px" }}>Subject progress</p>
        <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#666" }}>
            <div style={{ width: "10px", height: "4px", borderRadius: "2px", background: "#1D9E75" }} /> You
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#666" }}>
            <div style={{ width: "10px", height: "4px", borderRadius: "2px", background: "#7F77DD" }} /> Partner
          </div>
        </div>
        {GATE_SUBJECTS.map(subject => {
          const myVal = myProgress[subject] || 0;
          const otherVal = otherProgress[subject] || 0;
          return (
            <div key={subject} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "0.5px solid #222" }}>
              <p style={{ fontSize: "13px", color: "#ccc", width: "180px", flexShrink: 0 }}>{subject}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button style={btn} onClick={() => updateSubject(subject, -1)}>−</button>
                <span style={{ fontSize: "15px", fontWeight: "500", color: "#1D9E75", minWidth: "28px", textAlign: "center" }}>{myVal}</span>
                <button style={btn} onClick={() => updateSubject(subject, 1)}>+</button>
              </div>
              <div style={{ marginLeft: "auto", fontSize: "13px", color: "#7F77DD", fontWeight: "500" }}>{otherVal}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={card}>
          <p style={{ fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>My targets this week</p>
          <p style={{ fontSize: "11px", color: "#555", marginBottom: "12px" }}>{myTargets.filter(t => t.done).length}/{myTargets.length} done</p>
          {myTargets.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 0", borderBottom: "0.5px solid #222" }}>
              <div onClick={() => toggleTarget(t.id, t.done)}
                style={{ width: "15px", height: "15px", borderRadius: "4px", flexShrink: 0, cursor: "pointer", background: t.done ? "#1D9E75" : "transparent", border: t.done ? "none" : "1.5px solid #444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {t.done && <svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1.5,4.5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.5" fill="none" /></svg>}
              </div>
              <p style={{ flex: 1, fontSize: "12px", color: t.done ? "#555" : "#ccc", textDecoration: t.done ? "line-through" : "none" }}>{t.text}</p>
              <button onClick={() => deleteTarget(t.id)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "14px" }}>×</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
            <input value={newTarget} onChange={e => setNewTarget(e.target.value)} onKeyDown={e => e.key === "Enter" && addTarget()} placeholder="Add target..."
              style={{ flex: 1, fontSize: "12px", padding: "6px 8px", border: "0.5px solid #333", borderRadius: "8px", background: "#111", color: "#fff", outline: "none" }} />
            <button onClick={addTarget} style={{ fontSize: "12px", background: "#1D9E75", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "8px", cursor: "pointer" }}>+</button>
          </div>
        </div>

        <div style={{ ...card, opacity: 0.85 }}>
          <p style={{ fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>Partner's targets</p>
          <p style={{ fontSize: "11px", color: "#555", marginBottom: "12px" }}>{otherTargets.filter(t => t.done).length}/{otherTargets.length} done</p>
          {otherTargets.length === 0
            ? <p style={{ fontSize: "12px", color: "#555", fontStyle: "italic" }}>No targets yet</p>
            : otherTargets.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 0", borderBottom: "0.5px solid #222" }}>
                <div style={{ width: "15px", height: "15px", borderRadius: "4px", flexShrink: 0, background: t.done ? "#7F77DD" : "transparent", border: t.done ? "none" : "1.5px solid #444", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {t.done && <svg width="9" height="9" viewBox="0 0 9 9"><polyline points="1.5,4.5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.5" fill="none" /></svg>}
                </div>
                <p style={{ flex: 1, fontSize: "12px", color: t.done ? "#555" : "#ccc", textDecoration: t.done ? "line-through" : "none" }}>{t.text}</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}