import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import BottomNavBar from "./components/BottomNavBar";
import ProfilePage from "./pages/ProfilePage";
import CallLogPage from "./pages/CallLogPage";
import SignUpPage from "./pages/SignUpPage";
import LogDetailPage from "./pages/LogDetailPage";

const AppContent = () => {
  const location = useLocation();
  const hideNav = location.pathname === "/";
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<SignUpPage />} />
        <Route path="/logs" element={<CallLogPage />} />
        <Route path="/logs/:id" element={<LogDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      {!hideNav && <BottomNavBar />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
