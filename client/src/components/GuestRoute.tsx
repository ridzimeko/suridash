import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // jika user sudah login, lempar balik ke /
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
