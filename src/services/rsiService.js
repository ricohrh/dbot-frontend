import { apiRequest } from './api';

export async function fetchTopRSI(limit = 50, period = 14, resolution = '1m', klineLimit = 120) {
const params = new URLSearchParams({ limit, period, resolution, kline_limit: klineLimit }).toString();
const res = await apiRequest(`/bluechip/top-rsi?${params}`);
return Array.isArray(res?.data) ? res.data : [];
}
