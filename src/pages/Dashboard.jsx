import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, set } from "firebase/database";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, teamId } = useAuth();
  const [exams, setExams] = useState([]);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");

  useEffect(() => {
    if (!teamId) return;
    const r = ref(db, `teams/${teamId}/exams`);
    onValue(r, (snap) => {
      const data = snap.val();
      if (data) setExams(Object.values(data));
      else setExams([]);
    });
  }, [teamId]);

  function daysLeft(dateStr) {
    const today = new Date(); today.setHours(0,0,0,0);
    return Math.ceil((new Date(dateStr) - today) / 86400000);
  }

  function addExam() {
    if (!examName || !examDate) return;
    const id = Date.now();
    set(ref(db, `teams/${teamId}/exams/${id}`), { id, name: examName, date: examDate });
    setExamName(""); setExamDate("");
  }

  function removeExam(id) {
    set(ref(db, `teams/${teamId}/exams/${id}`), null);
  }

  const card = { background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "12px", padding: "16px 18px", marginBottom: "12px" };
  const inp = { fontSize: "12px", padding: "7px 10px", border: "0.5px solid #333", borderRadius: "8px", background: "#111", color: "#fff", outline: "none" };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "500", marginBottom: "4px" }}>Dashboard</h2>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
        Welcome, {user?.email?.split("@")[0]}
      </p>
      <p style={{ fontSize: "11px", color: "#444", marginBottom: "20px" }}>
        Team code: <span style={{ color: "#1D9E75", letterSpacing: "2px", fontWeight: "500" }}>{teamId}</span>
      </p>

      <div style={card}>
        <p style={{ fontSize: "13px", fontWeight: "500", marginBottom: "12px" }}>Exam Countdowns</p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          <input style={{ ...inp, width: "140px" }} placeholder="Exam name" value={examName} onChange={e => setExamName(e.target.value)} />
          <input style={{ ...inp, width: "150px" }} type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
          <button onClick={addExam} style={{ fontSize: "12px", background: "#1D9E75", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "8px", cursor: "pointer" }}>
            + Add
          </button>
        </div>

        {exams.length === 0 && <p style={{ fontSize: "13px", color: "#555", fontStyle: "italic" }}>No exams added yet</p>}

        {[...exams].sort((a, b) => new Date(a.date) - new Date(b.date)).map(ex => {
          const d = daysLeft(ex.date);
          const color = d < 0 ? "#555" : d <= 30 ? "#D85A30" : d <= 90 ? "#BA7517" : "#1D9E75";
          return (
            <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#111", borderRadius: "8px", marginBottom: "8px", border: "0.5px solid #222" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "500" }}>{ex.name}</p>
                <p style={{ fontSize: "11px", color: "#555" }}>{new Date(ex.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "26px", fontWeight: "500", color, lineHeight: 1 }}>{d < 0 ? "—" : d}</p>
                <p style={{ fontSize: "10px", color: "#555" }}>{d < 0 ? "passed" : d === 0 ? "today!" : "days left"}</p>
              </div>
              <button onClick={() => removeExam(ex.id)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "16px", marginLeft: "12px" }}>×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}