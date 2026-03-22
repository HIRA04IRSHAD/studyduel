import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, set, push } from "firebase/database";
import { useAuth } from "../context/AuthContext";

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [otherTasks, setOtherTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [tag, setTag] = useState("DSA");

  const myId = user?.uid;
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;

  useEffect(() => {
    if (!myId) return;
    const r = ref(db, `tasks/${myId}`);
    onValue(r, (snap) => {
      const data = snap.val();
      if (data) setTasks(Object.entries(data).map(([id, v]) => ({ id, ...v })));
      else setTasks([]);
    });

    const allRef = ref(db, "tasks");
    onValue(allRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      const others = Object.entries(data)
        .filter(([uid]) => uid !== myId)
        .flatMap(([, userTasks]) =>
          Object.values(userTasks)
        );
      setOtherTasks(others);
    });
  }, [myId]);

  function addTask() {
    if (!newTask.trim()) return;
    push(ref(db, `tasks/${myId}`), {
      text: newTask,
      tag,
      done: false,
      date: new Date().toDateString(),
    });
    setNewTask("");
  }

  function toggleTask(id, done) {
    set(ref(db, `tasks/${myId}/${id}/done`), !done);
  }

  function deleteTask(id) {
    set(ref(db, `tasks/${myId}/${id}`), null);
  }

  const todayTasks = tasks.filter(t => t.date === new Date().toDateString());
  const doneTodayCount = todayTasks.filter(t => t.done).length;
  const otherDoneCount = otherTasks.filter(t => t.done && t.date === new Date().toDateString()).length;
  const otherTotalCount = otherTasks.filter(t => t.date === new Date().toDateString()).length;

  const tagColors = {
    DSA: { bg: "#0d1f33", color: "#4da3ff", border: "#1a3a5c" },
    GATE: { bg: "#2a1a00", color: "#f0a500", border: "#4a3000" },
    Math: { bg: "#0d2a1a", color: "#1D9E75", border: "#1a4a2a" },
    Other: { bg: "#1a1a2a", color: "#9090ff", border: "#2a2a4a" },
  };

  const card = { background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "12px", padding: "16px 18px", marginBottom: "12px" };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "500", marginBottom: "4px" }}>Daily Tasks</h2>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
        {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      {/* Streak Row */}
      <div style={card}>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>This week</p>
        <div style={{ display: "flex", gap: "6px" }}>
          {days.map((d, i) => (
            <div key={i} style={{
              width: "28px", height: "28px", borderRadius: "6px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: "500",
              background: i < adjustedToday ? "#1D9E75" : i === adjustedToday ? "transparent" : "#111",
              color: i < adjustedToday ? "#fff" : i === adjustedToday ? "#1D9E75" : "#444",
              border: i === adjustedToday ? "1.5px solid #1D9E75" : "none",
            }}>{d}</div>
          ))}
        </div>
      </div>

      {/* Score */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
        <div style={card}>
          <p style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>Your tasks today</p>
          <p style={{ fontSize: "22px", fontWeight: "500" }}>{doneTodayCount} <span style={{ fontSize: "14px", color: "#555" }}>/ {todayTasks.length}</span></p>
        </div>
        <div style={card}>
          <p style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>Partner's tasks</p>
          <p style={{ fontSize: "22px", fontWeight: "500", color: "#7F77DD" }}>{otherDoneCount} <span style={{ fontSize: "14px", color: "#555" }}>/ {otherTotalCount}</span></p>
        </div>
      </div>

      {/* Add Task */}
      <div style={card}>
        <p style={{ fontSize: "13px", fontWeight: "500", marginBottom: "12px" }}>My tasks</p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          <input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTask()}
            placeholder="Add a task..."
            style={{ flex: 1, minWidth: "160px", fontSize: "12px", padding: "7px 10px", border: "0.5px solid #333", borderRadius: "8px", background: "#111", color: "#fff", outline: "none" }}
          />
          <select
            value={tag}
            onChange={e => setTag(e.target.value)}
            style={{ fontSize: "12px", padding: "7px 10px", border: "0.5px solid #333", borderRadius: "8px", background: "#111", color: "#fff", outline: "none" }}
          >
            <option>DSA</option>
            <option>GATE</option>
            <option>Math</option>
            <option>Other</option>
          </select>
          <button onClick={addTask} style={{ fontSize: "12px", background: "#1D9E75", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "8px", cursor: "pointer" }}>
            + Add
          </button>
        </div>

        {todayTasks.length === 0 && <p style={{ fontSize: "13px", color: "#555", fontStyle: "italic" }}>No tasks yet — add one!</p>}

        {todayTasks.map(task => {
          const tc = tagColors[task.tag] || tagColors.Other;
          return (
            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "0.5px solid #222" }}>
              <div
                onClick={() => toggleTask(task.id, task.done)}
                style={{
                  width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0, cursor: "pointer",
                  background: task.done ? "#1D9E75" : "transparent",
                  border: task.done ? "none" : "1.5px solid #444",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                {task.done && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.5" fill="none" /></svg>}
              </div>
              <p style={{ flex: 1, fontSize: "13px", color: task.done ? "#555" : "#fff", textDecoration: task.done ? "line-through" : "none" }}>
                {task.text}
              </p>
              <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: tc.bg, color: tc.color, border: `0.5px solid ${tc.border}` }}>
                {task.tag}
              </span>
              <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "16px" }}>×</button>
            </div>
          );
        })}
      </div>

      {/* Partner tasks preview */}
      <div style={{ ...card, opacity: 0.8 }}>
        <p style={{ fontSize: "13px", fontWeight: "500", marginBottom: "8px" }}>Partner's progress today</p>
        {otherTotalCount === 0
          ? <p style={{ fontSize: "13px", color: "#555", fontStyle: "italic" }}>Partner hasn't added tasks yet</p>
          : <div style={{ background: "#111", borderRadius: "8px", padding: "10px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666", marginBottom: "6px" }}>
                <span>Tasks done</span>
                <span style={{ color: "#7F77DD" }}>{otherDoneCount} / {otherTotalCount}</span>
              </div>
              <div style={{ height: "6px", borderRadius: "3px", background: "#222", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${otherTotalCount ? (otherDoneCount / otherTotalCount) * 100 : 0}%`, background: "#7F77DD", borderRadius: "3px" }} />
              </div>
            </div>
        }
      </div>
    </div>
  );
}