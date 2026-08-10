import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { CTABand } from "@/components/sections/CTABand";
import { useI18n } from "@/lib/i18n/context";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Solutions de prêt — Virelia Crédit" },
      {
        name: "description",
        content:
          "Prêt personnel, professionnel, entreprise, travaux, études ou projet : des prêts remboursables présentés avec leurs conditions par marché.",
      },
      { property: "og:title", content: "Solutions de prêt — Virelia Crédit" },
      {
        property: "og:description",
        content: "Six solutions de prêt remboursable, sans montant ni taux inventé.",
      },
      { property: "og:url", content: "https://vireliacredit.lovable.app/programs" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/programs" }],
  }),
  component: ProgramsPage,
});

function ProgramsPage() {
  const { t } = useI18n();
  return (
    <PageLayout>
      <div className="border-b border-border bg-surface">
        <div className="container-page py-14 text-center sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("solutions.title")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("solutions.subtitle")}</p>
        </div>
      </div>
      <ProgramsSection />
      <CTABand />
    </PageLayout>
  );
}
