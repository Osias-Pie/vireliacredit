import { createFileRoute } from "@tanstack/react-router";
import { SimplePage } from "@/components/layout/SimplePage";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { useI18n } from "@/lib/i18n/context";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "Processus de demande de prêt — Virelia Crédit" },
      {
        name: "description",
        content:
          "De la simulation au remboursement : les sept étapes d'une demande de prêt remboursable chez Virelia Crédit.",
      },
      { property: "og:title", content: "Processus de demande de prêt — Virelia Crédit" },
      {
        property: "og:description",
        content: "Simulation, éligibilité, demande, documents, étude, offre, décaissement.",
      },
      { property: "og:url", content: "https://vireliacredit.lovable.app/process" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/process" }],
  }),
  component: ProcessPage,
});

function ProcessPage() {
  const { t } = useI18n();
  return (
    <SimplePage title={t("process.title")} subtitle={t("process.subtitle")}>
      <ProcessTimeline />
    </SimplePage>
  );
}
