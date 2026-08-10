import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { LoanSimulator } from "@/components/sections/LoanSimulator";
import { CTABand } from "@/components/sections/CTABand";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Simulateur de prêt — Virelia Crédit" },
      {
        name: "description",
        content:
          "Estimez votre mensualité, votre TAEG et le coût total de votre prêt remboursable selon votre pays de résidence.",
      },
      { property: "og:title", content: "Simulateur de prêt — Virelia Crédit" },
      {
        property: "og:description",
        content: "Mensualité, taux, frais et coût total estimés avant toute demande.",
      },
      { property: "og:url", content: "https://vireliacredit.lovable.app/simulator" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/simulator" }],
  }),
  component: () => (
    <PageLayout>
      <LoanSimulator />
      <CTABand />
    </PageLayout>
  ),
});
