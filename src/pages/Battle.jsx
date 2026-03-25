import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, push } from "firebase/database";
import { useAuth } from "../context/AuthContext";

export default function Battle() {
  const { user, teamId } = useAuth();
  const myId = user?.uid;
  const myName = user?.email?.split("@")[0];
  const [myTasks, setMyTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);
  const [myLC, setMyLC] = useState(0);
  const [otherLC, setOtherLC] = useState(0);
  const [otherName, setOtherName] = useState("Partner");
  const [taunts, setTaunts] = useState([]);

  const TAUNTS = ["Soja mat! 😴", "GG bhai 💀", "Kahan hai tu? 👀", "Main aage hoon 😎", "Uth ja yaar! ⚡"];

  useEffect(() => {
    if (!myId || !teamId) return;

    onValue(ref(db, `teams/${teamId}/tasks/${myId}`), snap => {
      const data = snap.val();
      if (data) setMyTasks(Object.values(data));
      else setMyTasks([]);
    });

    onValue(ref(db, `teams/${teamId}/tasks`), snap => {
      const data = snap.val();
      if (!data) return;
      const other = Object.entries(data).find(([uid]) => uid !== myId);
      if (other) {
        setOtherTasks(Object.values(other[1]));
        setOtherName(other[0].split("@")[0]);
      }
    });

    onValue(ref(db, `teams/${teamId}/dsa/${myId}/lc`), snap => setMyLC(snap.val() || 0));
    onValue(ref(db, `teams/${teamId}/dsa`), snap => {
      const data = snap.val();
      if (!data) return;
      const other = Object.entries(data).find(([uid]) => uid !== myId);
      if (other) setOtherLC(other[1].lc || 0);
    });

    onValue(ref(db, `teams/${teamId}/taunts`), snap => {
      const data = snap.val();
      if (data) setTaunts(Object.values(data).sort((a, b) => b.time - a.time).slice(0, 10));
    });

    onValue(ref(db, `teams/${teamId}/members`), snap => {
      const data = snap.val();
      if (!data) return;
      const other = Object.entries(data).find(([uid]) => uid !== myId);
      if (other) setOtherName(other[1].split("@")[0]);
    });
  }, [myId, teamId]);

  function sendTaunt(msg) {
    push(ref(db, `teams/${teamId}/taunts`), { from: myName, msg, time: Date.now() });
  }

  const today = new Date().toDateString();
  const myToday = myTasks.filter(t => t.date === today);
  const otherToday = otherTasks.filter(t => t.date === today);
  const myDone = myToday.filter(t => t.done).length;
  const otherDone = otherToday.filter(t => t.done).length;
  const myTotal = myTasks.filter(t => t.done).length;
  const otherTotal = otherTasks.filter(t => t.done).length;

  function StatRow({ label, myVal, otherVal }) {
    const total = myVal + otherVal || 1;
    const myPct = Math.round((myVal / total) * 100);
    return (
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "15px", fontWeight: "500", color: "#1D9E75", width: "32px", textAlign: "right" }}>{myVal}</span>
          <div style={{ flex: 1, height: "8px", borderRadius: "4px", background: "#222", overflow: "hidden", display: "flex" }}>
            <div style={{ width: `${myPct}%`, background: "#1D9E75", transition: "width 0.3s" }} />
            <div style={{ width: `${100 - myPct}%`, background: "#7F77DD" }} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: "500", color: "#7F77DD", width: "32px" }}>{otherVal}</span>
        </div>
      </div>
    );
  }

  const card = { background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "12px", padding: "16px 18px", marginBottom: "12px" };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "500", marginBottom: "4px" }}>Battle</h2>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>Head-to-head comparison</p>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <p style={{ fontSize: "13px", fontWeight: "500" }}>Today's duel</p>
          <span style={{ fontSize: "11px", color: "#555" }}>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>{myName}</p>
            <p style={{ fontSize: "42px", fontWeight: "500", color: "#1D9E75", lineHeight: 1 }}>{myDone}</p>
            <p style={{ fontSize: "10px", color: "#555" }}>/ {myToday.length} tasks</p>
          </div>
          <div style={{ fontSize: "16px", color: "#444" }}>vs</div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>{otherName}</p>
            <p style={{ fontSize: "42px", fontWeight: "500", color: "#7F77DD", lineHeight: 1 }}>{otherDone}</p>
            <p style={{ fontSize: "10px", color: "#555" }}>/ {otherToday.length} tasks</p>
          </div>
        </div>
        <div style={{ textAlign: "center", padding: "8px", background: "#111", borderRadius: "8px", fontSize: "12px", color: myDone > otherDone ? "#1D9E75" : myDone < otherDone ? "#7F77DD" : "#666" }}>
          {myDone > otherDone ? `${myName} is leading! 🔥` : myDone < otherDone ? `${otherName} is leading! 💪` : "It's a tie! ⚡"}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "16px" }}>
          <span style={{ color: "#1D9E75", fontWeight: "500" }}>{myName}</span>
          <span style={{ color: "#555", fontSize: "11px" }}>Overall stats</span>
          <span style={{ color: "#7F77DD", fontWeight: "500" }}>{otherName}</span>
        </div>
        <StatRow label="Total tasks done" myVal={myTotal} otherVal={otherTotal} />
        <StatRow label="LeetCode solved" myVal={myLC} otherVal={otherLC} />
        <StatRow label="Tasks done today" myVal={myDone} otherVal={otherDone} />
      </div>

      <div style={card}>
        <p style={{ fontSize: "13px", fontWeight: "500", marginBottom: "12px" }}>Taunt your partner 😈</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
          {TAUNTS.map(t => (
            <button key={t} onClick={() => sendTaunt(t)}
              style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "20px", border: "0.5px solid #333", background: "#111", color: "#ccc", cursor: "pointer" }}>
              {t}
            </button>
          ))}
        </div>
        {taunts.length === 0
          ? <p style={{ fontSize: "12px", color: "#555", fontStyle: "italic" }}>No taunts yet!</p>
          : taunts.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 0", borderBottom: "0.5px solid #222" }}>
              <span style={{ fontSize: "11px", fontWeight: "500", color: t.from === myName ? "#1D9E75" : "#7F77DD", width: "60px", flexShrink: 0 }}>{t.from}</span>
              <span style={{ fontSize: "12px", color: "#ccc", flex: 1 }}>{t.msg}</span>
              <span style={{ fontSize: "10px", color: "#444" }}>{new Date(t.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
  
}