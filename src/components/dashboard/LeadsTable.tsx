import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime, formatPhone, useLeads, whatsappUrl } from "@/lib/leads";
import { StatusBadge } from "./StatusBadge";
import { ObservationDialog } from "./ObservationDialog";

export function LeadsTable({ statuses }: { statuses: string[] }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, error } = useLeads({ status, search, stale });
  const leads = useMemo(() => data ?? [], [data]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail"
            maxLength={100}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {statuses.map((item) => (
              <SelectItem key={item} value={item} className="capitalize">
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
          <Switch id="stale" checked={stale} onCheckedChange={setStale} />
          <Label htmlFor="stale" className="text-sm text-muted-foreground">
            Só parados
          </Label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-panel)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Lead</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Imóvel de interesse</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Último contato</TableHead>
              <TableHead className="min-w-56">Observação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  Carregando leads...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-destructive">
                  {(error as Error).message}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !isError &&
              leads.map((lead) => (
                <TableRow key={String(lead.id)}>
                  <TableCell className="font-medium">{lead.name || "—"}</TableCell>
                  <TableCell>
                    {lead.phone ? (
                      <a
                        href={whatsappUrl(lead.phone)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-success hover:underline"
                      >
                        {formatPhone(lead.phone)}
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-64 text-muted-foreground">
                    {lead.propertyOfInterest || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.source || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(lead.lastContactAt)}
                  </TableCell>
                  <TableCell className="max-w-72 truncate text-muted-foreground">
                    {lead.observation || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <ObservationDialog lead={lead} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && !isError && leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  Nenhum lead encontrado com esses filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
