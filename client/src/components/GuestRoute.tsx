import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function GuestRoute() {

  // // jika user sudah login, lempar balik ke /
  // if (user && !loading) {
  //   return <Navigate to="/" replace />;
  // }

  return <>
  <p>aaa</p>
    <Outlet />
  </>;
}
