const API = "https://api.proinsight.com";

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");

  if (!refresh) return null;

  const res = await fetch(`${API}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  if (data?.access) {
    localStorage.setItem("access_token", data.access);
    return data.access;
  }

  return null;
}

export async function apiFetch(url, options = {}, retry = true) {
  let access = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (access) {
    headers["Authorization"] = `Bearer ${access}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  /* TOKEN EXPIRED */

  if (res.status === 401 && retry) {
    const newAccess = await refreshAccessToken();

    if (!newAccess) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.href = "/login";
      return;
    }

    return apiFetch(url, options, false);
  }

  return res;
}