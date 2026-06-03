const BASE = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getRoles = async () => {
  const res = await fetch(`${BASE}/api/roles`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
};

export const getRoleById = async (id) => {
  const res = await fetch(`${BASE}/api/roles/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch role");
  return res.json();
};

export const createRole = async (data) => {
  const res = await fetch(`${BASE}/api/roles`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

export const updateRole = async (id, data) => {
  const res = await fetch(`${BASE}/api/roles/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json;
};

export const seedRoles = async () => {
  const res = await fetch(`${BASE}/api/roles/seed`, {
    method: "POST",
    headers: getHeaders(),
  });
  return res.json();
};