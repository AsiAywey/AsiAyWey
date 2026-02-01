export async function getElement(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error fetching ${url}: ${res.status}`);
  return await res.json();
}

export async function postElement(url, object) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(object),
  });
  return await res.json();
}

export async function putElement(url, object) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(object),
  });
  return await res.json();
}

export async function deleteElement(url) {
  const res = await fetch(url, { method: "DELETE" });
  return await res.json();
}
