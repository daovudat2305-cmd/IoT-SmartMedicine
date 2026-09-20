import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataSensor from "./pages/DataSensor";
import ActionHistory from "./pages/ActionHistory";
import Profile from "./pages/Profile";
import MainLayout from "./components/layout/MainLayout";
import { AuthProvider } from "./context";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        closeButton
        richColors
        toastOptions={{
          classNames: {
            closeButton: "!left-auto !right-0 !translate-x-[35%]",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Redirect "/" về dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/data-sensor" element={<DataSensor />} />
              <Route path="/action-history" element={<ActionHistory />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
