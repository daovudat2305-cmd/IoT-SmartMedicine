import { Toaster } from "sonner"
import { BrowserRouter, Route, Routes } from "react-router"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import DataSensor from "./pages/DataSensor"
import ActionHistory from "./pages/ActionHistory"
import Profile from "./pages/Profile"

function App() {
  return (
    <>
      <Toaster/>

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/data-sensor" element={<DataSensor />} />
            <Route path="/action-history" element={<ActionHistory />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
