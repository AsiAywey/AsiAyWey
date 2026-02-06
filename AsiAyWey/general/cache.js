// simple cache in localStorage
const DEFAULT_TTL = 60;

// read from cache if not expired
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

// save in cache for a while
export function setCache(key, data, ttl = DEFAULT_TTL) {
  const expiry = Date.now() + ttl * 1000;
  localStorage.setItem(`cache_${key}`, JSON.stringify({ data, expiry }));
}

// clear a specific cache
export function clearCache(key) {
  localStorage.removeItem(`cache_${key}`);
}
