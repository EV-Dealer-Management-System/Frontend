import api from "../../../api/api";

let _cache = null;
let _fetchedAt = 0;
const TTL = 5 * 60 * 1000;

export async function fetchDepositSetting(force = false) {
  if (!force && _cache && Date.now() - _fetchedAt < TTL) {
    return _cache;
  }

  const res = await api.get("/DealerConfiguration/get-current");
  const data = res?.data?.data ?? null;

  _cache = data;
  _fetchedAt = Date.now();
  return data;
}

export function toRatio(raw) {
  if (typeof raw !== "number") return null;
  return raw / 100;
}
