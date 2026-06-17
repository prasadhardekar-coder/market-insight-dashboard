import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { AppProvider } from "./lib/AppContext";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import CursorGlow from "./components/CursorGlow";
import Chatbot from "./components/Chatbot";
import Toasts from "./components/Toasts";
import CommandPalette from "./components/CommandPalette";
import AuthLanding from "./pages/AuthLanding";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Heatmap from "./pages/Heatmap";
import AIPredict from "./pages/AIPredict";
import Complaints from "./pages/Complaints";
import Analytics from "./pages/Analytics";
import Health from "./pages/Health";
import Playback from "./pages/Playback";
import Rankings from "./pages/Rankings";
import DigitalTwin from "./pages/DigitalTwin";
import Weather from "./pages/Weather";
import Anomalies from "./pages/Anomalies";
import AirportsCompare from "./pages/AirportsCompare";

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <CursorGlow />
          <CommandPalette />
          <Toasts />
          <Routes>
            {/* Public */}
            <Route path="/" element={<AuthLanding />} />

            {/* Protected app */}
            <Route path="/home" element={<Protected><Home /></Protected>} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/airports" element={<Protected><AirportsCompare /></Protected>} />
            <Route path="/heatmap" element={<Protected><Heatmap /></Protected>} />
            <Route path="/ai" element={<Protected><AIPredict /></Protected>} />
            <Route path="/complaints" element={<Protected><Complaints /></Protected>} />
            <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
            <Route path="/health" element={<Protected><Health /></Protected>} />
            <Route path="/playback" element={<Protected><Playback /></Protected>} />
            <Route path="/rankings" element={<Protected><Rankings /></Protected>} />
            <Route path="/twin" element={<Protected><DigitalTwin /></Protected>} />
          <Route path="/weather" element={<Protected><Weather /></Protected>} />
          <Route path="/anomalies" element={<Protected><Anomalies /></Protected>} />
        </Routes>
          <Chatbot />
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
}
