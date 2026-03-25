import { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, push, remove } from "firebase/database";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["DSA", "GATE", "YouTube", "Articles", "Other"];
const catColors = {
  DSA:      { bg: "#0d1f33", color: "#4da3ff" },
  GATE:     { bg: "#2a1a00", color: "#f0a500" },
  YouTube:  { bg: "#2a0d0d", color: "#ff6b6b" },
  Articles: { bg: "#0d2a1a", color: "#1D9E75" },
  Other:    { bg: "#1a1a2a", color: "#9090ff" },
};

export default function Resources() {
  const { user, teamId } = useAuth();
  const myId = user?.uid;
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("DSA");
  const [filterCat, setFilterCat] = useState("All");

  useEffect(() => {
    if (!teamId) return;
    onValue(ref(db, `teams/${teamId}/resources`), snap => {
      const data = snap.val();
      if (!data) { setResources([]); return; }
      const all = Object.entries(data).flatMap(([uid, items]) =>
        Object.entries(items).map(([id, v]) => ({ id, uid, ...v }))
      );
      setResources(all);
    });
  }, [teamId]);

  function addResource() {
    if (!title.trim() || !url.trim()) return;
    const link = url.startsWith("http") ? url : "https://" + url;
    push(ref(db, `teams/${teamId}/resources/${myId}`), {
      title, url: link, category,
      addedBy: user?.email?.split("@")[0],
    });
    setTitle(""); setUrl("");
  }

  function deleteResource(id, uid) {
    if (uid !== myId) return;
    remove(ref(db, `teams/${teamId}/resources/${myId}/${id}`));
  }

  const filtered = filterCat === "All" ? resources : resources.filter(r => r.category === filterCat);
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(r => r.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  const card = { background: "#1a1a1a", border: "0.5px solid #2a2a2a", borderRadius: "12px", padding: "16px 18px", marginBottom: "12px" };
  const inp = { fontSize: "12px", padding: "7px 10px", border: "0.5px solid #333", borderRadius: "8px", background: "#111", color: "#fff", outline: "none" };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "500", marginBottom: "4px" }}>Resources</h2>
      <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>Saved links — both users can add</p>

      <div style={card}>
        <p style={{ fontSize: "13px", fontWeight: "500", marginBottom: "12px" }}>Add resource</p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input style={{ ...inp, flex: 2, minWidth: "150px" }} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <input style={{ ...inp, flex: 2, minWidth: "150px" }} placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && addResource()} />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inp, minWidth: "100px" }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={addResource} style={{ fontSize: "12px", background: "#1D9E75", color: "#fff", border: "none", padding: "7px 16px", borderRadius: "8px", cursor: "pointer" }}>+ Add</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
        {["All", ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "20px", cursor: "pointer", border: "0.5px solid #333", background: filterCat === c ? "#1D9E75" : "#111", color: filterCat === c ? "#fff" : "#666" }}>
            {c}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 && <p style={{ fontSize: "13px", color: "#555", fontStyle: "italic" }}>No resources yet — add one!</p>}

      {Object.entries(grouped).map(([cat, items]) => {
        const cc = catColors[cat] || catColors.Other;
        return (
          <div key={cat} style={card}>
            <p style={{ fontSize: "12px", fontWeight: "500", color: cc.color, marginBottom: "10px" }}>{cat}</p>
            {items.map(r => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: "0.5px solid #222" }}>
                <div style={{ flex: 1 }}>
                  <a href={r.url} target="_blank" rel="noreferrer"
                    style={{ fontSize: "13px", color: "#ccc", textDecoration: "none" }}>{r.title}</a>
                  <p style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>
                    {r.url.replace("https://", "").split("/")[0]} · added by {r.addedBy}
                  </p>
                </div>
                {r.uid === myId && (
                  <button onClick={() => deleteResource(r.id, r.uid)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "16px" }}>×</button>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}