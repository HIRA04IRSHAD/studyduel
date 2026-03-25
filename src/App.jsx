import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import TeamSetup from "./pages/TeamSetup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import DSATracker from "./pages/DSATracker";
import GATETracker from "./pages/GATETracker";
import Schedule from "./pages/Schedule";
import Resources from "./pages/Resources";
import Battle from "./pages/Battle";
import Sidebar from "./components/Sidebar";

function PrivateRoute({ children }) {
  const { user, teamId } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!teamId) return <Navigate to="/team-setup" />;
  return children;
}

function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ marginLeft: "180px", flex: 1, padding: "24px", minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/team-setup" element={<TeamSetup />} />
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/tasks" element={<PrivateRoute><Layout><Tasks /></Layout></PrivateRoute>} />
      <Route path="/dsa" element={<PrivateRoute><Layout><DSATracker /></Layout></PrivateRoute>} />
      <Route path="/gate" element={<PrivateRoute><Layout><GATETracker /></Layout></PrivateRoute>} />
      <Route path="/schedule" element={<PrivateRoute><Layout><Schedule /></Layout></PrivateRoute>} />
      <Route path="/resources" element={<PrivateRoute><Layout><Resources /></Layout></PrivateRoute>} />
      <Route path="/battle" element={<PrivateRoute><Layout><Battle /></Layout></PrivateRoute>} />
    </Routes>
  );
}