import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import Home from "./Components/Home";
import DashboardOne from "./components/dashboardone";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBot from "./components/ChatBot";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboardone"
            element={
              <ProtectedRoute>
                <DashboardOne />
              </ProtectedRoute>
            }
          />

          ✅ ADD THIS:
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatBot />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
