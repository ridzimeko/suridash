import { Outlet } from "react-router";

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
