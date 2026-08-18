import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { Hero } from "@/components/sections/Hero";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { LoanSimulator } from "@/components/sections/LoanSimulator";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { Transparency } from "@/components/sections/Transparency";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTABand } from "@/components/sections/CTABand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Virelia Crédit — Solutions de prêt remboursable en Europe et au Canada" },
      {
        name: "description",
        content:
          "Simulez votre prêt remboursable, vérifiez votre éligibilité et déposez votre demande en ligne. Conditions présentées marché par marché, sans montant caché.",
      },
      { property: "og:title", content: "Virelia Crédit — Solutions de prêt remboursable" },
      {
        property: "og:description",
        content:
          "Simulateur de prêt, conditions par marché et demande en ligne étudiée au cas par cas.",
      },
      { property: "og:url", content: "https://vireliacredit.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://vireliacredit.lovable.app/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <PageLayout>
      <Hero />
      <Stats />
      <ProgramsSection compact />
      <LoanSimulator />
      <WhyChoose />
      <ProcessTimeline />
      <Transparency />
      <Testimonials />
      <FAQSection compact />
      <CTABand />
    </PageLayout>
  );
}
