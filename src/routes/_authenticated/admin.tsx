import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LogOut,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Loader2,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  APPLICATION_STATUSES,
  deleteApplication,
  getCurrentAdmin,
  listApplications,
  updateApplicationStatus,
  type ApplicationStatus,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  nouvelle_demande: "Nouvelle demande",
  en_analyse: "En analyse",
  complement_requis: "Complément requis",
  acceptee: "Acceptée",
  refusee: "Refusée",
  archivee: "Archivée",
};

const STATUS_TONE: Record<ApplicationStatus, string> = {
  nouvelle_demande: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  en_analyse: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  complement_requis: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  acceptee: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  refusee: "bg-red-500/10 text-red-600 dark:text-red-400",
  archivee: "bg-muted text-muted-foreground",
};

interface Application {
  id: string;
  reference: string;
  status: ApplicationStatus;
  last_name: string;
  first_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  profession: string;
  company: string | null;
  program: string;
  amount: number;
  currency: string;
  description: string;
  goals: string;
  admin_note: string | null;
  created_at: string;
  whatsapp: string | null;
  language: string | null;
  gender: string;
  birth_date: string;
  income: number | null;
}

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [selected, setSelected] = useState<Application | null>(null);
  const [toDelete, setToDelete] = useState<Application | null>(null);

  const meQ = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => getCurrentAdmin(),
  });

  const isAdmin = meQ.data?.isAdmin ?? false;

  const appsQ = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: () => listApplications() as Promise<Application[]>,
    enabled: isAdmin,
    refetchInterval: 30_000,
  });

  const updateM = useMutation({
    mutationFn: (v: { id: string; status: ApplicationStatus; admin_note?: string }) =>
      updateApplicationStatus({ data: v }),
    onSuccess: () => {
      toast.success("Demande mise à jour");
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erreur"),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => deleteApplication({ data: { id } }),
    onSuccess: () => {
      toast.success("Demande supprimée");
      setToDelete(null);
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erreur"),
  });

  const filtered = useMemo(() => {
    const list = appsQ.data ?? [];
    const q = query.trim().toLowerCase();
    return list.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.reference.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.last_name.toLowerCase().includes(q) ||
        a.first_name.toLowerCase().includes(q) ||
        a.program.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      );
    });
  }, [appsQ.data, query, statusFilter]);

  const counts = useMemo(() => {
    const list = appsQ.data ?? [];
    return {
      total: list.length,
      nouvelle: list.filter((a) => a.status === "nouvelle_demande").length,
      analyse: list.filter((a) => a.status === "en_analyse").length,
      acceptee: list.filter((a) => a.status === "acceptee").length,
    };
  }, [appsQ.data]);

  const signOut = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/auth" });
  };

  if (meQ.isPending) {
    return (
      <PageLayout>
        <div className="container-page py-24 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <div className="container-page py-20">
          <div className="mx-auto max-w-lg surface-card p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-xl font-semibold">Accès refusé</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre compte est connecté mais ne dispose pas du rôle administrateur. Contactez un
              super-administrateur pour obtenir les droits d'accès au dashboard.
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
      <div className="container-page py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestion des demandes reçues via le formulaire public.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => appsQ.refetch()}
              disabled={appsQ.isFetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${appsQ.isFetching ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total" value={counts.total} />
          <StatCard label="Nouvelles" value={counts.nouvelle} tone="blue" />
          <StatCard label="En analyse" value={counts.analyse} tone="amber" />
          <StatCard label="Acceptées" value={counts.acceptee} tone="emerald" />
        </div>

        <div className="mt-6 surface-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="relative flex-1 min-w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher (référence, nom, email, pays…)"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {APPLICATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">Demandeur</th>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appsQ.isPending ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      Aucune demande trouvée.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{a.reference}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {a.first_name} {a.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{a.email}</div>
                      </td>
                      <td className="px-4 py-3">{a.program}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Intl.NumberFormat("fr-FR").format(a.amount)} {a.currency}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`rounded-full border-0 ${STATUS_TONE[a.status]}`}>
                          {STATUS_LABEL[a.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => setSelected(a)}>
                          Détails <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>
                    {selected.first_name} {selected.last_name}
                  </span>
                  <Badge className={`rounded-full border-0 ${STATUS_TONE[selected.status]}`}>
                    {STATUS_LABEL[selected.status]}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="font-mono text-xs">
                  {selected.reference}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoLine icon={<Mail className="h-4 w-4" />} label="Email" value={selected.email} />
                <InfoLine icon={<Phone className="h-4 w-4" />} label="Téléphone" value={selected.phone} />
                <InfoLine icon={<MapPin className="h-4 w-4" />} label="Localisation" value={`${selected.city}, ${selected.country}`} />
                <InfoLine label="Profession" value={selected.profession + (selected.company ? ` — ${selected.company}` : "")} />
                <InfoLine label="Programme" value={selected.program} />
                <InfoLine label="Montant" value={`${new Intl.NumberFormat("fr-FR").format(selected.amount)} ${selected.currency}`} />
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</div>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm">{selected.description}</p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Objectifs</div>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm">{selected.goals}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Statut
                  </label>
                  <Select
                    value={selected.status}
                    onValueChange={(v) =>
                      updateM.mutate({ id: selected.id, status: v as ApplicationStatus })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Note administrateur
                </label>
                <Textarea
                  defaultValue={selected.admin_note ?? ""}
                  rows={3}
                  className="mt-1"
                  onBlur={(e) => {
                    if ((e.target.value ?? "") !== (selected.admin_note ?? "")) {
                      updateM.mutate({
                        id: selected.id,
                        status: selected.status,
                        admin_note: e.target.value,
                      });
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setToDelete(selected)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setSelected(null)}>
                  Fermer
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La demande {toDelete?.reference} sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && deleteM.mutate(toDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "blue" | "amber" | "emerald" }) {
  const toneCls =
    tone === "blue"
      ? "text-blue-600 dark:text-blue-400"
      : tone === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : tone === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-foreground";
  return (
    <div className="surface-card p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${toneCls}`}>{value}</div>
    </div>
  );
}

function InfoLine({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
