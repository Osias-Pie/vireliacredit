import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Copy, Download, FileSearch2, Files, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/context";
import { useAssistantContext } from "@/components/assistant/VireliaAssistant";
import { getApplicationContractDownloads } from "@/lib/applications.functions";

const TRACKING_PREFILL_KEY = "virelia.tracking.prefill";

type DownloadLinks = {
  structuredUrl: string | null;
  narrativeUrl: string | null;
  expiresInSeconds: number;
};

export const Route = createFileRoute("/confirmation")({
  validateSearch: (s: Record<string, unknown>) => ({
    ref: typeof s.ref === "string" ? s.ref : undefined,
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { ref } = Route.useSearch();
  const { t } = useI18n();
  const assistant = useAssistantContext();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [links, setLinks] = useState<DownloadLinks | null>(null);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [contractError, setContractError] = useState("");

  useEffect(() => {
    assistant?.setContext({ page: "confirmation", reference: ref });
  }, [assistant, ref]);

  useEffect(() => {
    if (!ref || typeof window === "undefined") return;
    try {
      const current = JSON.parse(window.sessionStorage.getItem(TRACKING_PREFILL_KEY) || "{}") as {
        reference?: string;
        email?: string;
      };
      if (current.email) setEmail(current.email);
      window.sessionStorage.setItem(
        TRACKING_PREFILL_KEY,
        JSON.stringify({ reference: ref, email: current.email || "" }),
      );
    } catch {
      window.sessionStorage.setItem(TRACKING_PREFILL_KEY, JSON.stringify({ reference: ref, email: "" }));
    }
  }, [ref]);

  async function copyReference() {
    if (!ref || typeof navigator === "undefined") return;
    await navigator.clipboard.writeText(ref);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function loadContracts() {
    if (!ref || !email.trim()) return;
    setContractError("");
    setLoadingContracts(true);
    try {
      const result = await getApplicationContractDownloads({
        data: { reference: ref, email: email.trim() },
      });
      if (!result || (!result.structuredUrl && !result.narrativeUrl)) {
        setLinks(null);
        setContractError("Impossible de retrouver les contrats avec cette référence et cette adresse e-mail.");
        return;
      }
      setLinks(result);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          TRACKING_PREFILL_KEY,
          JSON.stringify({ reference: ref, email: email.trim() }),
        );
      }
    } catch {
      setLinks(null);
      setContractError("Les contrats ne peuvent pas être préparés pour le téléchargement actuellement. Réessayez dans un instant.");
    } finally {
      setLoadingContracts(false);
    }
  }

  async function downloadSigned(url: string, filename: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("download_failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  async function downloadOne(kind: "structured" | "narrative") {
    const url = kind === "structured" ? links?.structuredUrl : links?.narrativeUrl;
    if (!url) return;
    try {
      await downloadSigned(
        url,
        kind === "structured"
          ? `Virelia-${ref || "contrat"}-structure.pdf`
          : `Virelia-${ref || "contrat"}-narratif.pdf`,
      );
    } catch {
      setContractError("Le lien de téléchargement a expiré. Préparez de nouveau les contrats.");
      setLinks(null);
    }
  }

  async function downloadBoth() {
    if (!links?.structuredUrl || !links.narrativeUrl) return;
    try {
      await downloadSigned(links.structuredUrl, `Virelia-${ref || "contrat"}-structure.pdf`);
      await downloadSigned(links.narrativeUrl, `Virelia-${ref || "contrat"}-narratif.pdf`);
    } catch {
      setContractError("Un des liens de téléchargement a expiré. Préparez de nouveau les contrats.");
      setLinks(null);
    }
  }

  return (
    <PageLayout>
      <section className="container-page py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl"
        >
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-gold/35 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{t("confirmation.title")}</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Votre dossier est enregistré. Conservez votre référence : elle est nécessaire avec votre adresse e-mail pour suivre l’avancement et accéder aux documents privés.
            </p>
          </div>

          {ref && (
            <div className="mt-9 overflow-hidden rounded-3xl border border-gold/35 bg-primary/5 p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <FileSearch2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Votre référence</p>
                  <p className="mt-2 break-all font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{ref}</p>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    <strong className="text-foreground">Conservez cette référence.</strong> Elle sera nécessaire avec l’adresse e-mail utilisée lors de votre demande.
                  </p>
                  <Button type="button" variant="outline" className="mt-5 rounded-full border-gold/40" onClick={() => void copyReference()}>
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Référence copiée" : "Copier la référence"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-7 rounded-3xl border border-gold/30 bg-card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <Files className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div>
                <h2 className="font-semibold">Télécharger mon contrat</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Les deux versions sont privées. Confirmez l’adresse e-mail utilisée lors de la demande pour générer des liens temporaires.
                </p>
              </div>
            </div>

            {!links ? (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Label htmlFor="contract-email">Adresse e-mail de la demande</Label>
                  <Input
                    id="contract-email"
                    className="mt-1.5"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </div>
                <Button type="button" className="rounded-full" onClick={() => void loadContracts()} disabled={!email.trim() || loadingContracts}>
                  {loadingContracts && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Préparer les téléchargements
                </Button>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Button type="button" variant="outline" className="h-auto min-h-12 rounded-2xl border-gold/40" onClick={() => void downloadOne("structured")} disabled={!links.structuredUrl}>
                  <Download className="mr-2 h-4 w-4" /> Version structurée
                </Button>
                <Button type="button" variant="outline" className="h-auto min-h-12 rounded-2xl border-gold/40" onClick={() => void downloadOne("narrative")} disabled={!links.narrativeUrl}>
                  <Download className="mr-2 h-4 w-4" /> Version narrative
                </Button>
                <Button type="button" className="h-auto min-h-12 rounded-2xl" onClick={() => void downloadBoth()} disabled={!links.structuredUrl || !links.narrativeUrl}>
                  <Files className="mr-2 h-4 w-4" /> Télécharger les deux
                </Button>
              </div>
            )}
            {contractError && <p className="mt-3 text-sm font-medium text-destructive">{contractError}</p>}
            {links && (
              <p className="mt-3 text-xs text-muted-foreground">
                Ces liens sont temporaires. Vous pourrez les régénérer en vérifiant de nouveau votre référence et votre e-mail.
              </p>
            )}
          </div>

          <div className="mt-7 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Pour suivre votre demande</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Utilisez uniquement votre référence <strong className="text-foreground">VIR-…</strong> et votre adresse e-mail. Aucune coordonnée bancaire n’est nécessaire sur la page de suivi.
            </p>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full">
              <Link to="/suivi">{t("confirmation.track")}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-gold/40">
              <Link to="/">{t("cta.back_home")}</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </PageLayout>
  );
}
