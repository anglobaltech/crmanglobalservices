const API = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("crm_token");

  // console.log("TOKEN SENT:", token); 

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const getCustomers = async () => {
  const res = await fetch(`${API}/api/customers`, { headers: getAuthHeaders() });
  return res.json();
};

export const addCustomer = async (data) => {
  const res = await fetch(`${API}/api/customers`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

// Add this default export (allocate-leads page uses this) 
const request = async (method, url, body = null, options = {}) => {
  const params = options.params
    ? "?" + new URLSearchParams(options.params)
    : "";

  const res = await fetch(`${API}${url}${params}`, {
    method,
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) throw { response: { data }, status: res.status };
  return { data };
};

const api = {
  get:    (url, options) => request("GET",    url, null, options),
  post:   (url, body)    => request("POST",   url, body),
  put:    (url, body)    => request("PUT",    url, body),
  patch:  (url, body)    => request("PATCH",  url, body),
  delete: (url)          => request("DELETE", url),
};

export default api;