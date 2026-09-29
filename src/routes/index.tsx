import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
} from "recharts";
import { ArrowDown, Flame, Users, AlertTriangle, BadgeCheck } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { ApiSettings } from "@/components/dashboard/ApiSettings";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { StatusBadge, statusColorVar } from "@/components/dashboard/StatusBadge";
import {
  formatDateTime,
  formatPhone,
  useLeads,
  useOriginCounts,
  useStatusCounts,
  whatsappUrl,
} from "@/lib/leads";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel de Leads | CRI Soluções Imobiliárias" },
      {
        name: "description",
        content:
          "Painel de acompanhamento de leads da CRI Soluções Imobiliárias: resumo por status, gráfico e tabela completa com busca e filtros.",
      },
      { property: "og:title", content: "Painel de Leads | CRI Soluções Imobiliárias" },
      {
        property: "og:description",
        content: "Acompanhe em tempo real os leads da CRI por status, origem e último contato.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Kpi({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  tone?: "default" | "brand" | "warn";
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-[image:var(--gradient-panel)] px-5 py-4 shadow-[var(--shadow-panel)]">
      <div
        className={
          tone === "brand"
            ? "rounded-lg bg-primary/15 p-3 text-primary"
            : tone === "warn"
              ? "rounded-lg bg-destructive/15 p-3 text-destructive"
              : "rounded-lg bg-secondary p-3 text-foreground"
        }
      >
        <Icon className="size-6" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: counts } = useStatusCounts();
  const { data: originCounts } = useOriginCounts();
  const { data: allLeads, isError, error } = useLeads();
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setCurrentTime(formatDateTime(new Date().toISOString()));
    const refreshTimer = window.setTimeout(() => window.location.reload(), 60_000);
    return () => window.clearTimeout(refreshTimer);
  }, []);

  const leads = useMemo(() => allLeads ?? [], [allLeads]);

  const statusData = useMemo(() => {
    if (counts && counts.length) return counts;
    const map = new Map<string, number>();
    for (const lead of leads) map.set(lead.status, (map.get(lead.status) ?? 0) + 1);
    return [...map.entries()].map(([status, count]) => ({ status, count }));
  }, [counts, leads]);

  const total = statusData.reduce((sum, item) => sum + item.count, 0) || leads.length;

  const now = Date.now();
  const newToday = leads.filter((lead) => {
    if (!lead.createdAt) return false;
    const date = new Date(lead.createdAt);
    return !Number.isNaN(date.getTime()) && now - date.getTime() < 86_400_000;
  }).length;

  const staleLeads = leads.filter((lead) => {
    const ref = lead.lastContactAt ?? lead.createdAt;
    if (!ref) return false;
    const date = new Date(ref);
    return !Number.isNaN(date.getTime()) && now - date.getTime() > 3 * 86_400_000;
  }).length;

  const sourceData = useMemo(() => {
    if (originCounts && originCounts.length) {
      return originCounts
        .map(({ status, count }) => ({ name: status, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 7);
    }
    const map = new Map<string, number>();
    for (const lead of leads) {
      const key = lead.source || "Sem origem";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [originCounts, leads]);

  const recent = [...leads]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 6);
  const statuses = statusData.map((item) => item.status);
  const qualified = statusData.find((item) => item.status.toLowerCase() === "qualificado")?.count ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />

      {/* TV view: fits a 1200x900 fullscreen display */}
      <section className="flex min-h-screen flex-col gap-5 px-8 py-6">
        <header className="-mx-8 -mt-6 flex min-h-22 flex-wrap items-center justify-between gap-4 border-b border-header-border bg-header px-8 py-4 text-header-foreground shadow-[var(--shadow-header)]">
          <div className="flex min-w-0 items-center gap-5">
            <span className="text-4xl font-extrabold tracking-normal text-primary" aria-label="CRI">
              CRI
            </span>
            <div className="hidden h-9 w-px bg-header-border sm:block" />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold leading-tight">Painel de Leads</h1>
              <p className="truncate text-xs text-header-muted">
                CRI Soluções Imobiliárias · atualização automática a cada minuto
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentTime && <span className="hidden text-sm font-medium text-header-muted sm:inline">{currentTime}</span>}
            <ApiSettings />
          </div>
        </header>

        {isError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Não foi possível falar com o servidor de leads ({(error as Error).message}). Confira se
            ele está rodando e ajuste o endereço em “Servidor”.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi label="Total de leads" value={total} icon={Users} tone="brand" />
          <Kpi label="Entraram hoje" value={newToday} icon={Flame} />
          <Kpi label="Sem contato há 3+ dias" value={staleLeads} icon={AlertTriangle} tone="warn" />
          <Kpi label="Leads qualificados" value={qualified} icon={BadgeCheck} />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-panel)] lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Leads por status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="status"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--secondary)" }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {statusData.map((item) => (
                      <Cell key={item.status} fill={statusColorVar(item.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusData.map((item) => (
                <StatusBadge key={item.status} status={`${item.status} · ${item.count}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-panel)]">
              <h2 className="mb-2 text-lg font-semibold">Origem dos leads</h2>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={62}
                      paddingAngle={3}
                    >
                      {sourceData.map((item) => (
                        <Cell key={item.name} fill={statusColorVar(item.name)} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        color: "var(--popover-foreground)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex-1 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-panel)]">
              <h2 className="mb-3 text-lg font-semibold">Últimos leads</h2>
              <ul className="space-y-2">
                {recent.map((lead) => (
                  <li
                    key={String(lead.id)}
                    className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-0"
                  >
                    <div className="min-w-0">
                      {lead.phone ? (
                        <a
                          href={whatsappUrl(lead.phone)}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-sm font-medium hover:text-success hover:underline"
                        >
                          {lead.name || "Sem nome"}
                        </a>
                      ) : (
                        <p className="truncate text-sm font-medium">{lead.name || "Sem nome"}</p>
                      )}
                      <p className="truncate text-xs text-muted-foreground">
                        {formatPhone(lead.phone)} · Último contato: {formatDateTime(lead.lastContactAt)}
                      </p>
                    </div>
                    <StatusBadge status={lead.status} />
                  </li>
                ))}
                {recent.length === 0 && (
                  <li className="text-sm text-muted-foreground">Nenhum lead cadastrado ainda.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ArrowDown className="size-3.5" />
          Role para ver a lista completa de leads
        </p>
      </section>

      <section className="space-y-4 border-t border-border bg-background px-8 py-10">
        <div>
          <h2 className="text-xl font-bold">Todos os leads</h2>
          <p className="text-sm text-muted-foreground">
            Busque, filtre por status e registre observações.
          </p>
        </div>
        <LeadsTable statuses={statuses} />
      </section>
    </div>
  );
}
