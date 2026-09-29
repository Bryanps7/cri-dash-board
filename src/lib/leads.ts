import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./api";

export type Lead = {
  id: string | number;
  name: string;
  phone: string;
  email: string;
  status: string;
  source: string;
  observation: string;
  createdAt: string | null;
  lastContactAt: string | null;
  raw: Record<string, unknown>;
};

type AnyRecord = Record<string, unknown>;

function pick(obj: AnyRecord, keys: string[]): unknown {
  for (const key of keys) {
    const found = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase());
    if (found && obj[found] !== null && obj[found] !== undefined && obj[found] !== "") {
      return obj[found];
    }
  }
  return undefined;
}

function str(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return "";
  return String(value);
}

export function normalizeLead(raw: AnyRecord): Lead {
  return {
    id: (pick(raw, ["id", "lead_id", "leadId", "_id"]) as string | number) ?? "",
    name: str(pick(raw, ["name", "nome", "fullName", "full_name", "cliente"])),
    phone: str(pick(raw, ["phone", "telefone", "celular", "whatsapp", "phoneNumber"])),
    email: str(pick(raw, ["email", "e_mail", "mail"])),
    status: str(pick(raw, ["status", "situacao", "stage", "etapa"])) || "sem status",
    source: str(pick(raw, ["source", "origem", "canal", "channel"])),
    observation: str(pick(raw, ["observation", "observacao", "observacoes", "obs", "notes"])),
    createdAt: str(pick(raw, ["createdAt", "created_at", "criadoEm", "data"])) || null,
    lastContactAt:
      str(
        pick(raw, [
          "lastContactAt",
          "last_contact_at",
          "lastContact",
          "ultimoContato",
          "contactedAt",
        ]),
      ) || null,
    raw,
  };
}

function extractArray(payload: unknown): AnyRecord[] {
  if (Array.isArray(payload)) return payload as AnyRecord[];
  if (payload && typeof payload === "object") {
    const obj = payload as AnyRecord;
    for (const key of ["data", "leads", "items", "results", "rows"]) {
      if (Array.isArray(obj[key])) return obj[key] as AnyRecord[];
    }
  }
  return [];
}

export type StatusCount = { status: string; count: number };

export function normalizeStatusCounts(payload: unknown): StatusCount[] {
  const arr = extractArray(payload);
  if (arr.length) {
    return arr.map((item) => ({
      status: str(pick(item, ["status", "situacao", "stage", "name", "label"])) || "sem status",
      count: Number(pick(item, ["count", "quantity", "quantidade", "total", "qtd"]) ?? 0),
    }));
  }
  if (payload && typeof payload === "object") {
    return Object.entries(payload as AnyRecord)
      .filter(([, v]) => typeof v === "number" || typeof v === "string")
      .map(([k, v]) => ({ status: k, count: Number(v) || 0 }));
  }
  return [];
}

export function useLeads(params: { status?: string; search?: string; stale?: boolean } = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.stale) query.set("stale", "true");
  const qs = query.toString();

  return useQuery({
    queryKey: ["leads", params],
    queryFn: async () => extractArray(await apiFetch<unknown>(`/leads${qs ? `?${qs}` : ""}`)).map(normalizeLead),
    refetchInterval: 60_000,
    retry: 1,
  });
}

export function useStatusCounts() {
  return useQuery({
    queryKey: ["leads", "quantityStatus"],
    queryFn: async () => normalizeStatusCounts(await apiFetch<unknown>("/leads/quantityStatus")),
    refetchInterval: 60_000,
    retry: 1,
  });
}

export function useUpdateObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, observation }: { id: string | number; observation: string }) =>
      apiFetch(`/leads/${id}`, {
        method: "PUT",
        body: JSON.stringify({ observation }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useRegisterContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) =>
      apiFetch(`/leads/${id}/contact`, { method: "PATCH", body: JSON.stringify({}) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
