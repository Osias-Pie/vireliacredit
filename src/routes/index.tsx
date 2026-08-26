import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { Hero } from "@/components/sections/Hero";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { EligibilityCheck } from "@/components/sections/EligibilityCheck";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { Transparency } from "@/components/sections/Transparency";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTABand } from "@/components/sections/CTABand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virelia Crédit — Solutions de prêt remboursable" },
      {
        name: "description",
        content:
          "Vérifiez votre éligibilité et déposez votre demande de prêt remboursable en ligne. Chaque dossier est étudié individuellement.",
      },
      { property: "og:title", content: "Virelia Crédit — Solutions de prêt remboursable" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <PageLayout>
      <Hero />
      <ProgramsSection compact />
      <EligibilityCheck />
      <ProcessTimeline />
      <Transparency />
      <WhyChoose />
      <FAQSection compact />
      <CTABand />
    </PageLayout>
  );
}
