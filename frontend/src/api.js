const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("invoice_token");
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    const data = contentType.includes("json") ? await response.json() : {};
    throw new Error(data.message || "Request failed.");
  }
  return contentType.includes("json") ? response.json() : response.blob();
}

export { API_URL };
