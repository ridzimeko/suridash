import { Routes as LibRoutes, Route } from "react-router"
import Dashboard from "../Pages/Dashboard"

export default function Routes() {
    return (
        <LibRoutes>
            <Route index element={<Dashboard />} />
        </LibRoutes>
    )
}