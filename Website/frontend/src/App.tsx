import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataSensor from "./pages/DataSensor";
import ActionHistory from "./pages/ActionHistory";
import Profile from "./pages/Profile";
import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Redirect "/" về dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Các trang có layout */}
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route
            path="/data-sensor"
            element={
              <MainLayout>
                <DataSensor />
              </MainLayout>
            }
          />
          <Route
            path="/action-history"
            element={
              <MainLayout>
                <ActionHistory />
              </MainLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <MainLayout>
                <Profile />
              </MainLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
