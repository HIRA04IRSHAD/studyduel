import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, get } from "firebase/database";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [teamId, setTeamId] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const teamSnap = await get(ref(db, `users/${u.uid}/teamId`));
        if (teamSnap.val()) setTeamId(teamSnap.val());
        else setTeamId(null);

        const nameSnap = await get(ref(db, `users/${u.uid}/username`));
        if (nameSnap.val()) setUsername(nameSnap.val());
        else setUsername(u.email?.split("@")[0]);
      } else {
        setTeamId(null);
        setUsername(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, teamId, setTeamId, username }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}