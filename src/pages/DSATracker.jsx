import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, set } from "firebase/database";
import { useAuth } from "../context/AuthContext";

const DSA_TOPICS = [
  "Arrays & Strings", "Linked Lists", "Stacks & Queues",
  "Trees", "Graphs", "Dynamic Programming",
  "Greedy", "Backtracking", "Binary Search",
  "Heap / Priority Queue", "Hashing", "Two Pointers",
];

export default function DSATracker() {
  const { user } = useAuth();
  const myId = user?.uid;
  const [myProgress, setMyProgress] = useState({});
  const [otherProgress, setOtherProgress] = useState({});
  const [myLC, setMyLC] = useState(0);
  const [otherLC, setOtherLC] = useState(0);

  useEffect(() => {
    if (!myId) return;

    onValue(ref(db, `dsa/${myId}/topics`), snap => {
      setMyProgress(snap.val() || {});
    });

    onValue(ref(db, `dsa/${myId}/lc`), snap => {
      setMyLC(snap.val() || 0);
    });

    onValue(ref(db, "dsa"), snap => {
      const data = snap.val();
      if (!data) return;
      const otherEntry = Object.entries(data).find(([uid]) => uid !== myId);
      if (otherEntry) {
        setOtherProgress(otherEntry[1].topics || {});
        setOtherLC(otherEntry[1].lc || 0);
      }
    });
  }, [myId]);

  function updateCount(topic, delta) {
    const current = myProgress[topic] || 0;
    const next = Math.max(0, current + delta);
    set(ref(db, `dsa/${myId}/topics/${topic}`), next);
  }

  function updateLC(val) {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 0) set(ref(db, `dsa/${myId}/lc`), n);
  }

  const myTotal = Object.values(myProgress).reduce((a, b) => a + b, 0);
  const otherTotal = Object.values(otherProgress).reduce((a, b) => a + b, 0);

  const card = { background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "12px", padding: "16px 18px", marginBottom: "12px" };
  const btn = { width: "26px", height: "26px", borderRadius: "6px", border: "0.5px solid #333", background: "#111", color: "#fff", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "500", marginBottom: "4px" }}>DSA Tracker</h2>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>Topic-wise problem count — you vs partner</p>

      {/* LC Counter */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
        <div style={card}>
          <p style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>Your LeetCode solved</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="number" value={myLC}
              onChange={e => updateLC(e.target.value)}
              style={{ width: "80px", fontSize: "22px", fontWeight: "500", background: "transparent", border: "none", color: "#1D9E75", outline: "none" }}
            />
            <span style={{ fontSize: "12px", color: "#555" }}>problems</span>
          </div>
        </div>
        <div style={card}>
          <p style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>Partner's LeetCode</p>
          <p style={{ fontSize: "22px", fontWeight: "500", color: "#7F77DD" }}>
            {otherLC} <span style={{ fontSize: "12px", color: "#555" }}>problems</span>
          </p>
        </div>
      </div>

      {/* Total */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
        <div style={card}>
          <p style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>Your total (topic problems)</p>
          <p style={{ fontSize: "26px", fontWeight: "500", color: "#1D9E75" }}>{myTotal}</p>
        </div>
        <div style={card}>
          <p style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>Partner's total</p>
          <p style={{ fontSize: "26px", fontWeight: "500", color: "#7F77DD" }}>{otherTotal}</p>
        </div>
      </div>

      {/* Topics */}
      <div style={card}>
        <p style={{ fontSize: "13px", fontWeight: "500", marginBottom: "14px" }}>Topic problem count</p>
        <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#666" }}>
            <div style={{ width: "10px", height: "4px", borderRadius: "2px", background: "#1D9E75" }} /> You
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#666" }}>
            <div style={{ width: "10px", height: "4px", borderRadius: "2px", background: "#7F77DD" }} /> Partner
          </div>
        </div>

        {DSA_TOPICS.map(topic => {
          const myVal = myProgress[topic] || 0;
          const otherVal = otherProgress[topic] || 0;
          return (
            <div key={topic} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "0.5px solid #222" }}>
              <p style={{ fontSize: "13px", color: "#ccc", width: "160px", flexShrink: 0 }}>{topic}</p>

              {/* My count */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button style={btn} onClick={() => updateCount(topic, -1)}>−</button>
                <span style={{ fontSize: "15px", fontWeight: "500", color: "#1D9E75", minWidth: "28px", textAlign: "center" }}>{myVal}</span>
                <button style={btn} onClick={() => updateCount(topic, 1)}>+</button>
              </div>

              {/* Partner count */}
              <div style={{ marginLeft: "auto", fontSize: "13px", color: "#7F77DD", fontWeight: "500" }}>
                {otherVal}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}