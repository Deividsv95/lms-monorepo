const DEFAULT_API_BASE =
  typeof window !== "undefined" && window.location
    ? window.location.protocol === "file:" ||
      ["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname)
      ? "http://127.0.0.1:8000"
      : window.location.origin
    : "http://127.0.0.1:8000";

export function getApiBase() {
  return String(window.API_BASE || DEFAULT_API_BASE).trim().replace(/\/+$/, "");
}

function normalizePath(path) {
  return path.endsWith("/") ? path : `${path}/`;
}

function formatApiError(data) {
  if (typeof data === "string") {
    const trimmed = data.trim();
    return trimmed || "Request failed";
  }

  if (data && typeof data === "object") {
    return data.message || data.detail || "Request failed";
  }

  return "Request failed";
}

export async function apiRequest(path, options = {}, { authToken } = {}) {
  const headers = new Headers(options.headers || {});
  const requestOptions = { method: options.method || "GET", headers };

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestOptions.body =
      typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  }

  const response = await fetch(`${getApiBase()}${normalizePath(path)}`, requestOptions);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    throw new Error(formatApiError(data));
  }

  return data;
}
