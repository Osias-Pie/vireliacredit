import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { EligibilityCheck } from "@/components/sections/EligibilityCheck";
import { useAssistantContext } from "@/components/assistant/VireliaAssistant";
import { useI18n } from "@/lib/i18n/context";

export const Route = createFileRoute("/eligibility")({
  head: () => ({
    meta: [
      { title: "Éligibilité au prêt — Virelia Crédit" },
      {
        name: "description",
        content:
          "Vérifiez votre éligibilité en trois questions avant de déposer une demande de prêt remboursable.",
      },
    ],
  }),
  component: EligibilityPage,
});

function EligibilityPage() {
  const { t } = useI18n();
  const assistant = useAssistantContext();
  useEffect(() => {
    assistant?.setContext({ page: "eligibility" });
  }, [assistant]);

  return (
    <PageLayout>
      <div className="container-page pt-14">
        <h1 className="sr-only">{t("eligibility.title")}</h1>
      </div>
      <EligibilityCheck />
    </PageLayout>
  );
}
