import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";
import {
  getApplicationTracking,
  type TrackingResult,
} from "@/lib/tracking.functions";
import { TRACKING_STAGES, trackingStageIndex, isKnownStatus, STATUS_LABEL_FR } from "@/lib/status";
import { useAssistantContext } from "@/components/assistant/VireliaAssistant";
import { formatMoney } from "@/config/loans";

export const Route = createFileRoute("/suivi")({
  head: () => ({
    meta: [{ title: "Suivre ma demande — Virelia Crédit" }],
  }),
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

  useEffect(() => {
    if (!file) {
      assistant?.setContext({ page: "tracking" });
      return;
    }
    assistant?.setContext({
      page: "tracking",
      reference: file.reference,
      status: file.status,
      public_messages: file.history
        .map((h) => h.public_message)
        .filter((m): m is string => Boolean(m)),
      missing_public_requirements: file.missing_public_requirements ?? undefined,
    });
  }, [assistant, file]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      const res = await getApplicationTracking({
        data: { reference: reference.trim(), email: email.trim() },
      });
      if (!res) {
        setFile(null);
        setError(true);
      } else {
        setFile(res);
      }
    } catch {
      setFile(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const stageIdx = file ? trackingStageIndex(file.status) : 0;
  const publicMessages = file?.history.filter((h) => h.public_message) ?? [];

  return (
    <PageLayout>
      <section className="py-14 sm:py-20">
        <div className="container-page max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("track.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("track.subtitle")}</p>

          <form onSubmit={onSubmit} className="surface-card mt-8 space-y-4 p-5 sm:p-8">
            <div>
              <Label>{t("track.reference")}</Label>
              <Input className="mt-1.5" value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
            <div>
              <Label>{t("track.email")}</Label>
              <Input
                className="mt-1.5"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="rounded-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("track.cta")}
            </Button>
            {error && <p className="text-sm text-destructive">{t("track.error")}</p>}
          </form>

          {file && (
            <div className="mt-8 space-y-6">
              <div className="surface-card grid gap-3 p-5 sm:grid-cols-2">
                <Info label={t("track.reference")} value={file.reference} />
                <Info label={t("field.loan_type")} value={file.program} />
                <Info
                  label={t("field.amount")}
                  value={formatMoney(Number(file.amount) || 0, file.currency, locale)}
                />
                <Info label={t("field.currency")} value={file.currency} />
                <Info
                  label={t("track.requested_on")}
                  value={new Date(file.created_at).toLocaleDateString(locale)}
                />
                <Info
                  label={t("track.current_status")}
                  value={
                    isKnownStatus(file.status)
                      ? STATUS_LABEL_FR[file.status]
                      : file.status
                  }
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold">{t("track.timeline")}</h2>
                <ol className="mt-4 space-y-3">
                  {TRACKING_STAGES.map((stage, i) => {
                    const done = i < stageIdx || (i === stageIdx && file.status === "terminee");
                    const current = i === stageIdx && file.status !== "terminee";
                    const mark = done ? "✓" : current ? "●" : "○";
                    return (
                      <li key={stage.id} className="flex items-center gap-3 text-sm">
                        <span className={current ? "text-primary" : "text-muted-foreground"}>{mark}</span>
                        <span className={current ? "font-medium" : ""}>
                          {t(stage.labelKey as TranslationKey)}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div>
                <h2 className="text-lg font-semibold">{t("track.messages")}</h2>
                {publicMessages.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">{t("track.no_messages")}</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {publicMessages.map((m, i) => (
                      <li key={i} className="rounded-xl border border-border bg-background p-3 text-sm">
                        {m.public_message}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(m.created_at).toLocaleString(locale)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
