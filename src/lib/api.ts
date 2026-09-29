const STORAGE_KEY = "cri.leads.apiBase";
export const DEFAULT_API_BASE = "http://localhost:3000";

export function getApiBase(): string {
  if (typeof window === "undefined") return DEFAULT_API_BASE;
  return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE;
}

export function setApiBase(base: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, base.replace(/\/+$/, ""));
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBase().replace(/\/+$/, "");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Erro ${res.status} ao chamar ${path}`);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
