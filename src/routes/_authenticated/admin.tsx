import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  Archive,
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  EyeOff,
  FileClock,
  FileText,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArchivedApplicationsPanel } from "@/components/admin/ArchivedApplicationsPanel";
import {
  ApplicationArchiveControls,
  ArchiveApplicationButton,
} from "@/components/admin/ApplicationArchiveActions";
import { supabase } from "@/integrations/supabase/client";
import {
  APPLICATION_STATUSES,
  createAdminSignedUrl,
  getApplicationAdminDetail,
  getCurrentAdmin,
  updateApplicationStatus,
  type ApplicationStatus,
} from "@/lib/admin.functions";
import {
  getArchiveCount,
  listActiveApplications,
} from "@/lib/admin-archives.functions";
import { STATUS_LABEL_FR, STATUS_TONE } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminPage });

type JsonRecord = Record<string, unknown>;

type Application = {
  id: string;
  reference: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  country_of_residence?: string | null;
  nationality?: string | null;
  address: string;
  birth_date: string;
  employment_status?: string | null;
  employment_details?: JsonRecord | null;
  income?: number | null;
  other_income?: number | null;
  monthly_charges?: number | null;
  program: string;
  amount: number;
  currency: string;
  duration_months?: number | null;
  purpose?: string | null;
  processing_speed?: string | null;
  processing_fee?: number | null;
  documents?: unknown;
  contract_path?: string | null;
  admin_note?: string | null;
  public_message?: string | null;
  missing_public_requirements?: string | null;
  archived_at?: string | null;
  archived_by?: string | null;
  created_at: string;
};

