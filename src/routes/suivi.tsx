import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Files, Info, Loader2, SearchCheck } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/context";
import { getApplicationTracking, type TrackingResult } from "@/lib/tracking.functions";
import { getApplicationContractDownloads } from "@/lib/applications.functions";
import { TRACKING_STAGES, trackingStageIndex, isKnownStatus } from "@/lib/status";
import { useAssistantContext } from "@/components/assistant/VireliaAssistant";
import { formatMoney } from "@/config/loans";

const TRACKING_PREFILL_KEY = "virelia.tracking.prefill";

type DownloadLinks = {
  structuredUrl: string | null;
  narrativeUrl: string | null;
  expiresInSeconds: number;
};

export const Route = createFileRoute("/suivi")({
  component: TrackingPage,
});

function TrackingPage() {
  const { t, locale } = useI18n();
  const assistant = useAssistantContext();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [file, setFile] = useState<TrackingResult | null>(null);
  const [contractLinks, setContractLinks] = useState<DownloadLinks | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(TRACKING_PREFILL_KEY) || "{}") as {
        reference?: string;
        email?: string;
      };
      if (saved.reference) setReference(saved.reference);
      if (saved.email) setEmail(saved.email);
    } catch {
      // A malformed session value must never block the tracking form.
    }
  }, []);

  useEffect(() => {
    if (!file) {
      assistant?.setContext({ page: "tracking" });
      return;
    }
    assistant?.setContext({
      page: "tracking",
      reference: file.reference,
      status: file.status,
      public_messages: file.history.map((h) => h.public_message).filter((m): m is string => Boolean(m)),
      missing_public_requirements: file.missing_public_requirements ?? undefined,
    });
  }, [assistant, file]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setContractLinks(null);
    setContractError("");
    setLoading(true);
    try {
      const res = await getApplicationTracking({ data: { reference: reference.trim(), email: email.trim() } });
      if (!res) {
        setFile(null);
        setError(true);
      } else {
        setFile(res);
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            TRACKING_PREFILL_KEY,
            JSON.stringify({ reference: res.reference, email: email.trim() }),
          );
        }
      }
    } catch {
      setFile(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function prepareContracts() {
    if (!file) return;
    setContractError("");
    setContractLoading(true);
    try {
      const result = await getApplicationContractDownloads({
        data: { reference: file.reference, email: email.trim() },
      });
      if (!result || (!result.structuredUrl && !result.narrativeUrl)) {
        setContractError(t("track.contracts.unavailable"));
        return;
      }
      setContractLinks(result);
    } catch {
      setContractError(t("track.contracts.prepare_error"));
    } finally {
      setContractLoading(false);
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

  async function downloadContract(kind: "structured" | "narrative") {
    const url = kind === "structured" ? contractLinks?.structuredUrl : contractLinks?.narrativeUrl;
    if (!url || !file) return;
    try {
      await downloadSigned(
        url,
        kind === "structured"
          ? `Virelia-${file.reference}-structured.pdf`
          : `Virelia-${file.reference}-narrative.pdf`,
      );
    } catch {
      setContractLinks(null);
      setContractError(t("track.contracts.expired"));
    }
  }

  async function downloadBoth() {
    if (!file || !contractLinks?.structuredUrl || !contractLinks.narrativeUrl) return;
    try {
      await downloadSigned(contractLinks.structuredUrl, `Virelia-${file.reference}-structured.pdf`);
      await downloadSigned(contractLinks.narrativeUrl, `Virelia-${file.reference}-narrative.pdf`);
    } catch {
      setContractLinks(null);
      setContractError(t("track.contracts.one_expired"));
    }
  }

  const stageIdx = file ? trackingStageIndex(file.status) : 0;
  const publicMessages = file?.history.filter((h) => h.public_message) ?? [];

  return (
    <PageLayout>
      <section className="py-14 sm:py-20">
        <div className="container-page max-w-3xl">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-gold/35 bg-primary text-primary-foreground">
              <SearchCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{t("track.title")}</h1>
            <p className="mt-3 text-muted-foreground">{t("track.subtitle")}</p>
          </div>

          <form onSubmit={onSubmit} className="surface-card mx-auto mt-8 max-w-2xl space-y-5 p-5 sm:p-8">
            <div>
              <Label>{t("track.reference")}</Label>
              <Input
                className="mt-1.5 font-mono"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="VIR-2026-XXXXXX"
                autoComplete="off"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">{t("track.reference_hint")}</p>
            </div>
            <div>
              <Label>{t("track.email")}</Label>
              <Input className="mt-1.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <p className="mt-1.5 text-xs text-muted-foreground">{t("track.email_hint")}</p>
            </div>
            <Button type="submit" className="rounded-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("track.cta")}
            </Button>
            {error && (
              <div className="rounded-xl border border-gold/35 bg-gold/10 p-4 text-sm">
                <p className="font-medium text-foreground">{t("track.not_found.title")}</p>
                <p className="mt-1 text-muted-foreground">{t("track.not_found.text")}</p>
              </div>
            )}
          </form>

          <div className="mx-auto mt-4 flex max-w-2xl items-start gap-2 rounded-xl bg-muted/45 p-3 text-xs leading-5 text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            {t("track.security")}
          </div>

          {file && (
            <div className="mx-auto mt-8 max-w-2xl space-y-6">
              <div className="surface-card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <InfoLine label={t("track.reference")} value={file.reference} />
                <InfoLine label={t("field.loan_type")} value={t(`product.${file.program}.title`)} />
                <InfoLine label={t("field.amount")} value={formatMoney(Number(file.amount) || 0, file.currency, locale)} />
                <InfoLine label={t("field.currency")} value={file.currency} />
                <InfoLine label={t("track.requested_on")} value={new Date(file.created_at).toLocaleDateString(locale)} />
                <InfoLine label={t("track.current_status")} value={isKnownStatus(file.status) ? t(`application_status.${file.status}`) : file.status} />
              </div>

              <div className="surface-card p-5 sm:p-6">
                <h2 className="text-lg font-semibold">{t("track.timeline")}</h2>
                <ol className="mt-5 space-y-4">
                  {TRACKING_STAGES.map((stage, i) => {
                    const done = i < stageIdx || (i === stageIdx && file.status === "terminee");
                    const current = i === stageIdx && file.status !== "terminee";
                    return (
                      <li key={stage.id} className="flex items-center gap-3 text-sm">
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${current ? "border-gold bg-primary text-primary-foreground" : done ? "border-gold/40 bg-gold/10 text-foreground" : "border-border text-muted-foreground"}`}>
                          {done ? "✓" : i + 1}
                        </span>
                        <span className={current ? "font-semibold text-foreground" : "text-muted-foreground"}>{t(stage.labelKey)}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="surface-card p-5 sm:p-6">
                <h2 className="text-lg font-semibold">{t("track.messages")}</h2>
                {file.missing_public_requirements && (
                  <div className="mt-4 rounded-xl border border-gold/35 bg-gold/10 p-4 text-sm">
                    <p className="font-semibold">{t("track.requirements")}</p>
                    <p className="mt-1 text-muted-foreground">{file.missing_public_requirements}</p>
                  </div>
                )}
                {publicMessages.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">{t("track.no_messages")}</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {publicMessages.map((m, i) => (
                      <li key={i} className="rounded-xl border border-border bg-background p-4 text-sm">
                        {m.public_message}
                        <p className="mt-2 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString(locale)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="surface-card p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <Files className="mt-0.5 h-5 w-5 text-gold" />
                  <div>
                    <h2 className="text-lg font-semibold">{t("track.contracts.title")}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t("track.contracts.private")}</p>
                  </div>
                </div>
                {!contractLinks ? (
                  <Button type="button" className="mt-5 rounded-full" onClick={() => void prepareContracts()} disabled={contractLoading}>
                    {contractLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("track.contracts.prepare")}
                  </Button>
                ) : (
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Button variant="outline" className="border-gold/40" onClick={() => void downloadContract("structured")} disabled={!contractLinks.structuredUrl}>
                      <Download className="mr-2 h-4 w-4" /> {t("track.contracts.structured")}
                    </Button>
                    <Button variant="outline" className="border-gold/40" onClick={() => void downloadContract("narrative")} disabled={!contractLinks.narrativeUrl}>
                      <Download className="mr-2 h-4 w-4" /> {t("track.contracts.narrative")}
                    </Button>
                    <Button onClick={() => void downloadBoth()} disabled={!contractLinks.structuredUrl || !contractLinks.narrativeUrl}>
                      <Files className="mr-2 h-4 w-4" /> {t("track.contracts.both")}
                    </Button>
                  </div>
                )}
                {contractError && <p className="mt-3 text-sm text-destructive">{contractError}</p>}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
