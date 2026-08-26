import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { Hero } from "@/components/sections/Hero";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { EligibilityCheck } from "@/components/sections/EligibilityCheck";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { Transparency } from "@/components/sections/Transparency";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTABand } from "@/components/sections/CTABand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virelia Crédit — Solutions de financement" },
      {
        name: "description",
        content:
          "Vérifiez votre éligibilité, déposez votre demande de prêt remboursable et suivez votre dossier en ligne.",
      },
      { property: "og:title", content: "Virelia Crédit — Solutions de financement" },
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
      <Testimonials />
      <FAQSection compact />
      <CTABand />
    </PageLayout>
  );
}
