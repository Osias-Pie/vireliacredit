import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import {
  APPLICATION_STATUSES,
  createAdminSignedUrl,
  getApplicationAdminDetail,
  getCurrentAdmin,
  listApplications,
  updateApplicationStatus,
  type ApplicationStatus,
} from "@/lib/admin.functions";
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

function statusLabel(status: string) {
  return STATUS_LABEL_FR[status as ApplicationStatus] ?? status.replaceAll("_", " ");
}

function statusTone(status: string) {
  return STATUS_TONE[status as ApplicationStatus] ?? "bg-muted text-muted-foreground";
}

function maskIban(value: string) {
  const compact = value.replace(/\s+/g, "");
  const last = compact.slice(-4);
  return `**** **** **** ${last || "****"}`;
}

function parseDocuments(value: unknown): Array<{ key?: string; filename?: string; path?: string }> {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is { key?: string; filename?: string; path?: string } =>
    Boolean(item && typeof item === "object"),
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
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
    queryFn: () => listApplications() as Promise<Application[]>,
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
      return [a.reference, a.email, a.first_name, a.last_name, a.program, a.country_of_residence ?? a.country]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [appsQ.data, query, statusFilter]);

  const counts = useMemo(() => {
    const list = appsQ.data ?? [];
    return {
      total: list.length,
      new: list.filter((a) => a.status === "nouvelle_demande").length,
      analysis: list.filter((a) => ["dossier_en_verification", "en_analyse"].includes(a.status)).length,
      approved: list.filter((a) => ["approuvee", "acceptee", "terminee"].includes(a.status)).length,
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
            <p className="mt-2 text-sm text-muted-foreground">
              Ce compte ne dispose pas du rôle administrateur.
            </p>
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
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Administration des demandes</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Dossiers, documents privés, suivi client et décisions administratives.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => appsQ.refetch()}>
              <RefreshCw className={`mr-2 h-4 w-4 ${appsQ.isFetching ? "animate-spin" : ""}`} /> Actualiser
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total" value={counts.total} />
          <StatCard label="Nouvelles" value={counts.new} />
          <StatCard label="En cours d'étude" value={counts.analysis} />
          <StatCard label="Approuvées / terminées" value={counts.approved} />
        </div>

        <section className="surface-card mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="relative min-w-64 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Référence, nom, e-mail, pays, solution…" className="pl-9" />
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
            <table className="w-full min-w-[860px] text-sm">
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
                    <td className="px-4 py-3">{a.program}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatAmount(a.amount, a.currency)}</td>
                    <td className="px-4 py-3"><Badge className={`border-0 ${statusTone(a.status)}`}>{statusLabel(a.status)}</Badge></td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => openDetail(a.id)}>Ouvrir <ChevronRight className="ml-1 h-4 w-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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
                  <Info label="Situation" value={selected.employment_status} />
                  {Object.entries(selected.employment_details ?? {}).map(([k, v]) => <Info key={k} label={k.replaceAll("_", " ")} value={String(v ?? "")} />)}
                  <Info label="Revenu mensuel" value={moneyOrDash(selected.income, selected.currency)} />
                  <Info label="Autres revenus" value={moneyOrDash(selected.other_income, selected.currency)} />
                  <Info label="Charges mensuelles" value={moneyOrDash(selected.monthly_charges, selected.currency)} />
                </Section>

                <Section title="Demande">
                  <Info label="Type de prêt" value={selected.program} /><Info label="Montant" value={formatAmount(selected.amount, selected.currency)} />
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

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl border border-border bg-card p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2>{action}</div><div className="grid gap-3 sm:grid-cols-2">{children}</div></section>;
}

function Info({ label, value }: { label: string; value: unknown }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm">{value == null || value === "" ? "—" : String(value)}</p></div>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return <div className="surface-card p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold text-primary">{value}</p></div>;
}

function formatAmount(amount: number, currency: string) {
  try { return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount); }
  catch { return `${amount} ${currency}`; }
}

function moneyOrDash(value: number | null | undefined, currency: string) {
  return value == null ? "—" : formatAmount(value, currency);
}
