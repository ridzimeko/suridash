import ky from "ky";

const IPINFO_TOKEN = process.env.IPINFO_TOKEN!;

export async function fetchGeoIP(ip: string) {
  try {
    const res = await ky
      .get(`https://get.geojs.io/v1/ip/geo/${ip}.json`, {
        timeout: 5000,
        retry: 2,
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${IPINFO_TOKEN}`,
        }
      })
      .json<any>();

    return res;
  } catch (err: any) {
    console.error("GeoIP lookup error:", err.message);
    return null;
  }
}
