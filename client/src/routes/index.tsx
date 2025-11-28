import { Routes as LibRoutes, Route } from "react-router"
import Dashboard from "../pages/Dashboard"
import LoginPage from "../pages/Login"

export default function Routes() {
    return (
        <LibRoutes>
            <Route index element={<Dashboard />} />
            <Route path="/login" element={<LoginPage />} />
        </LibRoutes>
    )
}