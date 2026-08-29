import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Archive, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DeleteArchivedApplicationButton,
  RestoreApplicationButton,
  type ArchiveActionApplication,
} from "@/components/admin/ApplicationArchiveActions";
import { listArchivedApplications } from "@/lib/admin-archives.functions";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/admin.functions";
import { STATUS_LABEL_FR, STATUS_TONE } from "@/lib/status";

type ArchivedApplication = ArchiveActionApplication & {
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  program: string;
  amount: number;
  currency: string;
  created_at: string;
  archived_at: string;
  archived_by?: string | null;
};

const PROGRAM_LABELS: Record<string, string> = {
  personal: "Prêt personnel",
  professional: "Prêt professionnel",
  business: "Prêt entreprise",
  housing: "Prêt travaux et habitat",
  studies: "Prêt études",
  project: "Prêt projet",
  retired: "Prêt retraité",
};

function programLabel(program: string) {
  return PROGRAM_LABELS[program] ?? program;
}

function statusLabel(status: string) {
  return STATUS_LABEL_FR[status as ApplicationStatus] ?? status.replaceAll("_", " ");
}

function statusTone(status: string) {
  return STATUS_TONE[status as ApplicationStatus] ?? "bg-muted text-muted-foreground";
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

const PAGE_SIZE = 25;

export function ArchivedApplicationsPanel({ onOpenDetail }: { onOpenDetail: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const archivesQ = useQuery({
    queryKey: ["admin", "archives"],
    queryFn: () => listArchivedApplications() as Promise<ArchivedApplication[]>,
    refetchInterval: 30_000,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (archivesQ.data ?? []).filter((application) => {
      if (statusFilter !== "all" && application.status !== statusFilter) return false;
      if (!q) return true;
      return [
        application.reference,
        application.first_name,
        application.last_name,
        application.email,
        programLabel(application.program),
      ].some((value) => String(value ?? "").toLowerCase().includes(q));
    });
  }, [archivesQ.data, query, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return (
    <section className="surface-card mt-7 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Dossiers archivés</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Les archives restent consultables et restaurables. La suppression définitive n’est disponible qu’ici.
          </p>
        </div>
        <Badge variant="outline">{archivesQ.data?.length ?? 0} archive(s)</Badge>
      </div>

      <div className="flex flex-wrap gap-3 border-b border-border p-4">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Référence, nom, e-mail, solution…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {APPLICATION_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>{statusLabel(status)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Demandeur</th>
              <th className="px-4 py-3">Solution</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Création</th>
              <th className="px-4 py-3">Archivage</th>
              <th className="px-4 py-3">Archivé par</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {archivesQ.isPending ? (
              <tr><td colSpan={9} className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
            ) : pageRows.length === 0 ? (
              <tr><td colSpan={9} className="py-12 text-center text-muted-foreground">Aucun dossier archivé trouvé.</td></tr>
            ) : pageRows.map((application) => (
              <tr key={application.id} className="hover:bg-muted/25">
                <td className="px-4 py-3 font-mono text-xs">{application.reference}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{application.first_name} {application.last_name}</p>
                  <p className="text-xs text-muted-foreground">{application.email}</p>
                </td>
                <td className="px-4 py-3">{programLabel(application.program)}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatAmount(application.amount, application.currency)}</td>
                <td className="px-4 py-3"><Badge className={`border-0 ${statusTone(application.status)}`}>{statusLabel(application.status)}</Badge></td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{new Date(application.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{new Date(application.archived_at).toLocaleString("fr-FR")}</td>
                <td className="px-4 py-3 text-muted-foreground">{application.archived_by ? "Administrateur" : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => onOpenDetail(application.id)}>Ouvrir</Button>
                    <RestoreApplicationButton application={application} />
                    <DeleteArchivedApplicationButton application={application} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 border-t border-border p-4">
          <p className="text-xs text-muted-foreground">
            Page {page} sur {pageCount} · {filtered.length} dossier(s)
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
              Suivant <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
