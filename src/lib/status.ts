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

/** Statuses differ through label and intensity while staying inside the official blue / gold / white palette. */
export const STATUS_TONE: Record<ApplicationStatus, string> = {
  nouvelle_demande: "bg-primary/10 text-primary dark:bg-white/10 dark:text-white",
  dossier_en_verification: "bg-primary/12 text-primary dark:bg-white/12 dark:text-white",
  documents_a_completer: "bg-gold/15 text-foreground dark:text-gold",
  complement_requis: "bg-gold/18 text-foreground dark:text-gold",
  en_analyse: "bg-primary/14 text-primary dark:bg-white/14 dark:text-white",
  contrat_en_preparation: "bg-primary/16 text-primary dark:bg-white/16 dark:text-white",
  contrat_a_valider: "bg-gold/15 text-foreground dark:text-gold",
  approuvee: "bg-gold/22 text-foreground dark:text-gold",
  acceptee: "bg-gold/22 text-foreground dark:text-gold",
  virement_en_preparation: "bg-gold/18 text-foreground dark:text-gold",
  terminee: "bg-gold/25 text-foreground dark:text-gold",
  refusee: "border border-gold/45 bg-transparent text-foreground dark:text-white",
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