type AdminDetail = {
  application: Application;
  bank: {
    bank_name: string;
    account_holder_name: string;
    iban_account_number: string;
    swift_bic: string | null;
  } | null;
  history: Array<{
    id: string;
    status: string;
    public_message: string | null;
    created_at: string;
    created_by: string | null;
  }>;
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

const EMPLOYMENT_LABELS: Record<string, string> = {
  employee: "Salarié",
  self_employed: "Indépendant",
  business_owner: "Chef d’entreprise",
  retired: "Retraité",
  other: "Autre",
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

function maskIban(value: string) {
  const compact = value.replace(/\s+/g, "");
  return `**** **** **** ${compact.slice(-4) || "****"}`;
}

function parseDocuments(value: unknown): Array<{ key?: string; filename?: string; path?: string }> {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is { key?: string; filename?: string; path?: string } =>
    Boolean(item && typeof item === "object"),
  );
}

function startOfDay(value = new Date()) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [adminView, setAdminView] = useState<"active" | "archives">("active");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showBank, setShowBank] = useState(false);
  const [publicMessage, setPublicMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [missingRequirements, setMissingRequirements] = useState("");

  const meQ = useQuery({ queryKey: ["admin", "me"], queryFn: () => getCurrentAdmin() });
  const isAdmin = meQ.data?.isAdmin ?? false;

  const appsQ = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: () => listActiveApplications() as Promise<Application[]>,
    enabled: isAdmin,
    refetchInterval: 30_000,
  });

  const archiveCountQ = useQuery({
    queryKey: ["admin", "archive-count"],
    queryFn: () => getArchiveCount(),
    enabled: isAdmin,
    refetchInterval: 30_000,
  });

  const detailQ = useQuery({
    queryKey: ["admin", "application", selectedId],
    queryFn: () => getApplicationAdminDetail({ data: { id: selectedId! } }) as Promise<AdminDetail>,
    enabled: isAdmin && !!selectedId,
  });

  const selected = detailQ.data?.application ?? null;

  const updateM = useMutation({
    mutationFn: (data: {
      id: string;
      status: ApplicationStatus;
      admin_note?: string;
      public_message?: string;
      missing_public_requirements?: string;
    }) => updateApplicationStatus({ data }),
    onSuccess: async () => {
      toast.success("Dossier mis à jour");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin", "applications"] }),
        qc.invalidateQueries({ queryKey: ["admin", "archives"] }),
        qc.invalidateQueries({ queryKey: ["admin", "application", selectedId] }),
      ]);
    },
    onError: () => toast.error("Impossible de mettre à jour le dossier"),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (appsQ.data ?? []).filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      return [
        a.reference,
        a.email,
        a.first_name,
        a.last_name,
        programLabel(a.program),
        a.country_of_residence ?? a.country,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [appsQ.data, query, statusFilter]);

  const dashboard = useMemo(() => {
    const list = appsQ.data ?? [];
    const today = startOfDay().getTime();
    const verificationStatuses = ["dossier_en_verification", "documents_a_completer", "complement_requis"];
    const approvedStatuses = ["approuvee", "acceptee", "virement_en_preparation", "terminee"];
    const priorityStatuses = ["nouvelle_demande", "documents_a_completer", "complement_requis", "contrat_en_preparation", "contrat_a_valider"];

    const totalAmount = list.reduce((sum, app) => sum + (Number(app.amount) || 0), 0);
    const baseCurrency = list[0]?.currency ?? "EUR";
    const mixedCurrencies = list.some((a) => a.currency !== baseCurrency);

    const last30 = Array.from({ length: 30 }, (_, index) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (29 - index));
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return {
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        value: list.filter((a) => {
          const ts = new Date(a.created_at).getTime();
          return ts >= d.getTime() && ts < next.getTime();
        }).length,
      };
    });

    const byStatus = APPLICATION_STATUSES
      .map((status) => ({ name: statusLabel(status), value: list.filter((a) => a.status === status).length }))
      .filter((item) => item.value > 0);

    const byProgram = Object.entries(
      list.reduce<Record<string, number>>((acc, app) => {
        acc[app.program] = (acc[app.program] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([program, value]) => ({ name: programLabel(program), value }));

    return {
      total: list.length,
      today: list.filter((a) => new Date(a.created_at).getTime() >= today).length,
      verification: list.filter((a) => verificationStatuses.includes(a.status)).length,
      analysis: list.filter((a) => a.status === "en_analyse").length,
      documents: list.filter((a) => ["documents_a_completer", "complement_requis"].includes(a.status)).length,
      approved: list.filter((a) => approvedStatuses.includes(a.status)).length,
      refused: list.filter((a) => a.status === "refusee").length,
      totalAmount,
      baseCurrency,
      mixedCurrencies,
      last30,
      byStatus,
      byProgram,
      priority: list.filter((a) => priorityStatuses.includes(a.status)).slice(0, 6),
      recent: [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 6),
    };
  }, [appsQ.data]);

  const signOut = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/auth" });
  };

  const openDetail = (id: string) => {
    setSelectedId(id);
    setShowBank(false);
    setPublicMessage("");
    setInternalNote("");
    setMissingRequirements("");
  };

  const changeView = (view: "active" | "archives") => {
    setSelectedId(null);
    setAdminView(view);
  };

  const openPrivateFile = async (bucket: "application-documents" | "contracts", path: string) => {
    try {
      const { url } = await createAdminSignedUrl({ data: { bucket, path } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Impossible d'ouvrir ce fichier");
    }
  };

  if (meQ.isPending) return <CenteredLoader />;

  if (!isAdmin) {
    return (
      <PageLayout>
        <div className="container-page py-20">
          <div className="surface-card mx-auto max-w-lg p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-xl font-semibold">Accès refusé</h1>
            <p className="mt-2 text-sm text-muted-foreground">Ce compte ne dispose pas du rôle administrateur.</p>
            <Button className="mt-6 rounded-full" onClick={signOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <main className="container-page py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Virelia Crédit</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              {adminView === "active" ? "Tableau de bord" : "Archives"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {adminView === "active"
                ? "Pilotage des demandes actives, priorités, documents privés et suivi client."
                : "Dossiers retirés du tableau de bord actif, toujours consultables et restaurables."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={adminView === "active" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => changeView("active")}
            >
              <BarChart3 className="mr-2 h-4 w-4" /> Dossiers actifs
            </Button>
            <Button
              variant={adminView === "archives" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => changeView("archives")}
            >
              <Archive className="mr-2 h-4 w-4" /> Archives ({archiveCountQ.data?.count ?? 0})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => void Promise.all([
                appsQ.refetch(),
                archiveCountQ.refetch(),
                qc.invalidateQueries({ queryKey: ["admin", "archives"] }),
              ])}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${appsQ.isFetching ? "animate-spin" : ""}`} /> Actualiser
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </div>

        {adminView === "active" ? (
          <>
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={BarChart3} label="Dossiers actifs" value={dashboard.total} hint={`${dashboard.today} nouvelle(s) aujourd’hui`} />
              <MetricCard icon={Clock3} label="À étudier" value={dashboard.verification + dashboard.analysis} hint={`${dashboard.verification} en vérification · ${dashboard.analysis} en analyse`} />
              <MetricCard icon={FileClock} label="Documents à compléter" value={dashboard.documents} hint="Dossiers nécessitant une action client" />
              <MetricCard icon={CircleDollarSign} label="Montant actif demandé" value={dashboard.mixedCurrencies ? "Multi-devise" : formatAmount(dashboard.totalAmount, dashboard.baseCurrency)} hint={`${dashboard.approved} approuvée(s) · ${dashboard.refused} refusée(s)`} />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
              <ChartCard title="Demandes actives sur les 30 derniers jours" subtitle="Volume réel des dossiers actifs créés">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={dashboard.last30} margin={{ left: -20, right: 8, top: 10 }}>
                    <defs>
                      <linearGradient id="vireliaArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" name="Demandes" stroke="var(--primary)" fill="url(#vireliaArea)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Répartition par statut" subtitle="Dossiers actifs actuellement présents">
                {dashboard.byStatus.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={dashboard.byStatus} layout="vertical" margin={{ left: 4, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.25} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Dossiers" fill="var(--primary)" radius={[0, 5, 5, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </ChartCard>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Panel title="À traiter en priorité" icon={AlertCircle}>
                {dashboard.priority.length ? dashboard.priority.map((a) => (
                  <button key={a.id} type="button" onClick={() => openDetail(a.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-3 text-left transition hover:bg-muted/35">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{a.first_name} {a.last_name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.reference} · {programLabel(a.program)}</p>
                    </div>
                    <Badge className={`shrink-0 border-0 ${statusTone(a.status)}`}>{statusLabel(a.status)}</Badge>
                  </button>
                )) : <p className="text-sm text-muted-foreground">Aucun dossier prioritaire pour le moment.</p>}
              </Panel>

              <Panel title="Activité récente" icon={TrendingUp}>
                {dashboard.recent.length ? dashboard.recent.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 border-b border-border/70 py-3 last:border-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">Nouvelle demande · {a.first_name} {a.last_name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("fr-FR")}</p>
                    </div>
                    <button type="button" className="text-xs font-semibold text-primary" onClick={() => openDetail(a.id)}>Ouvrir</button>
                  </div>
                )) : <p className="text-sm text-muted-foreground">Aucune activité récente.</p>}
              </Panel>
            </div>

            <ChartCard className="mt-4" title="Types de prêts" subtitle="Répartition réelle des solutions demandées sur les dossiers actifs">
              {dashboard.byProgram.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dashboard.byProgram} margin={{ left: 0, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Demandes" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </ChartCard>

            <section className="surface-card mt-6 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
                <div>
                  <h2 className="font-semibold">Demandes actives</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Recherche, filtre, ouverture et archivage des dossiers actifs.</p>
                </div>
                <div className="flex min-w-full flex-1 flex-wrap gap-3 lg:min-w-0 lg:max-w-3xl lg:justify-end">
                  <div className="relative min-w-64 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Référence, nom, e-mail, pays, solution…" className="pl-9" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      {APPLICATION_STATUSES.map((status) => <SelectItem key={status} value={status}>{statusLabel(status)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Référence</th><th className="px-4 py-3">Demandeur</th>
                      <th className="px-4 py-3">Solution</th><th className="px-4 py-3">Montant</th>
                      <th className="px-4 py-3">Statut</th><th className="px-4 py-3">Date</th><th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {appsQ.isPending ? (
                      <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Aucune demande trouvée.</td></tr>
                    ) : filtered.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/25">
                        <td className="px-4 py-3 font-mono text-xs">{a.reference}</td>
                        <td className="px-4 py-3"><p className="font-medium">{a.first_name} {a.last_name}</p><p className="text-xs text-muted-foreground">{a.email}</p></td>
                        <td className="px-4 py-3">{programLabel(a.program)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatAmount(a.amount, a.currency)}</td>
                        <td className="px-4 py-3"><Badge className={`border-0 ${statusTone(a.status)}`}>{statusLabel(a.status)}</Badge></td>
                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openDetail(a.id)}>Ouvrir <ChevronRight className="ml-1 h-4 w-4" /></Button>
                            <ArchiveApplicationButton application={a} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <ArchivedApplicationsPanel onOpenDetail={openDetail} />
        )}
      </main>

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          {detailQ.isPending || !selected ? (
            <div className="py-16"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-3 text-xl">
                  {selected.first_name} {selected.last_name}
                  <Badge className={`border-0 ${statusTone(selected.status)}`}>{statusLabel(selected.status)}</Badge>
                  {selected.archived_at && <Badge variant="outline">Archivé</Badge>}
                </DialogTitle>
                <DialogDescription className="font-mono">{selected.reference}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 lg:grid-cols-2">
                <Section title="Informations personnelles">
                  <Info label="E-mail" value={selected.email} /><Info label="Téléphone" value={selected.phone} />
                  <Info label="Date de naissance" value={selected.birth_date} /><Info label="Nationalité" value={selected.nationality} />
                  <Info label="Pays de résidence" value={selected.country_of_residence ?? selected.country} /><Info label="Adresse" value={selected.address} />
                </Section>

                <Section title="Situation professionnelle">
                  <Info label="Situation" value={selected.employment_status ? EMPLOYMENT_LABELS[selected.employment_status] ?? selected.employment_status : "—"} />
                  {Object.entries(selected.employment_details ?? {}).map(([k, v]) => <Info key={k} label={k.replaceAll("_", " ")} value={String(v ?? "")} />)}
                  <Info label="Revenu mensuel" value={moneyOrDash(selected.income, selected.currency)} />
                  <Info label="Autres revenus" value={moneyOrDash(selected.other_income, selected.currency)} />
                  <Info label="Charges mensuelles" value={moneyOrDash(selected.monthly_charges, selected.currency)} />
                </Section>

                <Section title="Demande">
                  <Info label="Type de prêt" value={programLabel(selected.program)} /><Info label="Montant" value={formatAmount(selected.amount, selected.currency)} />
                  <Info label="Durée" value={selected.duration_months ? `${selected.duration_months} mois` : "—"} />
                  <Info label="Délai demandé" value={selected.processing_speed} /><Info label="Frais de traitement" value={moneyOrDash(selected.processing_fee, selected.currency)} />
                  <div className="sm:col-span-2"><Info label="Objet du prêt" value={selected.purpose} /></div>
                </Section>

                <Section title="Coordonnées bancaires" action={
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowBank((v) => !v)}>
                    {showBank ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}{showBank ? "Masquer" : "Afficher"}
                  </Button>
                }>
                  {detailQ.data?.bank ? <>
                    <Info label="Banque" value={detailQ.data.bank.bank_name} /><Info label="Titulaire" value={detailQ.data.bank.account_holder_name} />
                    <Info label="IBAN / compte" value={showBank ? detailQ.data.bank.iban_account_number : maskIban(detailQ.data.bank.iban_account_number)} />
                    <Info label="BIC / SWIFT" value={showBank ? detailQ.data.bank.swift_bic : detailQ.data.bank.swift_bic ? "••••••••" : "—"} />
                  </> : <p className="text-sm text-muted-foreground">Aucune coordonnée bancaire enregistrée.</p>}
                </Section>
              </div>

              <Section title="Documents et projet de contrat">
                {parseDocuments(selected.documents).map((doc) => doc.path ? (
                  <Button key={doc.path} variant="outline" size="sm" onClick={() => void openPrivateFile("application-documents", doc.path!)}>
                    <FileText className="mr-2 h-4 w-4" />{doc.filename || doc.key || "Document"}
                  </Button>
                ) : null)}
                {selected.contract_path && (
                  <Button variant="outline" size="sm" onClick={() => void openPrivateFile("contracts", selected.contract_path!)}>
                    <FileText className="mr-2 h-4 w-4" />Projet de contrat
                  </Button>
                )}
                {!selected.contract_path && parseDocuments(selected.documents).length === 0 && <p className="text-sm text-muted-foreground">Aucun fichier disponible.</p>}
              </Section>

              <ApplicationArchiveControls
                application={selected}
                onDone={() => setSelectedId(null)}
              />

              <div className="grid gap-5 lg:grid-cols-2">
                <Section title="Pilotage du dossier">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</label>
                  <Select value={selected.status} onValueChange={(v) => updateM.mutate({ id: selected.id, status: v as ApplicationStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{APPLICATION_STATUSES.map((s) => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}</SelectContent>
                  </Select>

                  <label className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message public au client</label>
                  <Textarea value={publicMessage} onChange={(e) => setPublicMessage(e.target.value)} placeholder={selected.public_message ?? "Message visible dans le suivi client"} rows={3} />

                  <label className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Éléments publics à compléter</label>
                  <Textarea value={missingRequirements} onChange={(e) => setMissingRequirements(e.target.value)} placeholder={selected.missing_public_requirements ?? "Informations ou documents à fournir"} rows={2} />

                  <label className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Note interne</label>
                  <Textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder={selected.admin_note ?? "Jamais visible côté client"} rows={3} />

                  <Button className="mt-2" disabled={updateM.isPending} onClick={() => updateM.mutate({
                    id: selected.id,
                    status: selected.status as ApplicationStatus,
                    public_message: publicMessage || selected.public_message || "",
                    missing_public_requirements: missingRequirements || selected.missing_public_requirements || "",
                    admin_note: internalNote || selected.admin_note || "",
                  })}>Enregistrer les messages</Button>
                </Section>

                <Section title="Historique d'avancement">
                  <div className="space-y-3 sm:col-span-2">
                    {(detailQ.data?.history ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Aucun historique.</p> : detailQ.data!.history.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">{statusLabel(item.status)}</Badge><span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("fr-FR")}</span></div>
                        {item.public_message && <p className="mt-2 text-sm">{item.public_message}</p>}
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

function CenteredLoader() {
  return <PageLayout><div className="container-page py-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div></PageLayout>;
}

function MetricCard({ icon: Icon, label, value, hint }: { icon: typeof BarChart3; label: string; value: ReactNode; hint: string }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p></div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle: string; children: ReactNode; className?: string }) {
  return <section className={`surface-card p-5 ${className}`}><div className="mb-5"><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div>{children}</section>;
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof AlertCircle; children: ReactNode }) {
  return <section className="surface-card p-5"><div className="mb-4 flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /><h2 className="font-semibold">{title}</h2></div><div className="space-y-2">{children}</div></section>;
}

function EmptyChart() {
  return <div className="grid h-[220px] place-items-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">Aucune donnée à afficher.</div>;
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl border border-border bg-card p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2>{action}</div><div className="grid gap-3 sm:grid-cols-2">{children}</div></section>;
}

function Info({ label, value }: { label: string; value: unknown }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm">{value == null || value === "" ? "—" : String(value)}</p></div>;
}

function formatAmount(amount: number, currency: string) {
  try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount); }
  catch { return `${amount} ${currency}`; }
}

function moneyOrDash(value: number | null | undefined, currency: string) {
  return value == null ? "—" : formatAmount(value, currency);
}
