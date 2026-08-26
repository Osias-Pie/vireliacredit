import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { useAssistantContext } from "@/components/assistant/VireliaAssistant";

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

  useEffect(() => {
    assistant?.setContext({
      page: "confirmation",
      reference: ref,
    });
  }, [assistant, ref]);

  return (
    <PageLayout>
      <section className="container-page py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-xl text-center"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("confirmation.title")}
          </h1>

          {ref && (
            <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {t("confirmation.reference")}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">{ref}</p>
              <p className="mt-3 text-sm text-muted-foreground">{t("confirmation.keep_ref")}</p>
            </div>
          )}

          <p className="mt-8 text-sm font-medium">{t("confirmation.help")}</p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
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
