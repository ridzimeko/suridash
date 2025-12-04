import ky from "ky";

const IPINFO_TOKEN = process.env.IPINFO_TOKEN!;

export async function fetchGeoIP(ip: string) {
  try {
    const res = await ky
      .get(`https://ipinfo.io/${ip}`, {
        timeout: 5000,
        retry: 2,
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${IPINFO_TOKEN}`,
        }
      })
      .json<any>();

    // ipinfo returns: { city, region, country, loc: "lat,lon", org, timezone }
    let latitude = null;
    let longitude = null;

    if (res.loc) {
      const [lat, lon] = res.loc.split(",");
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    }

    return {
      ip,
      country: res.country ?? null,
      city: res.city ?? null,
      region: res.region ?? null,
      latitude,
      longitude,
      org: res.org ?? null,
      timezone: res.timezone ?? null,
    };
  } catch (err) {
    console.error("GeoIP lookup error:", err);
    return null;
  }
}
