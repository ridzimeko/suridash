import ky from "ky";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API || ""; // ganti sesuai backend kamu

export const api = ky.create({
  prefixUrl: BASE_URL_API, // backend Hono kamu
  credentials: "include",  // wajib biar cookie session dikirim
  headers: {
    "Content-Type": "application/json",
  },
});