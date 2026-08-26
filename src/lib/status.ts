export const APPLICATION_STATUSES = [
  "nouvelle_demande",
  "dossier_en_verification",
  "documents_a_completer",
  "complement_requis",
  "en_analyse",
  "contrat_en_preparation",
  "contrat_a_valider",
  "approuvee",
  "acceptee",
  "virement_en_preparation",
  "terminee",
  "refusee",
  "archivee",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABEL_FR: Record<ApplicationStatus, string> = {
  nouvelle_demande: "Nouvelle demande",
  dossier_en_verification: "Dossier en vérification",
  documents_a_completer: "Documents à compléter",
  complement_requis: "Complément requis",
  en_analyse: "En analyse",
  contrat_en_preparation: "Contrat en préparation",
  contrat_a_valider: "Contrat à valider",
  approuvee: "Approuvée",
  acceptee: "Acceptée",
  virement_en_preparation: "Virement en préparation",
  terminee: "Terminée",
  refusee: "Refusée",
  archivee: "Archivée",
};

export const STATUS_TONE: Record<ApplicationStatus, string> = {
  nouvelle_demande: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  dossier_en_verification: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  documents_a_completer: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  complement_requis: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  en_analyse: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  contrat_en_preparation: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  contrat_a_valider: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  approuvee: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  acceptee: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  virement_en_preparation: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  terminee: "bg-emerald-700/10 text-emerald-700 dark:text-emerald-300",
  refusee: "bg-red-500/10 text-red-600 dark:text-red-400",
  archivee: "bg-muted text-muted-foreground",
};

export const TRACKING_STAGES = [
  { id: "received", labelKey: "track.stage.received" as const, statuses: ["nouvelle_demande"] },
  {
    id: "verification",
    labelKey: "track.stage.verification" as const,
    statuses: ["dossier_en_verification", "documents_a_completer", "complement_requis"],
  },
  {
    id: "analysis",
    labelKey: "track.stage.analysis" as const,
    statuses: ["en_analyse"],
  },
  {
    id: "decision",
    labelKey: "track.stage.decision" as const,
    statuses: ["contrat_en_preparation", "contrat_a_valider", "approuvee", "acceptee", "refusee"],
  },
  {
    id: "followup",
    labelKey: "track.stage.followup" as const,
    statuses: ["virement_en_preparation", "terminee"],
  },
] as const;

export function trackingStageIndex(status: string): number {
  if (status === "refusee" || status === "archivee") return 3;
  const idx = TRACKING_STAGES.findIndex((s) => (s.statuses as readonly string[]).includes(status));
  return idx >= 0 ? idx : 0;
}

export function isKnownStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}
