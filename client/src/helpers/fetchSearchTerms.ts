import {API_BASE} from "../utils/api.ts";

export async function fetchSearchTerms(token: string): Promise<string[]> {
  if (!token) {
    // no token → nothing to do
    return [];
  }

  try {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("search-terms fetch failed:", res.status, res.statusText);
      // swallow the error so React-Query does not go into permanent error state
      return [];
    }

    const json = await res.json();
    // make sure we always return an array
    return Array.isArray(json.searchTerms) ? json.searchTerms : [];
  } catch (err) {
    console.error("Error fetching search-terms:", err);
    return [];
  }
}