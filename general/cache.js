// Simple cache with TTL (in seconds)
const DEFAULT_TTL = 60;

export function getCache(key) {
  const cached = localStorage.getItem(`cache_${key}`);
  if (!cached) return null;

  const { data, expiry } = JSON.parse(cached);
  if (Date.now() > expiry) {
    localStorage.removeItem(`cache_${key}`);
    return null;
  }

  return data;
}

export function setCache(key, data, ttl = DEFAULT_TTL) {
  const expiry = Date.now() + ttl * 1000;
  localStorage.setItem(`cache_${key}`, JSON.stringify({ data, expiry }));
}

export function clearCache(key) {
  localStorage.removeItem(`cache_${key}`);
}
