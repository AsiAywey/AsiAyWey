export async function getElement(url) {
  const res = await fetch(url);
  return await res.json();
}

export async function postElemet(url, object) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  });
  await res.json();
}

export async function postElemet(url, object) {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  });
  await res.json();
}

export async function postElemet(url) {
  const res = await fetch(url, {
    method: "DELETE",
  });
  await res.json();
}
