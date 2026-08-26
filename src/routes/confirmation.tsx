import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Copy, FileSearch2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { useAssistantContext } from "@/components/assistant/VireliaAssistant";

const TRACKING_PREFILL_KEY = "virelia.tracking.prefill";

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
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("confirmation.title")}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Votre dossier est enregistré. La prochaine étape consiste à conserver votre référence afin de pouvoir suivre son avancement en toute sécurité.
            </p>
          </div>

          {ref && (
            <div className="mt-9 overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(145deg,rgba(21,94,239,0.08),rgba(255,255,255,0.94))] p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <FileSearch2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Votre référence
                  </p>
                  <p className="mt-2 break-all font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {ref}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    <strong className="text-foreground">Conservez cette référence.</strong> Elle sera nécessaire avec l’adresse e-mail utilisée lors de votre demande pour consulter l’avancement du dossier.
                  </p>
                  <Button type="button" variant="outline" className="mt-5 rounded-full" onClick={() => void copyReference()}>
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Référence copiée" : "Copier la référence"}
                  </Button>
                </div>
              </div>
            </div>
          )}

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
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/">{t("cta.back_home")}</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </PageLayout>
  );
}
